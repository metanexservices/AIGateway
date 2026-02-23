import { useState } from "react";
import { GetServerSideProps } from "next";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  Shield,
  DollarSign,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  provider: string;
  tokensUsed: number;
  redactionCount: number;
  categoriesTriggered: string[];
  estimatedCost: number;
  redactedPrompt?: string;
  rawPrompt?: string;
  aiResponse?: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: "2024-02-23T14:30:00Z",
      user: "john@acme.com",
      provider: "OPENAI",
      tokensUsed: 1250,
      redactionCount: 3,
      categoriesTriggered: ["PII", "SECRET"],
      estimatedCost: 0.0375,
      redactedPrompt: "Review the architecture for [PROJECT_REDACTED] using API key [API_KEY_REDACTED]",
    },
    {
      id: "2",
      timestamp: "2024-02-23T13:15:00Z",
      user: "sarah@acme.com",
      provider: "ANTHROPIC",
      tokensUsed: 890,
      redactionCount: 0,
      categoriesTriggered: [],
      estimatedCost: 0.01335,
    },
    {
      id: "3",
      timestamp: "2024-02-23T12:00:00Z",
      user: "mike@acme.com",
      provider: "GEMINI",
      tokensUsed: 2100,
      redactionCount: 8,
      categoriesTriggered: ["PII", "PCI", "CORPORATE"],
      estimatedCost: 0.02625,
      redactedPrompt: "Generate report for [EMAIL_REDACTED] with salary [SALARY_REDACTED]",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleExportCSV = () => {
    // Mock CSV export
    const csv = logs
      .map((log) =>
        [
          log.timestamp,
          log.user,
          log.provider,
          log.tokensUsed,
          log.redactionCount,
          log.categoriesTriggered.join(";"),
          log.estimatedCost,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shield-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = providerFilter === "ALL" || log.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  const totalTokens = filteredLogs.reduce((sum, log) => sum + log.tokensUsed, 0);
  const totalCost = filteredLogs.reduce((sum, log) => sum + log.estimatedCost, 0);
  const totalRedactions = filteredLogs.reduce((sum, log) => sum + log.redactionCount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
            <p className="mt-1 text-slate-400">Complete audit trail of AI interactions</p>
          </div>
          <Button
            onClick={handleExportCSV}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:from-cyan-600 hover:to-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Tokens</p>
                  <p className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</p>
                </div>
                <FileText className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Cost</p>
                  <p className="text-2xl font-bold text-white">${totalCost.toFixed(4)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Redactions</p>
                  <p className="text-2xl font-bold text-white">{totalRedactions}</p>
                </div>
                <Shield className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by user or provider..."
                  className="border-cyan-500/20 bg-slate-950/50 pl-10 text-white"
                />
              </div>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-48 border-cyan-500/20 bg-slate-950/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-cyan-500/20 bg-slate-900">
                  <SelectItem value="ALL" className="text-white focus:bg-cyan-500/10">
                    All Providers
                  </SelectItem>
                  <SelectItem value="OPENAI" className="text-white focus:bg-cyan-500/10">
                    OpenAI
                  </SelectItem>
                  <SelectItem value="GEMINI" className="text-white focus:bg-cyan-500/10">
                    Gemini
                  </SelectItem>
                  <SelectItem value="ANTHROPIC" className="text-white focus:bg-cyan-500/10">
                    Anthropic
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Table */}
        <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Activity Log ({filteredLogs.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-500/20 hover:bg-transparent">
                  <TableHead className="text-slate-400">Timestamp</TableHead>
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Provider</TableHead>
                  <TableHead className="text-slate-400">Tokens</TableHead>
                  <TableHead className="text-slate-400">Cost</TableHead>
                  <TableHead className="text-slate-400">Shield Activity</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-cyan-500/10 hover:bg-cyan-500/5">
                    <TableCell className="font-mono text-sm text-white">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-white">{log.user}</TableCell>
                    <TableCell>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {log.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {log.tokensUsed.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      ${log.estimatedCost.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {log.redactionCount > 0 ? (
                        <div className="space-y-1">
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <Shield className="mr-1 h-3 w-3" />
                            {log.redactionCount} redacted
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {log.categoriesTriggered.map((cat) => (
                              <Badge
                                key={cat}
                                variant="outline"
                                className="text-xs border-slate-600 text-slate-400"
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Clean
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                        className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-400"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl border-cyan-500/20 bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-white">Audit Log Details</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedLog && new Date(selectedLog.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-400">User</p>
                    <p className="font-medium text-white">{selectedLog.user}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Provider</p>
                    <Badge className="mt-1 bg-cyan-500/20 text-cyan-400">
                      {selectedLog.provider}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Tokens Used</p>
                    <p className="font-mono text-white">{selectedLog.tokensUsed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Estimated Cost</p>
                    <p className="font-mono text-white">${selectedLog.estimatedCost.toFixed(4)}</p>
                  </div>
                </div>

                {selectedLog.redactedPrompt && (
                  <div>
                    <p className="mb-2 text-sm text-slate-400">Redacted Prompt (Stored)</p>
                    <div className="rounded-lg border border-cyan-500/20 bg-slate-950/50 p-4">
                      <p className="text-sm text-white">{selectedLog.redactedPrompt}</p>
                    </div>
                  </div>
                )}

                {selectedLog.categoriesTriggered.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-slate-400">Shield Protection Applied</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.categoriesTriggered.map((cat) => (
                        <Badge key={cat} className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context, "ADMIN");
};