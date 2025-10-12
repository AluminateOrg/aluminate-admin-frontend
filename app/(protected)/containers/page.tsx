'use client';

import { useState } from 'react';
import { ContainerCard } from '@/components/containers/ContainerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search,Plus, RefreshCw } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ContainersPage() {
  const { containers, refreshContainers } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const router = useRouter();

  const filteredContainers = containers.filter((container) => {
    const matchesSearch = container.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         container.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || container.status === statusFilter;
    const matchesTier = tierFilter === 'all' || container.subscriptionTier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleContainerAction = async (action: string, containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;

    switch (action) {
      case 'view':
        router.push(`/containers/${containerId}`);
        break;
      case 'start':
        toast.promise(
          new Promise(resolve => setTimeout(resolve, 2000)),
          {
            loading: `Starting ${container.orgName}...`,
            success: `${container.orgName} started successfully`,
            error: `Failed to start ${container.orgName}`,
          }
        );
        break;
      case 'stop':
        toast.promise(
          new Promise(resolve => setTimeout(resolve, 2000)),
          {
            loading: `Stopping ${container.orgName}...`,
            success: `${container.orgName} stopped successfully`,
            error: `Failed to stop ${container.orgName}`,
          }
        );
        break;
      case 'restart':
        toast.promise(
          new Promise(resolve => setTimeout(resolve, 3000)),
          {
            loading: `Restarting ${container.orgName}...`,
            success: `${container.orgName} restarted successfully`,
            error: `Failed to restart ${container.orgName}`,
          }
        );
        break;
      case 'terminate':
        toast.error('Container termination requires confirmation dialog');
        break;
      case 'access':
        router.push(`/access-control?container=${containerId}`);
        break;
      case 'backup':
        router.push(`/backups?container=${containerId}`);
        break;
      default:
        console.log(`Action ${action} for container ${containerId}`);
    }
  };

  const statusCounts = containers.reduce((acc, container) => {
    acc[container.status] = (acc[container.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Container Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all Alumni Portal containers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={refreshContainers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/provision')}>
            <Plus className="h-4 w-4 mr-2" />
            New Container
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
          Running: {statusCounts.running || 0}
        </Badge>
        <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/20">
          Stopped: {statusCounts.stopped || 0}
        </Badge>
        <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20">
          Crashed: {statusCounts.crashed || 0}
        </Badge>
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
          Provisioning: {statusCounts.provisioning || 0}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search containers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="stopped">Stopped</SelectItem>
            <SelectItem value="crashed">Crashed</SelectItem>
            <SelectItem value="provisioning">Provisioning</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Container Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContainers.map((container) => (
          <ContainerCard
            key={container.id}
            container={container}
            onAction={handleContainerAction}
          />
        ))}
      </div>

      {filteredContainers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || tierFilter !== 'all'
              ? 'No containers match your filters'
              : 'No containers found'
            }
          </div>
        </div>
      )}
    </div>
  );
}