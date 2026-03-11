"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { MonitorCard } from "@/components/monitor-card";
import { Activity, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { AddMonitorModal } from "@/components/add-monitor-modal";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

interface Monitor {
  id: string;
  name: string;
  url: string;
  status: "UP" | "DOWN" | "PENDING";
  uptime: number;
  lastChecked: Date;
  responseTime: number;
  isActive: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleDeleteMonitor = async (monitorId: string) => {
    if (!window.confirm("Are you ")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/monitors/${monitorId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setMonitors(monitors.filter((m) => m.id !== monitorId));
      toast.success("Monitor deleted successfully");
    } catch (error) {
      toast.error("Failed to delete monitor");
    }
  };

  const handleToggleMonitor = async (monitorId: string) => {
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/api/monitors/${monitorId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      setMonitors(
        monitors.map((m) => (m.id === monitorId ? response.data.data : m)),
      );
      toast.success("Monitor toggled successfully");
    } catch (error) {
      toast.error("Failed to toggle monitor");
    }
  };

  const addMonitor = async (name: string, url: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/monitors`,
        {
          name,
          url,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      setMonitors([...monitors, response.data.data]);
      toast.success("Monitor added successfully");
    } catch (error) {
      toast.error("Failed to add monitor");
    }
  };

  const fetchMonitors = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/monitors`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setMonitors(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch monitors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchMonitors();
    }
  }, [status]);

  const upMonitors = monitors.filter((m) => m.status === "UP").length;
  const downMonitors = monitors.filter((m) => m.status === "DOWN").length;
  //   const avgUptime =
  //     monitors.length > 0
  //       ? (
  //           monitors.reduce((sum, m) => sum + m.uptime, 0) / monitors.length
  //         ).toFixed(2)
  //       : "0.00";

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-card rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AddMonitorModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddMonitor={addMonitor}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-foreground/70">
                Monitor and manage all your websites from one place
              </p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Add Monitor</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Active Monitors"
              value={monitors.length}
              icon={Activity}
              trend={{
                label: "monitors",
                value: monitors.filter((m) => m.isActive).length.toString(),
                direction: "up",
              }}
            />
            <StatsCard
              title="Websites Up"
              value={upMonitors}
              icon={CheckCircle}
              trend={{
                label: "healthy",
                value: "100%",
                direction: "up",
              }}
            />
            <StatsCard
              title="Websites Down"
              value={downMonitors}
              icon={AlertCircle}
              trend={{
                label: "issues detected",
                value: downMonitors.toString(),
                direction: "down",
              }}
            />
          </div>
        </div>

        {/* Monitors List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Your Monitors
            </h2>
            {/* <div className="text-sm text-foreground/60">
              Avg Uptime:{" "}
              <span className="font-semibold text-foreground">
                {avgUptime}%
              </span>
            </div> */}
          </div>

          {monitors.length === 0 ? (
            <div className="py-16 text-center">
              <Activity className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No monitors yet
              </h3>
              <p className="text-foreground/70 mb-6">
                Get started by adding your first website to monitor
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} size="lg">
                Add Your First Monitor
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {monitors.map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  {...monitor}
                  onToggle={(id) => {
                    handleToggleMonitor(id);
                  }}
                  onDelete={(id) => handleDeleteMonitor(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
