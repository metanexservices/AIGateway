import { useState } from "react";
import { GetServerSideProps } from "next";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Plus, Trash2, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface APIKeyData {
  id: string;
  provider: string;
  maskedKey: string;
  isActive: boolean;
  lastVerified: string | null;
  createdAt: string;
}

export default function APIKeys() {
  const [keys, setKeys] = useState<APIKeyData[]>([
    {
      id: "1",
      provider: "OPENAI",
      maskedKey: "sk-...xYz9",
      isActive: true,
      lastVerified: "2024-02-23T10:30:00Z",
      createdAt: "2024-01-15T08:00:00Z",
    },
    {
      id: "2",
      provider: "ANTHROPIC",
      maskedKey: "sk-...aB3c",
      isActive: true,
      lastVerified: "2024-02-23T09:15:00Z",
      createdAt: "2024-01-20T12:00:00Z",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newProvider, setNewProvider] = useState<"OPENAI" | "GEMINI" | "ANTHROPIC">("OPENAI");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAddKey = async () => {
    if (!newKey.trim()) return;

    // Mock implementation - replace with actual API call
    const mockKey: APIKeyData = {
      id: Date.now().toString(),
      provider: newProvider,
      maskedKey: `${newKey.substring(0, 4)}...${newKey.substring(newKey.length - 4)}`,
      isActive: true,
      lastVerified: null,
      createdAt: new Date().toISOString(),
    };

    setKeys((prev) => [...prev, mockKey]);
    setNewKey("");
    setDialogOpen(false);
  };

  const handleTestKey = async (id: string) => {
    setTesting(id);
    // Mock test - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTesting(null);
  };

  const handleDeleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">API Key Vault</h1>
            <p className="mt-1 text-slate-400">Encrypted storage for AI provider credentials (BYOK)</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:from-cyan-600 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="border-cyan-500/20 bg-slate-900">
              <DialogHeader>
                <DialogTitle className="text-white">Add New API Key</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Your key will be encrypted with AES-256 before storage
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-slate-200">
                    AI Provider
                  </Label>
                  <Select value={newProvider} onValueChange={(v: any) => setNewProvider(v)}>
                    <SelectTrigger className="border-cyan-500/20 bg-slate-950/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-cyan-500/20 bg-slate-900">
                      <SelectItem value="OPENAI" className="text-white focus:bg-cyan-500/10">
                        OpenAI
                      </SelectItem>
                      <SelectItem value="GEMINI" className="text-white focus:bg-cyan-500/10">
                        Google Gemini
                      </SelectItem>
                      <SelectItem value="ANTHROPIC" className="text-white focus:bg-cyan-500/10">
                        Anthropic
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-slate-200">
                    API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showKey ? "text" : "password"}
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="sk-..."
                      className="border-cyan-500/20 bg-slate-950/50 pr-10 text-white placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Keys are encrypted at rest and never exposed in client-side code
                  </p>
                </div>
                <Button
                  onClick={handleAddKey}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:from-cyan-600 hover:to-blue-700"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Add Encrypted Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Security Info */}
        <Alert className="border-cyan-500/30 bg-cyan-500/10">
          <Key className="h-4 w-4 text-cyan-400" />
          <AlertDescription className="text-slate-200">
            All API keys are encrypted using AES-256-GCM with tenant-specific keys. Keys are only decrypted
            server-side during AI provider requests.
          </AlertDescription>
        </Alert>

        {/* Keys Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {keys.map((key) => (
            <Card key={key.id} className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                      <Key className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{key.provider}</CardTitle>
                      <CardDescription className="font-mono text-xs">{key.maskedKey}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={
                      key.isActive
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {key.isActive ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Added:</span>
                    <span className="text-white">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Verified:</span>
                    <span className="text-white">
                      {key.lastVerified
                        ? new Date(key.lastVerified).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleTestKey(key.id)}
                    disabled={testing === key.id}
                    variant="outline"
                    className="flex-1 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    {testing === key.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Key"
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDeleteKey(key.id)}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {keys.length === 0 && (
          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <Key className="mx-auto h-12 w-12 text-cyan-400 opacity-50" />
              <h3 className="mt-4 text-lg font-semibold text-white">No API Keys</h3>
              <p className="mt-2 text-sm text-slate-400">
                Add your first AI provider key to start using Shield
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context, "ADMIN");
};