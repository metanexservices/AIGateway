import { useState } from "react";
import { GetServerSideProps } from "next";
import { requireAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Send, AlertCircle, CheckCircle2, Sparkles, Bot } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  role: "user" | "assistant";
  content: string;
  redactions?: number;
  categories?: string[];
  tokens?: number;
  cost?: number;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<"OPENAI" | "GEMINI" | "ANTHROPIC">("OPENAI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          provider,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        redactions: data.redactions,
        categories: data.categoriesTriggered,
        tokens: data.tokensUsed,
        cost: data.estimatedCost,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Shield Chat</h1>
            <p className="mt-1 text-slate-400">AI conversations with enterprise-grade security</p>
          </div>
          <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
            <SelectTrigger className="w-48 border-cyan-500/20 bg-slate-900/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-cyan-500/20 bg-slate-900">
              <SelectItem value="OPENAI" className="text-white focus:bg-cyan-500/10">
                OpenAI GPT-4
              </SelectItem>
              <SelectItem value="GEMINI" className="text-white focus:bg-cyan-500/10">
                Google Gemini
              </SelectItem>
              <SelectItem value="ANTHROPIC" className="text-white focus:bg-cyan-500/10">
                Anthropic Claude
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shield Status Banner */}
        <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Shield Protection Active</h3>
              <p className="text-sm text-slate-300">
                All sensitive data is automatically redacted before reaching AI providers
              </p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Enabled
            </Badge>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Chat Messages */}
        <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-cyan-400 opacity-50" />
                <p className="mt-4 text-slate-400">Start a secure conversation with AI</p>
                <p className="mt-2 text-sm text-slate-500">
                  Your prompts are protected by Shield's advanced redaction engine
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 rounded-lg p-4 ${
                    msg.role === "user"
                      ? "bg-slate-950/50 border border-cyan-500/10"
                      : "bg-gradient-to-r from-cyan-500/5 to-blue-600/5 border border-cyan-500/20"
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                    {msg.role === "user" ? (
                      <span className="text-lg font-bold text-cyan-400">U</span>
                    ) : (
                      <Bot className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="whitespace-pre-wrap text-white">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <div className="flex flex-wrap gap-2">
                        {msg.redactions && msg.redactions > 0 ? (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <Shield className="mr-1 h-3 w-3" />
                            {msg.redactions} redacted
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            No sensitive data
                          </Badge>
                        )}
                        {msg.categories && msg.categories.length > 0 && (
                          <>
                            {msg.categories.map((cat) => (
                              <Badge
                                key={cat}
                                variant="outline"
                                className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                              >
                                {cat}
                              </Badge>
                            ))}
                          </>
                        )}
                        {msg.tokens && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            {msg.tokens.toLocaleString()} tokens
                          </Badge>
                        )}
                        {msg.cost && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            ${msg.cost.toFixed(4)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-4 rounded-lg border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-blue-600/5 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                  <Bot className="h-5 w-5 animate-pulse text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input */}
        <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Protected by Shield)"
                className="min-h-[100px] resize-none border-cyan-500/20 bg-slate-950/50 text-white placeholder:text-slate-500 focus:border-cyan-500"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-auto bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:from-cyan-600 hover:to-blue-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">Enter</kbd> to send,{" "}
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">Shift+Enter</kbd> for new line
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};