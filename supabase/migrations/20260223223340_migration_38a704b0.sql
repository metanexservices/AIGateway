-- Create enum types
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');
CREATE TYPE "PromptStorageMode" AS ENUM ('NONE', 'REDACTED_ONLY', 'FULL');
CREATE TYPE "AIProvider" AS ENUM ('OPENAI', 'GEMINI', 'ANTHROPIC');

-- Create Tenant table
CREATE TABLE "Tenant" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  logo TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
  "dailyTokenBudget" INTEGER NOT NULL DEFAULT 1000000,
  "promptStorageMode" "PromptStorageMode" NOT NULL DEFAULT 'NONE',
  "customBlacklist" TEXT[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create User table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  role "Role" NOT NULL DEFAULT 'USER',
  "dailyTokenLimit" INTEGER NOT NULL DEFAULT 100000,
  department TEXT,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(email, "tenantId")
);

-- Create APIKey table
CREATE TABLE "APIKey" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  provider "AIProvider" NOT NULL,
  "encryptedKey" TEXT NOT NULL,
  "maskedKey" TEXT NOT NULL,
  "lastVerified" TIMESTAMP WITH TIME ZONE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create AuditLog table
CREATE TABLE "AuditLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  provider "AIProvider" NOT NULL,
  "tokensUsed" INTEGER NOT NULL,
  "redactionCount" INTEGER NOT NULL,
  "categoriesTriggered" TEXT[] NOT NULL,
  "estimatedCostUSD" DOUBLE PRECISION NOT NULL,
  "redactedPrompt" TEXT,
  "rawPrompt" TEXT,
  "aiResponse" TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create TokenUsage table
CREATE TABLE "TokenUsage" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  "tokensUsed" INTEGER NOT NULL,
  "redactionCount" INTEGER NOT NULL,
  "requestCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("tenantId", "userId", date)
);

-- Create indexes
CREATE INDEX "Tenant_domain_idx" ON "Tenant"(domain);
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "User_email_idx" ON "User"(email);
CREATE INDEX "APIKey_tenantId_idx" ON "APIKey"("tenantId");
CREATE INDEX "APIKey_provider_idx" ON "APIKey"(provider);
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"(timestamp);
CREATE INDEX "TokenUsage_tenantId_date_idx" ON "TokenUsage"("tenantId", date);
CREATE INDEX "TokenUsage_userId_date_idx" ON "TokenUsage"("userId", date);

-- Enable RLS on all tables
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "APIKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TokenUsage" ENABLE ROW LEVEL SECURITY;