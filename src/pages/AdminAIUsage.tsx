import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Activity, DollarSign, Zap, Clock, ChevronDown, ChevronRight, AlertCircle, Cloud } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CloudUsageSection } from "@/components/admin/CloudUsageSection";
import { format, subDays, startOfDay, startOfWeek, startOfMonth } from "date-fns";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 70%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(40, 80%, 55%)",
  "hsl(0, 65%, 55%)",
  "hsl(270, 60%, 55%)",
  "hsl(180, 50%, 45%)",
];

type TimeRange = "today" | "week" | "month" | "all";

function getStartDate(range: TimeRange): string | null {
  const now = new Date();
  if (range === "today") return startOfDay(now).toISOString();
  if (range === "week") return startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  if (range === "month") return startOfMonth(now).toISOString();
  return null;
}

export default function AdminAIUsage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [chartMode, setChartMode] = useState<"model" | "function">("function");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const startDate = getStartDate(timeRange);

  // Fetch all logs for the selected time range
  const { data: logs, isLoading } = useQuery({
    queryKey: ["ai-usage-logs", timeRange],
    queryFn: async () => {
      let query = supabase
        .from("ai_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (startDate) {
        query = query.gte("created_at", startDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Recent logs (last 100)
  const { data: recentLogs, isLoading: recentLoading } = useQuery({
    queryKey: ["ai-usage-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Compute stats
  const stats = useMemo(() => {
    if (!logs) return null;
    const totalCalls = logs.length;
    const totalCost = logs.reduce((sum, l) => sum + Number(l.estimated_cost_usd || 0), 0);
    const avgDuration = totalCalls > 0
      ? logs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / totalCalls
      : 0;
    const errorCount = logs.filter((l) => l.status === "error").length;

    // Most expensive function
    const costByFn: Record<string, number> = {};
    logs.forEach((l) => {
      costByFn[l.function_name] = (costByFn[l.function_name] || 0) + Number(l.estimated_cost_usd || 0);
    });
    const mostExpensive = Object.entries(costByFn).sort((a, b) => b[1] - a[1])[0];

    return { totalCalls, totalCost, avgDuration, errorCount, mostExpensive };
  }, [logs]);

  // Daily cost chart data (last 30 days)
  const dailyChartData = useMemo(() => {
    if (!logs) return [];
    const days: Record<string, Record<string, number>> = {};

    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      days[d] = {};
    }

    logs.forEach((l) => {
      const day = format(new Date(l.created_at), "yyyy-MM-dd");
      if (!days[day]) return;
      const key = chartMode === "model" ? l.model : l.function_name;
      days[day][key] = (days[day][key] || 0) + Number(l.estimated_cost_usd || 0);
    });

    // Get all unique keys
    const allKeys = new Set<string>();
    Object.values(days).forEach((d) => Object.keys(d).forEach((k) => allKeys.add(k)));

    return Object.entries(days).map(([date, values]) => ({
      date: format(new Date(date), "MMM dd"),
      ...values,
    }));
  }, [logs, chartMode]);

  const chartKeys = useMemo(() => {
    const keys = new Set<string>();
    dailyChartData.forEach((d) => {
      Object.keys(d).forEach((k) => {
        if (k !== "date") keys.add(k);
      });
    });
    return Array.from(keys);
  }, [dailyChartData]);

  // Function leaderboard
  const leaderboard = useMemo(() => {
    if (!logs) return [];
    const byFn: Record<string, { calls: number; tokens: number; cost: number; duration: number; errors: number }> = {};
    logs.forEach((l) => {
      if (!byFn[l.function_name]) byFn[l.function_name] = { calls: 0, tokens: 0, cost: 0, duration: 0, errors: 0 };
      byFn[l.function_name].calls++;
      byFn[l.function_name].tokens += l.total_tokens || 0;
      byFn[l.function_name].cost += Number(l.estimated_cost_usd || 0);
      byFn[l.function_name].duration += l.duration_ms || 0;
      if (l.status === "error") byFn[l.function_name].errors++;
    });
    return Object.entries(byFn)
      .map(([name, data]) => ({
        name,
        ...data,
        avgDuration: data.calls > 0 ? data.duration / data.calls : 0,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [logs]);

  // Model pie chart
  const modelPieData = useMemo(() => {
    if (!logs) return [];
    const byModel: Record<string, { calls: number; cost: number }> = {};
    logs.forEach((l) => {
      if (!byModel[l.model]) byModel[l.model] = { calls: 0, cost: 0 };
      byModel[l.model].calls++;
      byModel[l.model].cost += Number(l.estimated_cost_usd || 0);
    });
    return Object.entries(byModel).map(([name, data]) => ({
      name: name.replace("google/", "").replace("openai/", ""),
      ...data,
    }));
  }, [logs]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI & Cloud Usage</h1>
            <p className="text-muted-foreground text-sm">Track AI costs, cloud resources, and performance</p>
          </div>
        </div>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1.5 rounded-xl border border-border/50">
            <TabsTrigger value="ai" className="rounded-lg gap-2 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md">
              <Activity className="w-4 h-4" />
              AI Usage
            </TabsTrigger>
            <TabsTrigger value="cloud" className="rounded-lg gap-2 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md">
              <Cloud className="w-4 h-4" />
              Cloud Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="mt-6">
            <CloudUsageSection />
          </TabsContent>

          <TabsContent value="ai" className="mt-6 space-y-6">

        {/* Time Range Filter */}
        <div className="flex justify-end">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Total AI Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</p>
                {stats.errorCount > 0 && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {stats.errorCount} errors
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Estimated Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${stats.totalCost.toFixed(4)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Most Expensive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold truncate">{stats.mostExpensive?.[0] || "—"}</p>
                <p className="text-xs text-muted-foreground">${stats.mostExpensive?.[1]?.toFixed(4) || "0"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{(stats.avgDuration / 1000).toFixed(1)}s</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cost Breakdown Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Daily Cost (Last 30 Days)</CardTitle>
                <div className="flex gap-1">
                  <Button size="sm" variant={chartMode === "function" ? "default" : "outline"} onClick={() => setChartMode("function")}>
                    By Function
                  </Button>
                  <Button size="sm" variant={chartMode === "model" ? "default" : "outline"} onClick={() => setChartMode("model")}>
                    By Model
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(3)}`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`$${value.toFixed(4)}`, ""]}
                  />
                  {chartKeys.map((key, i) => (
                    <Bar key={key} dataKey={key} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Model Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={modelPieData} dataKey="cost" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {modelPieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(4)}`, "Cost"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Function Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Function Leaderboard (by cost)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Function</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Avg Duration</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((fn, i) => (
                  <TableRow key={fn.name}>
                    <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{fn.name}</TableCell>
                    <TableCell className="text-right">{fn.calls.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{fn.tokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">${fn.cost.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{(fn.avgDuration / 1000).toFixed(1)}s</TableCell>
                    <TableCell className="text-right">
                      {fn.errors > 0 ? <Badge variant="destructive">{fn.errors}</Badge> : <span className="text-muted-foreground">0</span>}
                    </TableCell>
                  </TableRow>
                ))}
                {leaderboard.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No AI usage data yet. Logs will appear after edge functions start recording.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent AI Calls (Last 100)</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Function</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(recentLogs || []).map((log) => (
                      <>
                        <TableRow
                          key={log.id}
                          className="cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                        >
                          <TableCell>
                            {expandedRow === log.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {format(new Date(log.created_at), "MMM dd HH:mm:ss")}
                          </TableCell>
                          <TableCell className="font-medium text-sm">{log.function_name}</TableCell>
                          <TableCell className="text-xs">{log.model.replace("google/", "").replace("openai/", "")}</TableCell>
                          <TableCell className="text-right text-xs font-mono">{(log.total_tokens || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs font-mono">${Number(log.estimated_cost_usd || 0).toFixed(4)}</TableCell>
                          <TableCell className="text-right text-xs">{((log.duration_ms || 0) / 1000).toFixed(1)}s</TableCell>
                          <TableCell>
                            <Badge variant={log.status === "success" ? "secondary" : "destructive"} className="text-xs">
                              {log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {expandedRow === log.id && (
                          <TableRow key={`${log.id}-detail`}>
                            <TableCell colSpan={8} className="bg-muted/30 p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Prompt Tokens:</span>{" "}
                                  <span className="font-mono">{log.prompt_tokens?.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Completion Tokens:</span>{" "}
                                  <span className="font-mono">{log.completion_tokens?.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Company ID:</span>{" "}
                                  <span className="font-mono">{log.company_id || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">User ID:</span>{" "}
                                  <span className="font-mono">{log.user_id || "—"}</span>
                                </div>
                                {log.error_message && (
                                  <div className="col-span-4">
                                    <span className="text-muted-foreground">Error:</span>{" "}
                                    <span className="text-destructive">{log.error_message}</span>
                                  </div>
                                )}
                                {log.metadata && Object.keys(log.metadata as object).length > 0 && (
                                  <div className="col-span-4">
                                    <span className="text-muted-foreground">Metadata:</span>
                                    <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-auto">
                                      {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                    {(!recentLogs || recentLogs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No logs yet. Data will appear once edge functions start logging AI calls.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
