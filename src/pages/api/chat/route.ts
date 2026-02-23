import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { redactText } from "@/lib/shield/advancedRedaction";
import { decrypt } from "@/lib/encryption";
import { limiter } from "@/lib/rateLimit";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1).max(10000),
  provider: z.enum(["OPENAI", "GEMINI", "ANTHROPIC"]),
  model: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Rate limiting
    await limiter.check(
      parseInt(process.env.RATE_LIMIT_MAX || "100"),
      req.headers["x-forwarded-for"] as string || "anonymous"
    );

    // Authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate input
    const body = chatSchema.parse(req.body);

    // Get user and tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get today's token usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userUsage = await prisma.tokenUsage.findUnique({
      where: {
        tenantId_userId_date: {
          tenantId: user.tenantId,
          userId: user.id,
          date: today,
        },
      },
    });

    const tokensUsedToday = userUsage?.tokensUsed || 0;

    // Check user daily limit
    if (tokensUsedToday >= user.dailyTokenLimit) {
      return res.status(429).json({
        error: "Daily token limit exceeded",
        limit: user.dailyTokenLimit,
        used: tokensUsedToday,
      });
    }

    // Check tenant budget
    const tenantUsage = await prisma.tokenUsage.aggregate({
      where: {
        tenantId: user.tenantId,
        date: today,
      },
      _sum: {
        tokensUsed: true,
      },
    });

    const tenantTokensUsed = tenantUsage._sum.tokensUsed || 0;

    if (tenantTokensUsed >= user.tenant.dailyTokenBudget) {
      return res.status(429).json({
        error: "Tenant daily budget exceeded",
        budget: user.tenant.dailyTokenBudget,
        used: tenantTokensUsed,
      });
    }

    // Run Shield redaction
    const redactionResult = redactText(body.message, user.tenant.customBlacklist);

    // Get API key for provider
    const apiKey = await prisma.aPIKey.findFirst({
      where: {
        tenantId: user.tenantId,
        provider: body.provider,
        isActive: true,
      },
    });

    if (!apiKey) {
      return res.status(400).json({ error: `No active API key found for ${body.provider}` });
    }

    const decryptedKey = decrypt(apiKey.encryptedKey);

    // Call AI provider
    let aiResponse = "";
    let tokensUsed = 0;

    switch (body.provider) {
      case "OPENAI":
        const openaiResponse = await callOpenAI(
          redactionResult.safeText,
          decryptedKey,
          body.model || "gpt-4"
        );
        aiResponse = openaiResponse.message;
        tokensUsed = openaiResponse.tokens;
        break;

      case "GEMINI":
        const geminiResponse = await callGemini(redactionResult.safeText, decryptedKey);
        aiResponse = geminiResponse.message;
        tokensUsed = geminiResponse.tokens;
        break;

      case "ANTHROPIC":
        const anthropicResponse = await callAnthropic(
          redactionResult.safeText,
          decryptedKey,
          body.model || "claude-3-sonnet-20240229"
        );
        aiResponse = anthropicResponse.message;
        tokensUsed = anthropicResponse.tokens;
        break;
    }

    // Calculate estimated cost (rough estimates)
    const costPerToken = {
      OPENAI: 0.00003,
      GEMINI: 0.0000125,
      ANTHROPIC: 0.000015,
    };
    const estimatedCostUSD = tokensUsed * costPerToken[body.provider];

    // Store based on promptStorageMode
    const auditData: any = {
      tenantId: user.tenantId,
      userId: user.id,
      provider: body.provider,
      tokensUsed,
      redactionCount: redactionResult.redactionCount,
      categoriesTriggered: redactionResult.categoriesTriggered,
      estimatedCostUSD,
    };

    if (user.tenant.promptStorageMode === "REDACTED_ONLY") {
      auditData.redactedPrompt = redactionResult.safeText;
    } else if (user.tenant.promptStorageMode === "FULL") {
      auditData.redactedPrompt = redactionResult.safeText;
      auditData.rawPrompt = body.message;
      auditData.aiResponse = aiResponse;
    }

    // Create audit log
    await prisma.auditLog.create({ data: auditData });

    // Update token usage
    await prisma.tokenUsage.upsert({
      where: {
        tenantId_userId_date: {
          tenantId: user.tenantId,
          userId: user.id,
          date: today,
        },
      },
      update: {
        tokensUsed: { increment: tokensUsed },
        redactionCount: { increment: redactionResult.redactionCount },
        requestCount: { increment: 1 },
      },
      create: {
        tenantId: user.tenantId,
        userId: user.id,
        date: today,
        tokensUsed,
        redactionCount: redactionResult.redactionCount,
        requestCount: 1,
      },
    });

    return res.status(200).json({
      message: aiResponse,
      shieldActive: true,
      redactions: redactionResult.redactionCount,
      categoriesTriggered: redactionResult.categoriesTriggered,
      tokensUsed,
      estimatedCost: estimatedCostUSD,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid request", details: error.errors });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

async function callOpenAI(
  prompt: string,
  apiKey: string,
  model: string
): Promise<{ message: string; tokens: number }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    message: data.choices[0]?.message?.content || "",
    tokens: data.usage?.total_tokens || 0,
  };
}

async function callGemini(
  prompt: string,
  apiKey: string
): Promise<{ message: string; tokens: number }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const message = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const tokens = Math.ceil(message.length / 4); // Rough estimate

  return { message, tokens };
}

async function callAnthropic(
  prompt: string,
  apiKey: string,
  model: string
): Promise<{ message: string; tokens: number }> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    message: data.content?.[0]?.text || "",
    tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
  };
}