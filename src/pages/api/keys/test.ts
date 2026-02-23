import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Key ID required" });
    }

    const apiKey = await prisma.aPIKey.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    const decryptedKey = decrypt(apiKey.encryptedKey);

    // Test the key based on provider
    let isValid = false;
    let errorMessage = "";

    try {
      if (apiKey.provider === "OPENAI") {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${decryptedKey}` },
        });
        isValid = response.ok;
        if (!isValid) errorMessage = `OpenAI API returned ${response.status}`;
      } else if (apiKey.provider === "ANTHROPIC") {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": decryptedKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 10,
            messages: [{ role: "user", content: "test" }],
          }),
        });
        isValid = response.ok;
        if (!isValid) errorMessage = `Anthropic API returned ${response.status}`;
      } else if (apiKey.provider === "GEMINI") {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${decryptedKey}`
        );
        isValid = response.ok;
        if (!isValid) errorMessage = `Gemini API returned ${response.status}`;
      }
    } catch (err: any) {
      errorMessage = err.message;
    }

    // Update last verified timestamp
    if (isValid) {
      await prisma.aPIKey.update({
        where: { id },
        data: { lastVerified: new Date() },
      });
    }

    return res.status(200).json({
      valid: isValid,
      message: isValid ? "API key is valid" : errorMessage,
    });
  } catch (error: any) {
    console.error("API key test error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}