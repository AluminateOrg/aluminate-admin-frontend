'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Server,
  Users,
  Activity,
  HardDrive,
  Zap,
  Globe,
  Database,
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export function MetricsGrid() {
  const { systemMetrics } = useAdmin();

  const metrics = [
    {
      title: 'Total Containers',
      value: systemMetrics.totalContainers,
      subtitle: `${systemMetrics.runningContainers} running`,
      icon: Server,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Active Members',
      value: systemMetrics.totalMembers.toLocaleString(),
      subtitle: 'Across all portals',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'System Load',
      value: `${systemMetrics.systemLoad}%`,
      subtitle: 'Current utilization',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      progress: systemMetrics.systemLoad
    },
    {
      title: 'Network Traffic',
      value: `${systemMetrics.networkTraffic} TB`,
      subtitle: 'This month',
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Storage Used',
      value: `${systemMetrics.storageUsed} TB`,
      subtitle: 'Total across all containers',
      icon: HardDrive,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
    },
    {
      title: 'Active Backups',
      value: systemMetrics.activeBackups,
      subtitle: 'In progress',
      icon: Database,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.subtitle}
              </p>
              {typeof metric.progress === "number" && !isNaN(metric.progress) ? (
                <div className="mt-3">
                  <Progress value={metric.progress} className="h-2" />
                </div>
              ) : (
                <div className="mt-3">
                  <Progress value={0} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}