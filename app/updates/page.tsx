'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  GitBranch,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Info,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/AdminContext';

interface UpdateVersion {
  version: string;
  releaseDate: string;
  status: 'available' | 'installed' | 'installing';
  type: 'major' | 'minor' | 'patch' | 'security';
  changelog: string[];
  size: string;
  compatibility: string[];
}

interface ContainerUpdate {
  containerId: string;
  containerName: string;
  currentVersion: string;
  targetVersion: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export default function UpdatesPage() {
  const { containers } = useAdmin();
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [updateMode, setUpdateMode] = useState<'manual' | 'scheduled'>('manual');

  // Mock update data - TODO: Replace with actual API calls
  const [availableVersions] = useState<UpdateVersion[]>([
    {
      version: 'v1.3.0',
      releaseDate: '2024-01-22T10:00:00Z',
      status: 'available',
      type: 'minor',
      changelog: [
        'New member analytics dashboard',
        'Enhanced event management features',
        'Improved mobile responsiveness',
        'Bug fixes and performance improvements'
      ],
      size: '45 MB',
      compatibility: ['v1.2.x', 'v1.1.x']
    },
    {
      version: 'v1.2.4',
      releaseDate: '2024-01-20T14:30:00Z',
      status: 'available',
      type: 'patch',
      changelog: [
        'Fixed email notification bug',
        'Improved database query performance',
        'Updated security dependencies'
      ],
      size: '12 MB',
      compatibility: ['v1.2.x']
    },
    {
      version: 'v1.2.3',
      releaseDate: '2024-01-15T09:00:00Z',
      status: 'installed',
      type: 'patch',
      changelog: [
        'Security patch for authentication',
        'Fixed member import issues',
        'UI improvements'
      ],
      size: '8 MB',
      compatibility: ['v1.2.x']
    }
  ]);

  const [containerUpdates] = useState<ContainerUpdate[]>([
    {
      containerId: 'cnt_001',
      containerName: 'Stanford University',
      currentVersion: 'v1.2.3',
      targetVersion: 'v1.3.0',
      status: 'in-progress',
      progress: 65,
      startedAt: '2024-01-22T15:30:00Z'
    },
    {
      containerId: 'cnt_002',
      containerName: 'MIT Alumni Network',
      currentVersion: 'v1.2.2',
      targetVersion: 'v1.2.4',
      status: 'completed',
      progress: 100,
      startedAt: '2024-01-22T14:00:00Z',
      completedAt: '2024-01-22T14:15:00Z'
    }
  ]);

  const handleUpdateContainer = async (containerId: string, version: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: `Starting update for ${container.orgName}...`,
        success: `Update initiated for ${container.orgName}`,
        error: `Failed to start update for ${container.orgName}`,
      }
    );
  };

  const handleBulkUpdate = async () => {
    if (!selectedVersion) return;

    const selectedContainers = containers.filter(c => 
      c.status === 'running' && c.version !== selectedVersion
    );

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Starting bulk update for ${selectedContainers.length} containers...`,
        success: `Bulk update initiated for ${selectedContainers.length} containers`,
        error: 'Failed to start bulk update',
      }
    );
  };

  const getVersionBadgeVariant = (type: UpdateVersion['type']) => {
    switch (type) {
      case 'major':
        return 'destructive';
      case 'minor':
        return 'default';
      case 'patch':
        return 'secondary';
      case 'security':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: ContainerUpdate['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ContainerUpdate['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Failed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Pending</Badge>;
      default:
        return null;
    }
  };

  const outdatedContainers = containers.filter(c => c.version !== 'v1.3.0');
  const upToDateContainers = containers.filter(c => c.version === 'v1.3.0');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Version Control & Updates</h1>
          <p className="text-muted-foreground">
            Manage container versions and deploy updates across all instances
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center space-x-1">
            <GitBranch className="h-3 w-3" />
            <span>Latest: v1.3.0</span>
          </Badge>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check for Updates
          </Button>
        </div>
      </div>

      {/* Update Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Up to Date</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upToDateContainers.length}</div>
            <p className="text-xs text-muted-foreground">
              Running latest version
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updates Available</CardTitle>
            <Download className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outdatedContainers.length}</div>
            <p className="text-xs text-muted-foreground">
              Containers need updating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {containerUpdates.filter(u => u.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently updating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Versions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>Available Versions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableVersions.map((version) => (
              <div key={version.version} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{version.version}</h3>
                      <Badge variant={getVersionBadgeVariant(version.type)}>
                        {version.type}
                      </Badge>
                      {version.status === 'installed' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Released {formatDistanceToNow(new Date(version.releaseDate), { addSuffix: true })} • {version.size}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Info className="h-4 w-4 mr-2" />
                        Changelog
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{version.version} Changelog</DialogTitle>
                        <DialogDescription>
                          Released on {new Date(version.releaseDate).toLocaleDateString()}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-96">
                        <ul className="space-y-2">
                          {version.changelog.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  
                  {version.status === 'available' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Deploy
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deploy {version.version}</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will update all compatible containers to {version.version}. 
                            This action cannot be undone. Make sure you have recent backups.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleBulkUpdate()}>
                            Deploy Update
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Update Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Update Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version to deploy" />
                </SelectTrigger>
                <SelectContent>
                  {availableVersions
                    .filter(v => v.status === 'available')
                    .map((version) => (
                      <SelectItem key={version.version} value={version.version}>
                        {version.version} ({version.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={updateMode} onValueChange={(value: any) => setUpdateMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleBulkUpdate}
              disabled={!selectedVersion}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Bulk Update
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedVersion && (
              <p>
                {outdatedContainers.length} containers will be updated to {selectedVersion}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Progress */}
      {containerUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Update Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container</TableHead>
                  <TableHead>From Version</TableHead>
                  <TableHead>To Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containerUpdates.map((update) => (
                  <TableRow key={update.containerId}>
                    <TableCell className="font-medium">
                      {update.containerName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{update.currentVersion}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{update.targetVersion}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(update.status)}
                        {getStatusBadge(update.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={update.progress} className="w-20" />
                        <span className="text-xs text-muted-foreground">
                          {update.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {update.startedAt && (
                        <div className="text-sm">
                          {update.completedAt ? (
                            <span>
                              {Math.round(
                                (new Date(update.completedAt).getTime() - 
                                 new Date(update.startedAt).getTime()) / 60000
                              )} min
                            </span>
                          ) : (
                            <span>
                              {formatDistanceToNow(new Date(update.startedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Container Version Status */}
      <Card>
        <CardHeader>
          <CardTitle>Container Version Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Container</TableHead>
                <TableHead>Current Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.map((container) => (
                <TableRow key={container.id}>
                  <TableCell className="font-medium">
                    {container.orgName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{container.version}</Badge>
                  </TableCell>
                  <TableCell>
                    {container.version === 'v1.3.0' ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Up to Date
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                        Update Available
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(container.lastUpdated), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    {container.version !== 'v1.3.0' && container.status === 'running' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Update
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Update Container</AlertDialogTitle>
                            <AlertDialogDescription>
                              Update {container.orgName} from {container.version} to v1.3.0?
                              This will cause a brief service interruption.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleUpdateContainer(container.id, 'v1.3.0')}
                            >
                              Update
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}