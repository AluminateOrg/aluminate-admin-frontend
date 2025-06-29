export interface Container {
  id: string;
  orgName: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  status: 'running' | 'stopped' | 'crashed' | 'provisioning';
  createdAt: string;
  lastUpdated: string;
  version: string;
  adminEmail: string;
  adminName: string;
  memberCount: number;
  memberLimit: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  monthlyTraffic: number;
  isAccessSuspended: boolean;
  suspensionReason?: string;
  ipRestrictions: string[];
  lastBackup?: string;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export interface SystemLog {
  id: string;
  containerId: string;
  type: 'startup' | 'crash' | 'warning' | 'info' | 'error';
  message: string;
  timestamp: string;
  details?: string;
}

export interface AdminActivity {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  containerId?: string;
  containerName?: string;
  details: string;
  timestamp: string;
}

export interface BackupRecord {
  id: string;
  containerId: string;
  type: 'full' | 'incremental';
  size: string;
  status: 'completed' | 'failed' | 'in-progress';
  createdAt: string;
  retentionUntil: string;
}

export interface ProvisionForm {
  orgName: string;
  adminName: string;
  adminEmail: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  initialMembers: number;
  customDomain?: string;
  features: string[];
  notes?: string;
}

export interface SystemMetrics {
  totalContainers: number;
  runningContainers: number;
  totalMembers: number;
  systemLoad: number;
  networkTraffic: number;
  storageUsed: number;
  activeBackups: number;
}

export interface Inquiry {
  id: string;
  subject: string;
  message: string;
  adminName: string;
  adminEmail: string;
  containerName: string;
  containerId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report' | 'general';
  createdAt: string;
  updatedAt: string;
  isStarred: boolean;
  responses: InquiryResponse[];
  attachments?: string[];
}

export interface InquiryResponse {
  id: string;
  message: string;
  author: string;
  authorType: 'admin' | 'system-admin';
  timestamp: string;
}