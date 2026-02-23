import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Database, Users, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeDatabase = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/setup/init", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Setup failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Card className="relative w-full max-w-2xl bg-slate-900/90 border-cyan-500/30 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="w-20 h-20 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Shield AI Setup
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg mt-2">
              Initialize database with test users and tenant configuration
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!result && !error && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-6 space-y-4 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Database Initialization</h3>
                    <p className="text-sm text-slate-400">
                      Creates the default tenant and test user accounts
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Test Accounts</h3>
                    <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                      <li>Super Admin: admin@shieldai.local</li>
                      <li>Regular User: user@shieldai.local</li>
                      <li>Password: admin123 (for both)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={initializeDatabase}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold py-6 text-lg shadow-lg shadow-cyan-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Initializing Database...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Initialize Database
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                This will create the tenant and user accounts needed to log in
              </p>
            </div>
          )}

          {error && (
            <Alert className="bg-red-500/10 border-red-500/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-1">Setup Failed</p>
                <p className="text-sm">{error}</p>
                <Button
                  onClick={() => {
                    setError(null);
                    setResult(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert className="bg-emerald-500/10 border-emerald-500/50 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">✅ Database Initialized Successfully!</p>
                  <div className="text-sm space-y-2 text-slate-300">
                    <p><strong>Tenant:</strong> {result.tenant?.name} ({result.tenant?.domain})</p>
                    
                    <div className="mt-4 bg-slate-800/50 rounded p-3 space-y-2 font-mono text-xs">
                      <p className="text-emerald-400 font-semibold">Super Admin Account:</p>
                      <p>Email: {result.users?.[0]?.email}</p>
                      <p>Password: {result.users?.[0]?.password}</p>
                      <p>Role: {result.users?.[0]?.role}</p>
                      
                      <p className="text-cyan-400 font-semibold mt-3">Regular User Account:</p>
                      <p>Email: {result.users?.[1]?.email}</p>
                      <p>Password: {result.users?.[1]?.password}</p>
                      <p>Role: {result.users?.[1]?.role}</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold py-6 text-lg shadow-lg shadow-cyan-500/25"
              >
                Go to Login Page →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Corner decorations */}
      <div className="fixed top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30" />
      <div className="fixed top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30" />
      <div className="fixed bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-500/30" />
      <div className="fixed bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30" />
    </div>
  );
}