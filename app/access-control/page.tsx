'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';

export default function AccessControlPage() {
  const { containers } = useAdmin();
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [ipRestrictions, setIpRestrictions] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const selectedContainerData = containers.find(c => c.id === selectedContainer);

  const handleToggleAccess = async (suspend: boolean) => {
    if (!selectedContainer) return;

    const action = suspend ? 'suspend' : 'restore';
    const reason = suspend ? suspensionReason : '';

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `${suspend ? 'Suspending' : 'Restoring'} access...`,
        success: `Access ${suspend ? 'suspended' : 'restored'} successfully`,
        error: `Failed to ${action} access`,
      }
    );
  };

  const handleUpdateIpRestrictions = async () => {
    if (!selectedContainer) return;

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Updating IP restrictions...',
        success: 'IP restrictions updated successfully',
        error: 'Failed to update IP restrictions',
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Access Control</h1>
          <p className="text-muted-foreground">
            Manage container access permissions and restrictions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <Badge variant="outline">Security Management</Badge>
        </div>
      </div>

      {/* Container Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Container</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="container">Container</Label>
              <Select value={selectedContainer} onValueChange={setSelectedContainer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a container to manage" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map((container) => (
                    <SelectItem key={container.id} value={container.id}>
                      <div className="flex items-center space-x-2">
                        <span>{container.orgName}</span>
                        <Badge 
                          variant={container.isAccessSuspended ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {container.isAccessSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedContainerData && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{selectedContainerData.orgName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Admin: {selectedContainerData.adminName} • {selectedContainerData.adminEmail}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedContainerData.isAccessSuspended ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <Badge 
                      variant={selectedContainerData.isAccessSuspended ? 'destructive' : 'default'}
                    >
                      {selectedContainerData.isAccessSuspended ? 'Access Suspended' : 'Access Active'}
                    </Badge>
                  </div>
                </div>
                {selectedContainerData.suspensionReason && (
                  <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                    <p className="text-sm text-destructive">
                      <span className="font-medium">Suspension Reason:</span> {selectedContainerData.suspensionReason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedContainer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Access Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Container Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable access to this container
                  </p>
                </div>
                <Switch 
                  checked={!selectedContainerData?.isAccessSuspended}
                  onCheckedChange={(checked) => handleToggleAccess(!checked)}
                />
              </div>

              {selectedContainerData?.isAccessSuspended && (
                <div className="space-y-2">
                  <Label htmlFor="restore-reason">Restoration Notes</Label>
                  <Textarea
                    id="restore-reason"
                    placeholder="Reason for restoring access..."
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleToggleAccess(false)}
                    className="w-full"
                  >
                    Restore Access
                  </Button>
                </div>
              )}

              {!selectedContainerData?.isAccessSuspended && (
                <div className="space-y-2">
                  <Label htmlFor="suspension-reason">Suspension Reason *</Label>
                  <Textarea
                    id="suspension-reason"
                    placeholder="Reason for suspending access..."
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    required
                  />
                  <Button 
                    variant="destructive"
                    onClick={() => handleToggleAccess(true)}
                    disabled={!suspensionReason.trim()}
                    className="w-full"
                  >
                    Suspend Access
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* IP Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle>IP Restrictions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip-restrictions">Allowed IP Addresses</Label>
                <Textarea
                  id="ip-restrictions"
                  placeholder="Enter IP addresses or ranges (one per line)&#10;192.168.1.0/24&#10;10.0.0.1&#10;203.0.113.0/24"
                  value={ipRestrictions}
                  onChange={(e) => setIpRestrictions(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to allow access from any IP address. Use CIDR notation for ranges.
                </p>
              </div>

              <Button 
                onClick={handleUpdateIpRestrictions}
                className="w-full"
              >
                Update IP Restrictions
              </Button>

              {selectedContainerData?.ipRestrictions && selectedContainerData.ipRestrictions.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Restrictions</Label>
                  <div className="space-y-1">
                    {selectedContainerData.ipRestrictions.map((ip, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {ip}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedContainer && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Container</h3>
            <p className="text-muted-foreground">
              Choose a container from the dropdown above to manage its access controls
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}