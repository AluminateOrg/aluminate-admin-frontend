'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useAdmin } from '@/contexts/AdminContext';

export function RecentActivity() {
  const { adminActivities } = useAdmin();

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('Restart') || action.includes('Stop')) return 'destructive';
    if (action.includes('Start') || action.includes('Create')) return 'default';
    if (action.includes('Update') || action.includes('Upgrade')) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Admin Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {adminActivities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {activity.adminName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">{activity.adminName}</p>
                  <Badge variant={getActionBadgeVariant(activity.action)} className="text-xs">
                    {activity.action}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.containerName && (
                    <span className="font-medium">{activity.containerName}</span>
                  )}
                  {activity.details && (
                    <span className="ml-1">• {activity.details}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}