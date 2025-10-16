'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Play,
  Square,
  RotateCcw,
  X,
  ExternalLink,
  Shield,
  HardDrive,
} from 'lucide-react';
import { Container } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ContainerCardProps {
  container: Container;
  onAction: (action: string, containerId: string) => void;
}

export function ContainerCard({ container, onAction }: ContainerCardProps) {
  const getStatusColor = (status: Container['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'stopped':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'crashed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'provisioning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTierColor = (tier: Container['subscriptionTier']) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'professional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'starter':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const memberUsagePercent = (container.memberCount / container.memberLimit) * 100;

  return (
    <Card className={cn(
      'relative transition-all duration-200 hover:shadow-md',
      container.isAccessSuspended && 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{container.orgName}</h3>
            <p className="text-sm text-muted-foreground">
              Admin: {container.adminName} • {container.adminEmail}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onAction('view', container.id)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {container.status === 'stopped' && (
                <DropdownMenuItem onClick={() => onAction('start', container.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </DropdownMenuItem>
              )}
              {container.status === 'running' && (
                <DropdownMenuItem onClick={() => onAction('stop', container.id)}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onAction('restart', container.id)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('access', container.id)}>
                <Shield className="mr-2 h-4 w-4" />
                Access Control
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('backup', container.id)}>
                <HardDrive className="mr-2 h-4 w-4" />
                Backup
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onAction('terminate', container.id)}
                className="text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Terminate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(container.status)}>
            {container.status}
          </Badge>
          <Badge className={getTierColor(container.subscriptionTier)}>
            {container.subscriptionTier}
          </Badge>
          {container.isAccessSuspended && (
            <Badge variant="outline" className="border-orange-300 text-orange-600">
              Suspended
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Version</p>
            <p className="font-medium">{container.version}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">
              {formatDistanceToNow(new Date(container.lastUpdated), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Members</span>
            <span className="font-medium">
              {container.memberCount.toLocaleString()} / {container.memberLimit.toLocaleString()}
            </span>
          </div>
          <Progress
            value={Number.isFinite(memberUsagePercent) ? memberUsagePercent : 0}
            className="h-2"
          />

        </div>

        {container.status === 'running' && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground">CPU</p>
              <p className="font-medium">{container.cpuUsage}%</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground">Memory</p>
              <p className="font-medium">{container.memoryUsage}%</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground">Disk</p>
              <p className="font-medium">{container.diskUsage}%</p>
            </div>
          </div>
        )}

        {container.isAccessSuspended && container.suspensionReason && (
          <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-md">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              <span className="font-medium">Suspended:</span> {container.suspensionReason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}