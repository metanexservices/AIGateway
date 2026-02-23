import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Setup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSetup = async () => {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/setup/init", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Database initialized successfully!");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Database initialization failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Database initialization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-2xl border-cyan-500/30 bg-slate-900/95 shadow-2xl shadow-cyan-500/10">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <Shield className="w-10 h-10 text-black" strokeWidth={2.5} />
          </div>

          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Shield AI Setup
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Initialize database with test users and tenant configuration
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === "success" && (
            <Alert className="bg-emerald-950/50 border-emerald-500/50 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <AlertDescription className="ml-2 font-medium">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-500/50">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="ml-2">{message}</AlertDescription>
            </Alert>
          )}

          {status === "idle" && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Database Setup</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Create Shield AI Demo tenant
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Initialize Super Admin user
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Create test regular user
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Configure default security policies
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-3">
                <h3 className="text-lg font-semibold text-cyan-400">Default Login Credentials</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="bg-slate-900 rounded p-3 space-y-1">
                    <div className="text-slate-400">Super Admin:</div>
                    <div className="text-emerald-400">admin@shieldai.local / admin123</div>
                  </div>
                  <div className="bg-slate-900 rounded p-3 space-y-1">
                    <div className="text-slate-400">Regular User:</div>
                    <div className="text-emerald-400">user@shieldai.local / admin123</div>
                  </div>
                  <div className="bg-slate-900 rounded p-3 space-y-1">
                    <div className="text-slate-400">Tenant Domain:</div>
                    <div className="text-emerald-400">shieldai.local</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSetup}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold shadow-lg shadow-cyan-500/30"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Initializing Database...
                  </span>
                ) : (
                  "Initialize Database"
                )}
              </Button>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-4">Redirecting to login page...</p>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}