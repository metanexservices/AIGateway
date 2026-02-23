import { useState } from "react";
import { GetServerSideProps } from "next";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Save, Upload, Palette, Shield, Database, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PromptStorageMode = "NONE" | "REDACTED_ONLY" | "FULL";

export default function Settings() {
  const [tenantName, setTenantName] = useState("Acme Corporation");
  const [tenantDomain, setTenantDomain] = useState("acme-corp");
  const [primaryColor, setPrimaryColor] = useState("#06b6d4");
  const [dailyTokenBudget, setDailyTokenBudget] = useState(1000000);
  const [promptStorageMode, setPromptStorageMode] = useState<PromptStorageMode>("NONE");
  const [customBlacklist, setCustomBlacklist] = useState<string[]>([
    "Project Phoenix",
    "Q4-Revenue",
    "Confidential-2024",
  ]);
  const [newKeyword, setNewKeyword] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // Mock save - replace with actual API call
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !customBlacklist.includes(newKeyword.trim())) {
      setCustomBlacklist([...customBlacklist, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setCustomBlacklist(customBlacklist.filter((k) => k !== keyword));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Tenant Settings</h1>
            <p className="mt-1 text-slate-400">Configure your organization's Shield AI instance</p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:from-cyan-600 hover:to-blue-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="border-cyan-500/20 bg-slate-900/50">
            <TabsTrigger value="branding" className="data-[state=active]:bg-cyan-500/10">
              <Palette className="mr-2 h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-cyan-500/10">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-cyan-500/10">
              <Database className="mr-2 h-4 w-4" />
              Data Retention
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Organization Branding</CardTitle>
                <CardDescription>Customize the appearance of your Shield AI portal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tenantName" className="text-slate-200">
                      Organization Name
                    </Label>
                    <Input
                      id="tenantName"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className="border-cyan-500/20 bg-slate-950/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantDomain" className="text-slate-200">
                      Tenant Domain
                    </Label>
                    <Input
                      id="tenantDomain"
                      value={tenantDomain}
                      onChange={(e) => setTenantDomain(e.target.value)}
                      className="border-cyan-500/20 bg-slate-950/50 text-white"
                    />
                    <p className="text-xs text-slate-500">
                      Portal URL: ai.{tenantDomain}.com (future deployment)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-slate-200">
                    Organization Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-cyan-500/20 bg-slate-950/50">
                      <Shield className="h-10 w-10 text-cyan-400" />
                    </div>
                    <Button variant="outline" className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">Recommended: 256x256px PNG with transparent background</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-slate-200">
                    Primary Brand Color
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-12 w-24 cursor-pointer border-cyan-500/20 bg-slate-950/50"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 border-cyan-500/20 bg-slate-950/50 font-mono text-white"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    This color will be used for buttons, links, and accent elements throughout the portal
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Token Budget & Limits</CardTitle>
                <CardDescription>Configure usage limits for your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyBudget" className="text-slate-200">
                    Daily Token Budget (Organization-wide)
                  </Label>
                  <Input
                    id="dailyBudget"
                    type="number"
                    value={dailyTokenBudget}
                    onChange={(e) => setDailyTokenBudget(parseInt(e.target.value))}
                    className="border-cyan-500/20 bg-slate-950/50 font-mono text-white"
                  />
                  <p className="text-xs text-slate-500">
                    All users combined cannot exceed this daily limit
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Custom Redaction Keywords</CardTitle>
                <CardDescription>
                  Add company-specific terms to automatically redact from AI prompts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
                    placeholder="e.g., Project Phoenix, Q4-Revenue"
                    className="flex-1 border-cyan-500/20 bg-slate-950/50 text-white"
                  />
                  <Button
                    onClick={handleAddKeyword}
                    className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {customBlacklist.map((keyword) => (
                    <Badge
                      key={keyword}
                      className="gap-2 bg-amber-500/20 pr-1 text-amber-400 border-amber-500/30"
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="rounded-full p-0.5 hover:bg-amber-500/30"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {customBlacklist.length === 0 && (
                  <p className="text-center text-sm text-slate-500">
                    No custom keywords added yet. Add sensitive terms specific to your organization.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Retention Tab */}
          <TabsContent value="storage" className="space-y-6">
            <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Prompt Storage Policy</CardTitle>
                <CardDescription>
                  Control what data Shield AI stores for audit and compliance purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select
                  value={promptStorageMode}
                  onValueChange={(v: PromptStorageMode) => setPromptStorageMode(v)}
                >
                  <SelectTrigger className="border-cyan-500/20 bg-slate-950/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-cyan-500/20 bg-slate-900">
                    <SelectItem value="NONE" className="text-white focus:bg-cyan-500/10">
                      None - Metadata Only
                    </SelectItem>
                    <SelectItem value="REDACTED_ONLY" className="text-white focus:bg-cyan-500/10">
                      Redacted Prompts Only
                    </SelectItem>
                    <SelectItem value="FULL" className="text-white focus:bg-cyan-500/10">
                      Full Audit Trail (Raw + Redacted + Responses)
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-4 rounded-lg border border-cyan-500/20 bg-slate-950/50 p-4">
                  <h4 className="font-semibold text-white">Selected Policy Details:</h4>
                  {promptStorageMode === "NONE" && (
                    <div className="space-y-2 text-sm text-slate-300">
                      <p className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400">Stored</Badge>
                        User ID, Timestamp, Token count, Redaction count
                      </p>
                      <p className="flex items-center gap-2">
                        <Badge className="bg-red-500/20 text-red-400">Not Stored</Badge>
                        Prompts, AI responses
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        ✓ Maximum privacy - No prompt content stored
                      </p>
                    </div>
                  )}
                  {promptStorageMode === "REDACTED_ONLY" && (
                    <div className="space-y-2 text-sm text-slate-300">
                      <p className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400">Stored</Badge>
                        Metadata + Sanitized prompts (after redaction)
                      </p>
                      <p className="flex items-center gap-2">
                        <Badge className="bg-red-500/20 text-red-400">Not Stored</Badge>
                        Original prompts, AI responses
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        ✓ Balanced approach - Audit capability without exposing sensitive data
                      </p>
                    </div>
                  )}
                  {promptStorageMode === "FULL" && (
                    <div className="space-y-2 text-sm text-slate-300">
                      <p className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400">Stored</Badge>
                        Complete audit trail: Raw prompts, redacted versions, AI responses
                      </p>
                      <p className="mt-2 text-xs text-amber-500">
                        ⚠️ Use only if required for compliance - Stores all conversation data
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context, "ADMIN");
};