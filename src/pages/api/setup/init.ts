import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if tenant already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { domain: "shieldai.local" },
    });

    if (existingTenant) {
      return res.status(200).json({
        success: true,
        message: "Database already initialized",
        tenant: existingTenant.name,
      });
    }

    // Create default tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: "Shield AI Demo",
        domain: "shieldai.local",
        primaryColor: "#3b82f6",
        dailyTokenBudget: 1000000,
        promptStorageMode: "NONE",
        customBlacklist: ["Project Alpha", "Confidential"],
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create super admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@shieldai.local",
        name: "Super Admin",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        tenantId: tenant.id,
        department: "IT",
        dailyTokenLimit: 100000,
      },
    });

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: "user@shieldai.local",
        name: "Test User",
        password: hashedPassword,
        role: "USER",
        tenantId: tenant.id,
        department: "Engineering",
        dailyTokenLimit: 50000,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Database initialized successfully",
      credentials: {
        admin: {
          email: admin.email,
          password: "admin123",
          domain: tenant.domain,
        },
        user: {
          email: user.email,
          password: "admin123",
          domain: tenant.domain,
        },
      },
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    return res.status(500).json({
      error: error.message || "Database initialization failed",
    });
  }
}