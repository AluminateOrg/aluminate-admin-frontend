'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Container,
  Plus,
  Shield,
  Activity,
  FileText,
  HardDrive,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  DollarSign
  
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';


const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and metrics'
  },
  {
    name: 'Containers',
    href: '/containers',
    icon: Container,
    description: 'Manage all containers'
  },
  {
    name: 'Finances',
    href: '/finances',
    icon: DollarSign,
    description: 'Manage financial aspects'
  },
  {
    name: 'Provision',
    href: '/provision',
    icon: Plus,
    description: 'Create new containers'
  },
  {
    name: 'Inquiries',
    href: '/inquiries',
    icon: MessageSquare,
    description: 'Admin support requests'
  },
  {
    name: 'Access Control',
    href: '/access-control',
    icon: Shield,
    description: 'Manage permissions'
  },
  {
    name: 'Monitoring',
    href: '/monitoring',
    icon: Activity,
    description: 'System health & metrics'
  },
  {
    name: 'Logs',
    href: '/logs',
    icon: FileText,
    description: 'System & admin logs'
  },
  {
    name: 'Backups',
    href: '/backups',
    icon: HardDrive,
    description: 'Backup management'
  },
  {
    name: 'Updates',
    href: '/updates',
    icon: GitBranch,
    description: 'Version control'
  }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'flex flex-col bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm text-muted-foreground">NAVIGATION</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <div className="ml-3 flex-1">
                      <div className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-primary-foreground' : ''
                      )}>
                        {item.name}
                      </div>
                      <div className={cn(
                        'text-xs opacity-75',
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className={cn(
          'text-xs text-muted-foreground',
          collapsed ? 'text-center' : ''
        )}>
          {collapsed ? 'v1.2.3' : 'Alumni Portal Admin v1.2.3'}
        </div>
      </div>
    </div>
  );
}