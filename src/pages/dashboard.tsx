import { GetServerSideProps } from "next";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, DollarSign, Activity, TrendingUp, Users, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  // Mock data - will be replaced with real API calls
  const stats = {
    tokensToday: 45230,
    tokensLimit: 100000,
    estimatedCost: 1.36,
    redactions: 127,
    securityScore: 94,
  };

  const recentActivity = [
    {
      user: "john@acme.com",
      timestamp: "2 minutes ago",
      tokens: 1250,
      redactions: 3,
      provider: "OpenAI",
      categories: ["PII", "SECRET"],
    },
    {
      user: "sarah@acme.com",
      timestamp: "15 minutes ago",
      tokens: 890,
      redactions: 0,
      provider: "Anthropic",
      categories: [],
    },
    {
      user: "mike@acme.com",
      timestamp: "1 hour ago",
      tokens: 2100,
      redactions: 8,
      provider: "Gemini",
      categories: ["PII", "PCI", "CORPORATE"],
    },
  ];

  const usagePercent = (stats.tokensToday / stats.tokensLimit) * 100;
  const isNearLimit = usagePercent >= 80;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
            <p className="mt-1 text-slate-400">Real-time AI usage monitoring and threat detection</p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:from-cyan-600 hover:to-blue-700">
            Export Report
          </Button>
        </div>

        {/* Alert if near limit */}
        {isNearLimit && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
              <div className="flex-1">
                <p className="font-semibold text-amber-400">Approaching Token Limit</p>
                <p className="text-sm text-amber-300/80">
                  You've used {usagePercent.toFixed(1)}% of your daily token budget
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Token Usage</CardTitle>
              <Activity className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.tokensToday.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400">of {stats.tokensLimit.toLocaleString()} daily limit</p>
              <Progress value={usagePercent} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Estimated Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.estimatedCost}</div>
              <p className="text-xs text-slate-400">Today's spending</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Redactions</CardTitle>
              <Shield className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.redactions}</div>
              <p className="text-xs text-slate-400">Sensitive data blocked</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Security Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.securityScore}%</div>
              <p className="text-xs text-green-400">Excellent protection</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Table */}
        <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <p className="text-sm text-slate-400">Latest AI requests with Shield protection</p>
              </div>
              <Button variant="outline" className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-cyan-500/10 bg-slate-950/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                      <Users className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{activity.user}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {activity.tokens.toLocaleString()} tokens
                      </p>
                      <Badge
                        variant="outline"
                        className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                      >
                        {activity.provider}
                      </Badge>
                    </div>

                    {activity.redactions > 0 ? (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
                        <Shield className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-400">
                          {activity.redactions} blocked
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-semibold text-green-400">Clean</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};