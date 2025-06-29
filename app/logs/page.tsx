'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  container?: string;
  message: string;
  details?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: 'log_001',
    timestamp: '2024-01-20T15:30:00Z',
    level: 'error',
    source: 'Container Manager',
    container: 'Stanford University',
    message: 'Container restart failed due to insufficient memory',
    details: 'Memory limit exceeded: 2.1GB/2GB allocated'
  },
  {
    id: 'log_002',
    timestamp: '2024-01-20T15:25:00Z',
    level: 'info',
    source: 'Provisioning Service',
    container: 'MIT Alumni Network',
    message: 'Container successfully provisioned',
    details: 'Deployment completed in 4m 32s'
  },
  {
    id: 'log_003',
    timestamp: '2024-01-20T15:20:00Z',
    level: 'warning',
    source: 'Backup Service',
    container: 'Berkeley Engineering',
    message: 'Backup process delayed due to high system load',
    details: 'Scheduled backup will retry in 30 minutes'
  },
  {
    id: 'log_004',
    timestamp: '2024-01-20T15:15:00Z',
    level: 'success',
    source: 'Authentication Service',
    message: 'Admin login successful',
    details: 'User: admin@example.com, IP: 192.168.1.100'
  },
  {
    id: 'log_005',
    timestamp: '2024-01-20T15:10:00Z',
    level: 'info',
    source: 'System Monitor',
    message: 'System health check completed',
    details: 'All services operational, CPU: 45%, Memory: 67%'
  }
];

export default function LogsPage() {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.container && log.container.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter;
    
    return matchesSearch && matchesLevel && matchesSource;
  });

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadgeVariant = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'outline';
    }
  };

  const uniqueSources = Array.from(new Set(logs.map(log => log.source)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">
            Monitor system events and container activities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Log Entries</span>
            <Badge variant="outline">
              {filteredLogs.length} entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-0">
              {filteredLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium text-muted-foreground">
                            {log.source}
                          </span>
                          {log.container && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm font-medium">
                                {log.container}
                              </span>
                            </>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground ml-auto">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-1">
                          {log.message}
                        </p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < filteredLogs.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || levelFilter !== 'all' || sourceFilter !== 'all'
              ? 'No logs match your filters'
              : 'No logs found'
            }
          </div>
        </div>
      )}
    </div>
  );
}