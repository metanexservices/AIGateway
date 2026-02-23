import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, maskAPIKey } from "@/lib/encryption";
import { z } from "zod";

const apiKeySchema = z.object({
  provider: z.enum(["OPENAI", "GEMINI", "ANTHROPIC"]),
  apiKey: z.string().min(10),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const tenantId = session.user.tenantId;

    // GET - List all API keys (masked)
    if (req.method === "GET") {
      const keys = await prisma.aPIKey.findMany({
        where: { tenantId },
        select: {
          id: true,
          provider: true,
          maskedKey: true,
          isActive: true,
          lastVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(keys);
    }

    // POST - Add new API key
    if (req.method === "POST") {
      const validation = apiKeySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { provider, apiKey } = validation.data;

      // Encrypt the key
      const encryptedKey = encrypt(apiKey);

      // Create masked version
      const maskedKey = maskAPIKey(apiKey);

      const newKey = await prisma.aPIKey.create({
        data: {
          provider,
          encryptedKey,
          maskedKey,
          tenantId,
          isActive: true,
        },
      });

      return res.status(201).json({
        id: newKey.id,
        provider: newKey.provider,
        maskedKey: newKey.maskedKey,
      });
    }

    // DELETE - Remove API key
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Key ID required" });
      }

      await prisma.aPIKey.deleteMany({
        where: {
          id,
          tenantId, // Ensure tenant isolation
        },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API Keys error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}