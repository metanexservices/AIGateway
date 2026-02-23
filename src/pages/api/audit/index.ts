import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const tenantId = session.user.tenantId;
    const { startDate, endDate, userId, provider } = req.query;

    // Build filter
    const where: any = { tenantId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    if (userId) where.userId = userId as string;
    if (provider) where.provider = provider as string;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 500, // Limit to last 500 logs
    });

    return res.status(200).json(logs);
  } catch (error: any) {
    console.error("Audit logs error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}