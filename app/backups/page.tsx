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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  HardDrive,
  Search,
  Filter,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  Database,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/AdminContext';

interface BackupRecord {
  id: string;
  containerId: string;
  containerName: string;
  type: 'full' | 'incremental';
  size: string;
  status: 'completed' | 'failed' | 'in-progress';
  createdAt: string;
  retentionUntil: string;
}

export default function BackupsPage() {
  const { containers } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [containerFilter, setContainerFilter] = useState<string>('all');

  // Mock backup data - TODO: Replace with actual API call
  const [backups] = useState<BackupRecord[]>([
    {
      id: 'bkp_001',
      containerId: 'cnt_001',
      containerName: 'Stanford University',
      type: 'full',
      size: '2.4 GB',
      status: 'completed',
      createdAt: '2024-01-20T02:00:00Z',
      retentionUntil: '2024-04-20T02:00:00Z'
    },
    {
      id: 'bkp_002',
      containerId: 'cnt_002',
      containerName: 'MIT Alumni Network',
      type: 'incremental',
      size: '450 MB',
      status: 'completed',
      createdAt: '2024-01-19T02:00:00Z',
      retentionUntil: '2024-04-19T02:00:00Z'
    },
    {
      id: 'bkp_003',
      containerId: 'cnt_003',
      containerName: 'Berkeley Engineering',
      type: 'full',
      size: '1.8 GB',
      status: 'failed',
      createdAt: '2024-01-18T02:00:00Z',
      retentionUntil: '2024-04-18T02:00:00Z'
    },
    {
      id: 'bkp_004',
      containerId: 'cnt_001',
      containerName: 'Stanford University',
      type: 'incremental',
      size: '320 MB',
      status: 'in-progress',
      createdAt: '2024-01-21T02:00:00Z',
      retentionUntil: '2024-04-21T02:00:00Z'
    }
  ]);

  const filteredBackups = backups.filter((backup) => {
    const matchesSearch = backup.containerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         backup.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || backup.status === statusFilter;
    const matchesType = typeFilter === 'all' || backup.type === typeFilter;
    const matchesContainer = containerFilter === 'all' || backup.containerId === containerFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesContainer;
  });

  const handleCreateBackup = (containerId: string, type: 'full' | 'incremental') => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: `Creating ${type} backup for ${container.orgName}...`,
        success: `${type} backup created successfully`,
        error: `Failed to create ${type} backup`,
      }
    );
  };

  const handleRestoreBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 5000)),
      {
        loading: `Restoring ${backup.containerName} from backup...`,
        success: `${backup.containerName} restored successfully`,
        error: `Failed to restore ${backup.containerName}`,
      }
    );
  };

  const handleDeleteBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    toast.success(`Backup ${backup.id} deleted successfully`);
  };

  const getStatusIcon = (status: BackupRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: BackupRecord['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Failed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">In Progress</Badge>;
      default:
        return null;
    }
  };

  const statusCounts = backups.reduce((acc, backup) => {
    acc[backup.status] = (acc[backup.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-muted-foreground">
            Manage backups and restore points for all containers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {containers.filter(c => c.status === 'running').map((container) => (
                <div key={container.id}>
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    {container.orgName}
                  </div>
                  <DropdownMenuItem onClick={() => handleCreateBackup(container.id, 'full')}>
                    <Database className="mr-2 h-4 w-4" />
                    Full Backup
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateBackup(container.id, 'incremental')}>
                    <HardDrive className="mr-2 h-4 w-4" />
                    Incremental Backup
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Overview */}
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
          Completed: {statusCounts.completed || 0}
        </Badge>
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
          In Progress: {statusCounts['in-progress'] || 0}
        </Badge>
        <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20">
          Failed: {statusCounts.failed || 0}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search backups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={containerFilter} onValueChange={setContainerFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by container" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Containers</SelectItem>
            {containers.map((container) => (
              <SelectItem key={container.id} value={container.id}>
                {container.orgName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="incremental">Incremental</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Backups Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Backup History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Container</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Retention Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBackups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{backup.containerName}</div>
                      <div className="text-sm text-muted-foreground">{backup.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      backup.type === 'full' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }>
                      {backup.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{backup.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(backup.status)}
                      {getStatusBadge(backup.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(backup.retentionUntil), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {backup.status === 'completed' && (
                          <>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Restore
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restore Container</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to restore {backup.containerName} from this backup? 
                                    This action will overwrite the current container state and cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRestoreBackup(backup.id)}>
                                    Restore
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this backup? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteBackup(backup.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBackups.length === 0 && (
            <div className="text-center py-12">
              <HardDrive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || containerFilter !== 'all'
                  ? 'No backups match your filters'
                  : 'No backups found'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}