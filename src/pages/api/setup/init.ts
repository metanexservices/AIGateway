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
      return res.status(400).json({ 
        error: "Database already initialized",
        message: "Tenant and users already exist. Try logging in with existing credentials."
      });
    }

    // Create default tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: "Shield AI Demo",
        domain: "shieldai.local",
        primaryColor: "#06b6d4",
        dailyTokenBudget: 1000000,
        promptStorageMode: "NONE",
        customBlacklist: ["Project Alpha", "Confidential"],
      },
    });

    // Create super admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
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
    const regularUser = await prisma.user.create({
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
      message: "Database initialized successfully!",
      tenant: {
        name: tenant.name,
        domain: tenant.domain,
      },
      users: [
        {
          email: admin.email,
          role: admin.role,
          password: "admin123",
        },
        {
          email: regularUser.email,
          role: regularUser.role,
          password: "admin123",
        },
      ],
      instructions: "You can now log in with these credentials at /auth/signin",
    });
  } catch (error: any) {
    console.error("Database initialization error:", error);
    return res.status(500).json({ 
      error: "Database initialization failed",
      details: error.message,
      hint: "Make sure PostgreSQL is running and DATABASE_URL is configured correctly in .env.local"
    });
  }
}