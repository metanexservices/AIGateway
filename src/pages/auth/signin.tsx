import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Shield, Mail, Building2, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tenantDomain, setTenantDomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        tenantDomain,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials or tenant domain");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Glow Effects */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]"></div>

      <Card className="relative z-10 w-full max-w-md border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Shield AI</CardTitle>
            <CardDescription className="text-slate-400">
              Enterprise AI Security Gateway
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <Lock className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="tenantDomain" className="text-slate-200">
                <Building2 className="mr-2 inline h-4 w-4" />
                Tenant Domain
              </Label>
              <Input
                id="tenantDomain"
                type="text"
                placeholder="acme-corp"
                value={tenantDomain}
                onChange={(e) => setTenantDomain(e.target.value)}
                required
                className="border-cyan-500/20 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                <Mail className="mr-2 inline h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-cyan-500/20 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white hover:from-cyan-600 hover:to-blue-700"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-cyan-500/20"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-2 text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-cyan-500/20 bg-slate-900/50 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400"
              onClick={() => signIn("azure-ad")}
            >
              Azure Active Directory
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Protected by Shield AI encryption and multi-tenant isolation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}