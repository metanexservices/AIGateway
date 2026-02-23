import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  department: z.string().optional(),
  dailyTokenLimit: z.number().int().positive(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const tenantId = session.user.tenantId;

    // GET - List all users in tenant
    if (req.method === "GET") {
      const users = await prisma.user.findMany({
        where: { tenantId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          dailyTokenLimit: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(users);
    }

    // POST - Create new user
    if (req.method === "POST") {
      const validation = userSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { email, name, password, role, department, dailyTokenLimit } = validation.data;

      // Check if user already exists in this tenant
      const existingUser = await prisma.user.findUnique({
        where: {
          email_tenantId: {
            email,
            tenantId,
          },
        },
      });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
          department,
          dailyTokenLimit,
          tenantId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          dailyTokenLimit: true,
        },
      });

      return res.status(201).json(newUser);
    }

    // DELETE - Remove user
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "User ID required" });
      }

      // Prevent deleting yourself
      if (id === session.user.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      await prisma.user.deleteMany({
        where: {
          id,
          tenantId, // Ensure tenant isolation
        },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Users API error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}