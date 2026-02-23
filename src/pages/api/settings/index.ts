import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().optional(),
  domain: z.string().optional(),
  primaryColor: z.string().optional(),
  dailyTokenBudget: z.number().int().positive().optional(),
  promptStorageMode: z.enum(["NONE", "REDACTED_ONLY", "FULL"]).optional(),
  customBlacklist: z.array(z.string()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const tenantId = session.user.tenantId;

    // GET - Retrieve tenant settings
    if (req.method === "GET") {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          name: true,
          domain: true,
          primaryColor: true,
          dailyTokenBudget: true,
          promptStorageMode: true,
          customBlacklist: true,
        },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      return res.status(200).json(tenant);
    }

    // PUT - Update tenant settings
    if (req.method === "PUT") {
      const validation = settingsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: validation.data,
      });

      return res.status(200).json({
        success: true,
        tenant: {
          name: updatedTenant.name,
          domain: updatedTenant.domain,
          primaryColor: updatedTenant.primaryColor,
        },
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Settings error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}