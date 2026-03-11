import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    label: string;
    value: string;
    direction: "up" | "down";
  };
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm text-foreground/70 font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={`text-xs font-medium ${trend.direction === "up" ? "text-primary" : "text-destructive"}`}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value} {trend.label}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
