'use client';

import { createContext, useContext, useState } from 'react';
import { Container, SystemMetrics, AdminActivity } from '@/types';

interface AdminContextType {
  containers: Container[];
  systemMetrics: SystemMetrics;
  adminActivities: AdminActivity[];
  selectedContainer: Container | null;
  setSelectedContainer: (container: Container | null) => void;
  refreshContainers: () => void;
  refreshMetrics: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // TODO: Replace with actual API calls
  const [containers] = useState<Container[]>([
    {
      id: 'cnt_001',
      orgName: 'Stanford University',
      subscriptionTier: 'enterprise',
      status: 'running',
      createdAt: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-20T14:22:00Z',
      version: 'v1.2.3',
      adminEmail: 'admin@stanford.edu',
      adminName: 'Sarah Johnson',
      memberCount: 1247,
      memberLimit: 5000,
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 32,
      monthlyTraffic: 1.2,
      isAccessSuspended: false,
      ipRestrictions: [],
      lastBackup: '2024-01-20T02:00:00Z',
      healthStatus: 'healthy'
    },
    {
      id: 'cnt_002',
      orgName: 'MIT Alumni Network',
      subscriptionTier: 'professional',
      status: 'running',
      createdAt: '2024-01-10T09:15:00Z',
      lastUpdated: '2024-01-19T16:45:00Z',
      version: 'v1.2.2',
      adminEmail: 'alumni@mit.edu',
      adminName: 'David Chen',
      memberCount: 423,
      memberLimit: 1000,
      cpuUsage: 23,
      memoryUsage: 45,
      diskUsage: 28,
      monthlyTraffic: 0.8,
      isAccessSuspended: false,
      ipRestrictions: [],
      lastBackup: '2024-01-19T02:00:00Z',
      healthStatus: 'healthy'
    },
    {
      id: 'cnt_003',
      orgName: 'Berkeley Engineering',
      subscriptionTier: 'starter',
      status: 'stopped',
      createdAt: '2024-01-05T14:20:00Z',
      lastUpdated: '2024-01-18T11:30:00Z',
      version: 'v1.1.8',
      adminEmail: 'eng@berkeley.edu',
      adminName: 'Maria Rodriguez',
      memberCount: 156,
      memberLimit: 250,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 15,
      monthlyTraffic: 0.1,
      isAccessSuspended: true,
      suspensionReason: 'Payment overdue',
      ipRestrictions: [],
      lastBackup: '2024-01-17T02:00:00Z',
      healthStatus: 'warning'
    }
  ]);

  const [systemMetrics] = useState<SystemMetrics>({
    totalContainers: 24,
    runningContainers: 18,
    totalMembers: 12547,
    systemLoad: 72,
    networkTraffic: 15.7,
    storageUsed: 2.4,
    activeBackups: 3
  });

  const [adminActivities] = useState<AdminActivity[]>([
    {
      id: 'act_001',
      adminId: 'admin_001',
      adminName: 'John Doe',
      action: 'Container Restart',
      containerId: 'cnt_001',
      containerName: 'Stanford University',
      details: 'Manual restart due to performance issues',
      timestamp: '2024-01-20T15:30:00Z'
    },
    {
      id: 'act_002',
      adminId: 'admin_002',
      adminName: 'Jane Smith',
      action: 'Subscription Update',
      containerId: 'cnt_002',
      containerName: 'MIT Alumni Network',
      details: 'Upgraded from starter to professional tier',
      timestamp: '2024-01-20T14:15:00Z'
    }
  ]);

  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  const refreshContainers = () => {
    // TODO: Implement API call to refresh containers
    console.log('Refreshing containers...');
  };

  const refreshMetrics = () => {
    // TODO: Implement API call to refresh system metrics
    console.log('Refreshing metrics...');
  };

  return (
    <AdminContext.Provider
      value={{
        containers,
        systemMetrics,
        adminActivities,
        selectedContainer,
        setSelectedContainer,
        refreshContainers,
        refreshMetrics
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}