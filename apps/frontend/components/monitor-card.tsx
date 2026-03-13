"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MoreVertical, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MonitorCardProps {
  id: string;
  name: string;
  url: string;
  status: "UP" | "DOWN" | "PENDING";
  lastChecked: Date;
  responseTime?: number;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  isActive: "ACTIVE" | "PAUSED";
}

// --status-up: oklch(0.6 0.2 140);
// --status-down: oklch(0.65 0.22 27);
// --status-pending: oklch(0.7 0.25 60);

const statusConfig = {
  UP: {
    label: "UP",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    dotColor: "bg-green-500",
  },
  DOWN: {
    label: "DOWN",
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
    dotColor: "bg-red-500",
  },
  PENDING: {
    label: "PENDING",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-500",
    dotColor: "bg-yellow-500",
  },
};

const activityConfig = {
  ACTIVE: {
    label: "ACTIVE",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    dotColor: "bg-green-500",
  },
  PAUSED: {
    label: "PAUSED",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-500",
    dotColor: "bg-yellow-500",
  },
};

export function MonitorCard({
  id,
  name,
  url,
  status,
  lastChecked,
  responseTime,
  onToggle,
  onDelete,
  isActive,
}: MonitorCardProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const actyConfig = activityConfig[isActive] || activityConfig.PAUSED;
  const timeSinceCheck = new Date().getTime() - new Date(lastChecked).getTime();
  const secondsAgo = Math.floor(timeSinceCheck / 1000);
  const minutesAgo = Math.floor(timeSinceCheck / 60000);
  const hoursAgo = Math.floor(timeSinceCheck / 3600000);
  const daysAgo = Math.floor(timeSinceCheck / 86400000);

  let timeLabel = "-";
  if (isNaN(secondsAgo)) {
    timeLabel = "-";
  } else if (secondsAgo < 60) {
    timeLabel = `${secondsAgo}s ago`;
  } else if (minutesAgo < 60) {
    timeLabel = `${minutesAgo}m ago`;
  } else if (hoursAgo < 24) {
    timeLabel = `${hoursAgo}h ago`;
  } else {
    timeLabel = `${daysAgo}d ago`;
  }

  return (
    <div className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {name}
            </h3>
            <p className="text-sm text-foreground/60 truncate">{url}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={"hover:text-white"}>
            <DropdownMenuItem>
              <Link href={`/monitors/${id}`} className="cursor-pointer">
                View Details
              </Link>
            </DropdownMenuItem>
            {onToggle && (
              <DropdownMenuItem
                className={"hover:text-white cursor-pointer"}
                onClick={() => onToggle(id)}
              >
                {isActive === "ACTIVE"
                  ? "Pause Monitoring"
                  : "Resume Monitoring"}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(id)}
                className="text-destructive cursor-pointer"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 pb-4 border-b border-border/50">
        <div>
          <p className="text-xs text-foreground/60 font-medium mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}
            />
            <Badge className={`${config.bgColor} ${config.textColor} border-0`}>
              {config.label}
            </Badge>
          </div>
        </div>

        <div className="hidden sm:block">
          <p className="text-xs text-foreground/60 font-medium mb-1">Latency</p>
          <p className="text-lg font-semibold text-foreground">
            {responseTime ? `${responseTime}ms` : "-"}
          </p>
        </div>

        {isActive && (
          <div>
            <p className="text-xs text-foreground/60 font-medium mb-1">
              Status
            </p>
            <Badge
              className={`${actyConfig.bgColor} ${actyConfig.textColor} border-0`}
            >
              {actyConfig.label}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground/60">
          Last checked:{" "}
          <span className="font-medium text-foreground/80">
            {timeLabel === "-" ? "-" : timeLabel}
          </span>
        </p>
        <Link href={`/monitors/${id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 cursor-pointer"
          >
            View <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
