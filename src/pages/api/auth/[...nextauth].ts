import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        tenantDomain: { label: "Tenant Domain", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 AUTH ATTEMPT:", {
          email: credentials?.email,
          tenantDomain: credentials?.tenantDomain,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.tenantDomain || !credentials?.password) {
          console.log("❌ Missing credentials");
          throw new Error("Missing credentials");
        }

        try {
          // Find tenant
          const tenant = await prisma.tenant.findUnique({
            where: { domain: credentials.tenantDomain },
          });

          console.log("🏢 Tenant found:", tenant ? tenant.name : "NOT FOUND");

          if (!tenant) {
            throw new Error("Invalid tenant domain");
          }

          // Find user
          const user = await prisma.user.findUnique({
            where: {
              email_tenantId: {
                email: credentials.email,
                tenantId: tenant.id,
              },
            },
            include: { tenant: true },
          });

          console.log("👤 User found:", user ? user.name : "NOT FOUND");
          console.log("🔑 User has password:", !!user?.password);

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          // Verify password
          console.log("🔒 Comparing password...");
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          console.log("✅ Password valid:", isValidPassword);

          if (!isValidPassword) {
            throw new Error("Invalid credentials");
          }

          console.log("🎉 AUTH SUCCESS for:", user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenantDomain: tenant.domain,
          };
        } catch (error) {
          console.error("❌ AUTH ERROR:", error);
          return null;
        }
      },
    }),
    ...(process.env.AZURE_AD_CLIENT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantDomain = user.tenantDomain;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenantDomain = token.tenantDomain as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

export default NextAuth(authOptions);