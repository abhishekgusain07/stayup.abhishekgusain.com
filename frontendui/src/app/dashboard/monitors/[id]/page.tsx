"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Monitor, MonitorStatus, MONITOR_STATUS } from "@/types/shared";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitorStatusBadge } from "@/components/monitoring/monitor-status-badge";
import { EditMonitorDialog } from "@/components/monitoring/edit-monitor-dialog";
import { ManageAlertsDialog } from "@/components/monitoring/manage-alerts-dialog";
import {
  ArrowLeft,
  Home,
  Edit,
  Mail,
  Power,
  PowerOff,
  Globe,
  Clock,
  Timer,
  Activity,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MonitorDetailPageProps {
  params: {
    id: string;
  };
}

export default function MonitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const monitorId = params?.id as string;

  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);

  useEffect(() => {
    if (monitorId) {
      fetchMonitor();
    }
  }, [monitorId]);

  const fetchMonitor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/monitors/${monitorId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch monitor");
      }
      const data = await response.json();
      setMonitor(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMonitor = async (data: any) => {
    try {
      const response = await fetch(`/api/monitors/${monitorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update monitor");
      }

      const updatedData = await response.json();
      setMonitor(updatedData.data);
      setShowEditDialog(false);
    } catch (err) {
      console.error("Failed to update monitor:", err);
    }
  };

  const handleToggleMonitor = async () => {
    if (!monitor) return;

    try {
      const response = await fetch(`/api/monitors/${monitorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !monitor.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle monitor");
      }

      const updatedData = await response.json();
      setMonitor(updatedData.data);
    } catch (err) {
      console.error("Failed to toggle monitor:", err);
    }
  };

  const formatLastChecked = (date: Date | null) => {
    if (!date) return "Never";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const formatInterval = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading monitor...</span>
        </div>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Monitor not found</h3>
            <p className="text-muted-foreground">
              {error || "The requested monitor could not be found."}
            </p>
          </div>
          <Link href="/dashboard/monitors">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Monitors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/monitors">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Monitors
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground">
                  <Home className="h-4 w-4 inline mr-1" />
                  Dashboard
                </Link>
                <span className="mx-2">/</span>
                <Link
                  href="/dashboard/monitors"
                  className="hover:text-foreground"
                >
                  Monitors
                </Link>
                <span className="mx-2">/</span>
                <span>{monitor.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlertsDialog(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Alerts
              </Button>
              <Button
                variant={monitor.isActive ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleMonitor}
              >
                {monitor.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Disable
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Enable
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Monitor Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Globe className="h-6 w-6 text-muted-foreground" />
                    {monitor.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    <a
                      href={monitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {monitor.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <MonitorStatusBadge status={monitor.currentStatus} />
                  {!monitor.isActive && (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="space-y-2">
                  <div className="text-muted-foreground font-medium">
                    Method
                  </div>
                  <Badge variant="secondary">{monitor.method}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-muted-foreground font-medium">
                    Check Interval
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatInterval(monitor.interval)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-muted-foreground font-medium">
                    Timeout
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {monitor.timeout}s
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-muted-foreground font-medium">
                    Last Checked
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    {formatLastChecked(monitor.lastCheckedAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Status Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Current Status
                      </span>
                      <MonitorStatusBadge status={monitor.currentStatus} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active</span>
                      <Badge
                        variant={monitor.isActive ? "default" : "secondary"}
                      >
                        {monitor.isActive ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Incident</span>
                      <span className="text-sm text-muted-foreground">
                        {formatLastChecked(monitor.lastIncidentAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Expected Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">Status Codes</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.isArray(monitor.expectedStatusCodes) ? (
                          monitor.expectedStatusCodes.map((code) => (
                            <Badge
                              key={code}
                              variant="outline"
                              className="text-xs"
                            >
                              {code}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            200
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Retries</span>
                      <span className="text-sm">{monitor.retries}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monitor Configuration</CardTitle>
                  <CardDescription>
                    Detailed configuration settings for this monitor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Monitor Name
                      </label>
                      <div className="p-2 bg-muted rounded text-sm">
                        {monitor.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL</label>
                      <div className="p-2 bg-muted rounded text-sm break-all">
                        {monitor.url}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">HTTP Method</label>
                      <div className="p-2 bg-muted rounded text-sm">
                        {monitor.method}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Status Page Slug
                      </label>
                      <div className="p-2 bg-muted rounded text-sm">
                        {monitor.slug ? (
                          <a
                            href={`/status/${monitor.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-blue-600 dark:text-blue-400"
                          >
                            {monitor.slug}{" "}
                            <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {monitor.headers &&
                    Object.keys(monitor.headers).length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Custom Headers
                        </label>
                        <div className="p-3 bg-muted rounded">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(monitor.headers, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                  {monitor.body && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Request Body
                      </label>
                      <div className="p-3 bg-muted rounded">
                        <pre className="text-xs font-mono break-all">
                          {monitor.body}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Monitor History</CardTitle>
                  <CardDescription>
                    Recent monitoring results and incidents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Monitor history and analytics will be available in the
                      next update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Dialogs */}
      <EditMonitorDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdateMonitor}
        monitor={monitor}
      />

      <ManageAlertsDialog
        open={showAlertsDialog}
        onOpenChange={setShowAlertsDialog}
        monitor={monitor}
      />
    </div>
  );
}
