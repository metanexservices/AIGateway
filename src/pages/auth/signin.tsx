import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Lock, Shield, AlertCircle, Terminal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignIn() {
  const router = useRouter();
  const [tenantDomain, setTenantDomain] = useState("shieldai.local");
  const [email, setEmail] = useState("user@shieldai.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Force dark mode and add matrix effect
  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    // Matrix rain effect
    const canvas = document.getElementById("matrix") as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    function draw() {
      if (!ctx || !canvas) return;
      
      ctx.fillStyle = "rgba(3, 7, 18, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0ea5e9";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        tenantDomain,
        email,
        password,
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712]">
      {/* Matrix Background */}
      <canvas
        id="matrix"
        className="absolute inset-0 opacity-20"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5" />

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.03) 2px, rgba(6, 182, 212, 0.03) 4px)",
          }}
        />
      </div>

      {/* Login Card */}
      <Card className="relative w-full max-w-md border-cyan-500/30 bg-[#0a0f1e]/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
        <CardHeader className="space-y-6 text-center pb-8">
          {/* Logo with Glow */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
            <Shield className="w-10 h-10 text-black" strokeWidth={2.5} />
          </div>

          {/* Title with Glitch Effect */}
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 animate-pulse font-mono tracking-wider">
              SHIELD AI
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-cyan-400/80">
              <Terminal className="w-4 h-4" />
              <CardDescription className="text-cyan-400/80 font-mono text-xs tracking-widest">
                ENTERPRISE SECURITY GATEWAY
              </CardDescription>
            </div>
          </div>

          {/* Security Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SECURE CONNECTION ESTABLISHED
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tenant Domain */}
            <div className="space-y-2">
              <Label htmlFor="tenantDomain" className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider">
                <Building2 className="w-4 h-4" />
                TENANT DOMAIN
              </Label>
              <Input
                id="tenantDomain"
                type="text"
                placeholder="shieldai.local"
                value={tenantDomain}
                onChange={(e) => setTenantDomain(e.target.value)}
                required
                className="bg-[#0a0f1e] border-cyan-500/30 focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-800 font-mono h-12 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider">
                <Mail className="w-4 h-4" />
                EMAIL ADDRESS
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@shieldai.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0a0f1e] border-cyan-500/30 focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-800 font-mono h-12 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider">
                <Lock className="w-4 h-4" />
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0a0f1e] border-cyan-500/30 focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-800 font-mono h-12 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold font-mono tracking-wider shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : (
                "INITIATE SECURE ACCESS"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-cyan-500/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0f1e] px-3 text-cyan-600 font-mono tracking-widest">
                ALTERNATE AUTH
              </span>
            </div>
          </div>

          {/* Azure AD Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/5 text-cyan-400 font-mono text-sm tracking-wider transition-all duration-300"
            onClick={() => signIn("azure-ad")}
          >
            Azure Active Directory
          </Button>

          {/* Footer */}
          <div className="text-center text-xs text-cyan-600 pt-4 border-t border-cyan-500/20 font-mono space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AES-256 ENCRYPTED</span>
            </div>
            <div className="text-cyan-700">MULTI-TENANT ISOLATION ACTIVE</div>
          </div>
        </CardContent>
      </Card>

      {/* Corner Decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-500/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30" />
    </div>
  );
}