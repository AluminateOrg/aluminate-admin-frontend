"use client";

import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { ContainerStatusChart } from "@/components/dashboard/ContainerStatusChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Users, Server } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  // check backend connectivity
  const [pingResult, setPingResult] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetch(`${backendUrl}/ping`)
      .then((res) => res.json())
      .then((data) => {
        setPingResult(data.status);
      })
      .catch(() => setPingResult("error"));
  }, [backendUrl]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your Alumni Portal infrastructure {pingResult}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>All Systems Operational</span>
          </Badge>
          <Button>View All Containers</Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContainerStatusChart />
        <RecentActivity />
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>System Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Berkeley Engineering container requires attention
                </p>
                <p className="text-xs text-muted-foreground">
                  Payment overdue - access suspended
                </p>
              </div>
              <Button size="sm" variant="outline">
                Review
              </Button>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  High memory usage detected
                </p>
                <p className="text-xs text-muted-foreground">
                  Stanford University container using 85% memory
                </p>
              </div>
              <Button size="sm" variant="outline">
                Monitor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
