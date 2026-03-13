"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  Clock,
  Gauge,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Pause,
  Trash2,
  ExternalLink,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";

interface Tick {
  id: string;
  monitorId: string;
  checkedAt: string;
  status: "UP" | "DOWN" | "PENDING";
  latency: number;
  statusCode?: number;
}

interface Monitor {
  id: string;
  name: string;
  url: string;
  status: "UP" | "DOWN" | "PENDING";
  lastChecked: string;
  latency: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ticks: Tick[];
}

function calcUptime(ticks: Tick[]): number {
  if (!ticks.length) return 0;
  return (ticks.filter((t) => t.status === "UP").length / ticks.length) * 100;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_COLORS = {
  UP: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    hex: "#10b981",
  },
  DOWN: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    hex: "#ef4444",
  },
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    hex: "#f59e0b",
  },
};

export default function MonitorDetailsPageComponent({ id }: { id: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  const fetchMonitorData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/monitors/${id}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      setMonitor(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data.message ?? error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchMonitorData();
  }, [status]);

  if (status === "loading" || isLoading || !monitor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-foreground/40">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium tracking-wide">
            Loading monitor…
          </span>
        </div>
      </div>
    );
  }

  const uptime = calcUptime(monitor.ticks);
  const colors = STATUS_COLORS[monitor.status] || STATUS_COLORS.PENDING;

  const filteredTicks = monitor.ticks.filter((t) => {
    const diffDays =
      (Date.now() - new Date(t.checkedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (timeRange === "24h") return diffDays < 1;
    if (timeRange === "7d") return diffDays < 7;
    return diffDays < 30;
  });

  const hourlyMap = new Map<
    string,
    {
      time: string;
      upcount: number;
      downcount: number;
      avgLatency: number;
      checks: number;
    }
  >();
  for (const tick of filteredTicks) {
    const key = new Date(tick.checkedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
    });
    const existing = hourlyMap.get(key);
    if (existing) {
      if (tick.status === "UP") existing.upcount++;
      if (tick.status === "DOWN") existing.downcount++;
      existing.avgLatency =
        (existing.avgLatency * existing.checks + tick.latency) /
        (existing.checks + 1);
      existing.checks++;
    } else {
      hourlyMap.set(key, {
        time: key,
        upcount: tick.status === "UP" ? 1 : 0,
        downcount: tick.status === "DOWN" ? 1 : 0,
        avgLatency: tick.latency,
        checks: 1,
      });
    }
  }
  const hourlyData = Array.from(hourlyMap.values())
    .slice(-48)
    .map((d) => ({ ...d, avgLatency: Math.round(d.avgLatency) }));

  const latencyData = monitor.ticks
    .filter((t) => t.latency > 0)
    .slice(-24)
    .map((t) => ({ time: formatDate(t.checkedAt), latency: t.latency }));

  const statusDistribution = [
    {
      name: "Up",
      value: monitor.ticks.filter((t) => t.status === "UP").length,
      fill: "#10b981",
    },
    {
      name: "Down",
      value: monitor.ticks.filter((t) => t.status === "DOWN").length,
      fill: "#ef4444",
    },
    {
      name: "Pending",
      value: monitor.ticks.filter((t) => t.status === "PENDING").length,
      fill: "#f59e0b",
    },
  ].filter((d) => d.value > 0);

  const recentChecks = [...monitor.ticks].reverse().slice(0, 10);

  const ttContentStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontSize: "12px",
  };
  const axisTickStyle = {
    fontSize: 11,
    fill: "var(--foreground)",
    opacity: 0.5,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${colors.dot} animate-pulse`}
                />
                <h1 className="text-3xl font-bold tracking-tight">
                  {monitor.name}
                </h1>
              </div>
              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-foreground/50 hover:text-foreground transition-colors text-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {monitor.url}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fetchMonitorData(true)}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">
              Status
            </p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className={`text-lg font-bold ${colors.text}`}>
                {monitor.status ?? "Pending"}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">
              Uptime
            </p>
            <p className="text-lg font-bold text-emerald-400">
              {uptime.toFixed(2)}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">
              Avg Response
            </p>
            <p className="text-lg font-bold">
              {monitor.latency ? `${monitor.latency} ms` : "-"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">
              Last Checked
            </p>
            <p className="text-lg font-bold">
              {monitor.lastChecked
                ? formatTime(monitor.lastChecked)
                : "checking..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white font-medium uppercase tracking-wider mr-1">
            Range
          </span>
          {(["24h", "7d", "30d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="h-7 px-3 text-xs text-white cursor-pointer"
            >
              {range}
            </Button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
            Status Timeline
          </h3>
          {hourlyData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-foreground/30 text-sm">
              No data for selected range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hourlyData} barSize={8} barGap={2}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={ttContentStyle}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "12px",
                    opacity: 0.6,
                  }}
                />
                <Bar
                  dataKey="upcount"
                  name="Up"
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="downcount"
                  name="Down"
                  fill="#ef4444"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
            Response Time
          </h3>
          {latencyData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-foreground/30 text-sm">
              No latency data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={latencyData}>
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  unit="ms"
                />
                <Tooltip
                  contentStyle={ttContentStyle}
                  formatter={(value) => [`${value}ms`, "Response Time"]}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#latencyGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#3b82f6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                >
                  {statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={ttContentStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
              Summary
            </h3>
            <div className="space-y-2">
              {[
                {
                  icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
                  label: "Uptime",
                  value: `${uptime.toFixed(2)}%`,
                },
                {
                  icon: <AlertCircle className="w-4 h-4 text-red-400" />,
                  label: "Downtime",
                  value: `${(100 - uptime).toFixed(2)}%`,
                },
                {
                  icon: <Gauge className="w-4 h-4 text-blue-400" />,
                  label: "Avg Response",
                  value: `${monitor.latency ? `${monitor.latency} ms` : "-"}`,
                },
                {
                  icon: <TrendingUp className="w-4 h-4 text-foreground/40" />,
                  label: "Total Checks",
                  value: monitor.ticks.length.toString(),
                },
                {
                  icon: <Activity className="w-4 h-4 text-foreground/40" />,
                  label: "Monitor Active",
                  value: monitor.isActive ? "Yes" : "No",
                },
                {
                  icon: <Clock className="w-4 h-4 text-foreground/40" />,
                  label: "Created",
                  value: new Date(monitor.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  ),
                },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-background"
                >
                  <div className="flex items-center gap-2.5 text-sm text-foreground/60">
                    {icon}
                    {label}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
            Recent Checks
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground/40 text-xs uppercase tracking-wider">
                    Time
                  </TableHead>
                  <TableHead className="text-foreground/40 text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-foreground/40 text-xs uppercase tracking-wider">
                    Code
                  </TableHead>
                  <TableHead className="text-foreground/40 text-xs uppercase tracking-wider text-right">
                    Latency
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentChecks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-foreground/30 py-8 text-sm"
                    >
                      No checks recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentChecks.map((check) => {
                    const c = STATUS_COLORS[check.status];
                    return (
                      <TableRow
                        key={check.id}
                        className="border-border hover:bg-background/50 transition-colors"
                      >
                        <TableCell className="text-foreground/60 text-sm tabular-nums">
                          {formatDate(check.checkedAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${c.dot}`}
                            />
                            {check.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground/60 text-sm tabular-nums">
                          {check.statusCode ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {check.latency > 0 ? (
                            <span
                              className={
                                check.latency > 500
                                  ? "text-red-400"
                                  : check.latency > 200
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                              }
                            >
                              {check.latency}ms
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
