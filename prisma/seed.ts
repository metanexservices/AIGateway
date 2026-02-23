import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: "shieldai.local" },
    update: {},
    create: {
      name: "Shield AI Demo",
      domain: "shieldai.local",
      primaryColor: "#3b82f6",
      dailyTokenBudget: 1000000,
      promptStorageMode: "NONE",
      customBlacklist: ["Project Alpha", "Confidential"],
    },
  });

  console.log("✅ Tenant created:", tenant.name);

  // Create super admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: "admin@shieldai.local",
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      email: "admin@shieldai.local",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      tenantId: tenant.id,
      department: "IT",
      dailyTokenLimit: 100000,
    },
  });

  console.log("✅ Super Admin created:", admin.email);

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: "user@shieldai.local",
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      email: "user@shieldai.local",
      name: "Test User",
      password: hashedPassword,
      role: "USER",
      tenantId: tenant.id,
      department: "Engineering",
      dailyTokenLimit: 50000,
    },
  });

  console.log("✅ Regular User created:", regularUser.email);

  console.log("\n🎉 Seeding completed!");
  console.log("\n📋 Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Super Admin:");
  console.log("  Email: admin@shieldai.local");
  console.log("  Password: admin123");
  console.log("\nRegular User:");
  console.log("  Email: user@shieldai.local");
  console.log("  Password: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });