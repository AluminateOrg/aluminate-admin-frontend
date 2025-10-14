'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export default function MonitoringPage() {
  const { containers, refreshContainers } = useAdmin();

  const runningContainers = containers.filter(c => c.status === 'running');
  const avgCpuUsage = runningContainers.reduce((acc, c) => acc + c.cpuUsage, 0) / runningContainers.length || 0;
  const avgMemoryUsage = runningContainers.reduce((acc, c) => acc + c.memoryUsage, 0) / runningContainers.length || 0;
  const avgDiskUsage = runningContainers.reduce((acc, c) => acc + c.diskUsage, 0) / runningContainers.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and health status of all containers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Monitoring</span>
          </Badge>
          <Button variant="outline" onClick={refreshContainers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCpuUsage.toFixed(1)}%</div>
            <Progress value={Number.isFinite(avgCpuUsage) ? avgCpuUsage : 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Average CPU usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMemoryUsage.toFixed(1)}%</div>
            <Progress value={Number.isFinite(avgMemoryUsage) ? avgMemoryUsage : 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Average memory usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDiskUsage.toFixed(1)}%</div>
            <Progress value={Number.isFinite(avgDiskUsage) ? avgDiskUsage : 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Average disk usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Containers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningContainers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {containers.length} total containers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Container Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Container Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {containers.map((container) => (
              <div key={container.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {container.status === 'running' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    <div>
                      <p className="font-medium">{container.orgName}</p>
                      <p className="text-sm text-muted-foreground">
                        {container.adminName} • {container.subscriptionTier}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {container.status === 'running' && (
                    <>
                      <div className="text-center">
                        <p className="text-sm font-medium">{container.cpuUsage}%</p>
                        <p className="text-xs text-muted-foreground">CPU</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{container.memoryUsage}%</p>
                        <p className="text-xs text-muted-foreground">Memory</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{container.diskUsage}%</p>
                        <p className="text-xs text-muted-foreground">Disk</p>
                      </div>
                    </>
                  )}
                  
                  <Badge 
                    variant={container.status === 'running' ? 'default' : 'secondary'}
                    className={
                      container.status === 'running' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : container.status === 'stopped'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }
                  >
                    {container.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Network className="h-5 w-5" />
              <span>Network Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {containers.filter(c => c.status === 'running').map((container) => (
                <div key={container.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{container.orgName}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">{container.monthlyTraffic} TB</p>
                    <p className="text-xs text-muted-foreground">this month</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {containers.filter(c => c.memoryUsage > 80 || c.cpuUsage > 80).length > 0 ? (
                containers
                  .filter(c => c.memoryUsage > 80 || c.cpuUsage > 80)
                  .map((container) => (
                    <div key={container.id} className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">High resource usage detected</p>
                        <p className="text-xs text-muted-foreground">
                          {container.orgName} - CPU: {container.cpuUsage}%, Memory: {container.memoryUsage}%
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm">All systems operating normally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}