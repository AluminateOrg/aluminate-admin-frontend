'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Save,
  Trash2,
  Download,
  Upload,
  Plus,
  Edit,
  DollarSign,
  Cpu,
  Users,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import axiosSuperAdmin from '@/axiosInstances/axiosSuperAdmin';
import axiosGlobal from '@/axiosInstances/axiosGlobal';
import { get } from 'node:http';

// Map local feature keys to backend feature IDs
const FEATURE_MAP: Record<string, number> = {
  backups: 1,
  monitoring: 2,
  prioritySupport: 3,
};



export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    containerAlerts: true,
    systemUpdates: true,
    securityAlerts: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    sessionTimeout: '24',
    maxLoginAttempts: '5',
  });

  // Subscriptions / Plans state
  const [plans, setPlans] = useState(() => [
    {
      id: 'basic',
      name: 'Basic',
      storageGB: 10,
      cpu: 1,
      ramGB: 1,
      maxMembers: 3,
      durationMonths: 1,
      price: 0,
      features: { backups: false, monitoring: false, prioritySupport: false },
    },
    {
      id: 'advance',
      name: 'Advance',
      storageGB: 50,
      cpu: 2,
      ramGB: 4,
      maxMembers: 10,
      durationMonths: 1,
      price: 29,
      features: { backups: true, monitoring: true, prioritySupport: false },
    },
    {
      id: 'premium',
      name: 'Premium',
      storageGB: 200,
      cpu: 4,
      ramGB: 8,
      maxMembers: 50,
      durationMonths: 1,
      price: 99,
      features: { backups: true, monitoring: true, prioritySupport: true },
    },
  ]);

  const [plansDialogOpen, setPlansDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null as any);

  // Features state
  const [features, setFeatures] = useState<any[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');

  const getPlans = async () => {
    try {
      const { data } = await axiosSuperAdmin.get('/subscription-plan')
      console.log("Data that fetched", data)
      if (!Array.isArray(data)) {
        setPlans([]);
        return;
      }
      const mapped = data.map((p: any) => {
        // Build a dynamic features selection map using backend IDs
        const selectedFeatures: Record<number, boolean> = {};
        (p.subscriptionPlanFeatures || []).forEach((sf:any) => {
          const backendFeatureId = sf?.planFeature?.id ?? sf.featureId;
          const enabled = Boolean(sf.enabled);
          if (backendFeatureId != null) {
            selectedFeatures[Number(backendFeatureId)] = enabled;
          }
        });

        return {
          id: String(p.id),
          name: p.name ?? '',
          storageGB: p.storageInGB ?? p.storageInGb ?? 0,
          cpu: p.cpu ?? 1,
          ramGB: p.ram ?? p.ramGB ?? 1,
          maxMembers: p.memberLimit ?? 1,
          durationMonths: p.durationInMonths ?? 1,
          price: p.price ?? 0,
          // keep UI compatibility by exposing booleans for known labels if present
          features: {
            // Rendered table will still check these three keys for display text
            backups: selectedFeatures[1] ?? false,
            monitoring: selectedFeatures[2] ?? false,
            prioritySupport: selectedFeatures[3] ?? false,
            // also retain the raw dynamic map
            _map: selectedFeatures,
          },
        };
      });

      setPlans(mapped);
    } catch (error) {
      console.error('Failed to fetch plans', error);
      toast.error('Failed to fetch plans');
      setPlans([]); // clear plans on error
    }
  }

  const getFeatures = async () => {
    try {
      setFeaturesLoading(true);
      const { data } = await axiosSuperAdmin.get('/feature');
      console.log("Fetched features", data);
      const list = Array.isArray(data.data) ? data.data : [];
      // normalize ids as numbers
      setFeatures(list.map((f: any) => ({ id: Number(f.id), name: f.name })));
    } catch (error) {
      console.error('Failed to fetch features', error);
      toast.error('Failed to fetch features');
      setFeatures([]);
    } finally {
      setFeaturesLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setPlansDialogOpen(true);
  };

  const openEditDialog = (plan: any) => {
    setEditingPlan(plan);
    setPlansDialogOpen(true);
  };

  const handleSavePlan = (plan: any) => {
    if (plan.id) {
      // update
      setPlans(prev => prev.map(p => (p.id === plan.id ? plan : p)));
      toast.success('Plan updated');
    } else {
      // create new with generated id
      const newPlan = { ...plan, id: `${plan.name.toLowerCase()}-${Date.now()}` };
      setPlans(prev => [newPlan, ...prev]);
      toast.success('Plan created');
    }
    setPlansDialogOpen(false);
  };

  const handleDeletePlan = async (id: string) => {
    try {
      
      const {data} = await axiosSuperAdmin.get(`/subscription-plan/delete/${id}`);
      if (data) {
        getPlans();
        toast.success('Plan deleted');
      } else {
        toast.error('Failed to delete plan');
        getPlans();
      }
    } catch (error) {
      console.error('Failed to delete plan', error);
      toast.error('Failed to delete plan');
    }
  };

  const handleCreateFeature = async () => {
    const name = newFeatureName.trim();
    if (!name) {
      toast.error('Feature name is required');
      return;
    }
    try {
      await toast.promise(
        axiosSuperAdmin.post('/feature/create', { name }),
        {
          loading: 'Creating feature...',
          success: 'Feature created',
          error: 'Failed to create feature',
        }
      );
      setNewFeatureName('');
      getFeatures();
    } catch (error) {
      console.error('Create feature error', error);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    try {
      await toast.promise(
        axiosSuperAdmin.get(`/feature/delete/${id}`),
        {
          loading: 'Deleting feature...',
          success: 'Feature deleted',
          error: 'Failed to delete feature',
        }
      );
      getFeatures();
    } catch (error) {
      console.error('Delete feature error', error);
    }
  };

  const handleSaveNotifications = async () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: 'Saving notification preferences...',
        success: 'Notification preferences saved',
        error: 'Failed to save preferences',
      }
    );
  };

  const handleSaveSystemSettings = async () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Updating system settings...',
        success: 'System settings updated',
        error: 'Failed to update settings',
      }
    );
  };

  const handleExportSettings = async () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Exporting settings...',
        success: 'Settings exported successfully',
        error: 'Failed to export settings',
      }
    );
  };

  const handleImportSettings = async () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Importing settings...',
        success: 'Settings imported successfully',
        error: 'Failed to import settings',
      }
    );
  };

  const handleResetSettings = async () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: 'Resetting to defaults...',
        success: 'Settings reset to defaults',
        error: 'Failed to reset settings',
      }
    );
  };

  useEffect(() => {
    getPlans();
    getFeatures();
    const intervalId = window.setInterval(() => {
      getPlans();
      getFeatures();
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences and administrative settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportSettings}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="pst">Pacific Standard Time</SelectItem>
                      <SelectItem value="est">Eastern Standard Time</SelectItem>
                      <SelectItem value="cst">Central Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveSystemSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive critical alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Container Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerts for container status changes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.containerAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, containerAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for system updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, systemUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical security notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, securityAlerts: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) =>
                      setSystemSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))
                    }
                    min="1"
                    max="168"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Maximum Login Attempts</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    value={systemSettings.maxLoginAttempts}
                    onChange={(e) =>
                      setSystemSettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))
                    }
                    min="3"
                    max="10"
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Password Policy</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Minimum 8 characters</p>
                    <p>• At least one uppercase letter</p>
                    <p>• At least one number</p>
                    <p>• At least one special character</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSystemSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable daily automatic backups
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) =>
                      setSystemSettings(prev => ({ ...prev, autoBackup: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable system maintenance mode
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select
                    value={systemSettings.logLevel}
                    onValueChange={(value) =>
                      setSystemSettings(prev => ({ ...prev, logLevel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveSystemSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Advanced Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging and debugging
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.debugMode}
                    onCheckedChange={(checked) =>
                      setSystemSettings(prev => ({ ...prev, debugMode: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <div className="p-4 border border-destructive/20 rounded-lg space-y-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset All Settings
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will reset all settings to their default values. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleResetSettings}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Reset Settings
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-sm text-muted-foreground">
                      This will restore all settings to their default values.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSystemSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Advanced Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions / Plans */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Subscription Plans</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={plansDialogOpen} onOpenChange={setPlansDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" /> Create Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
                        <DialogDescription>
                          Configure plan details including resources, limits and pricing.
                        </DialogDescription>
                      </DialogHeader>

                      <PlanForm
                        initialData={editingPlan}
                        onCancel={() => setPlansDialogOpen(false)}
                        onSave={handleSavePlan}
                      />

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="ghost">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-sm text-muted-foreground">
                        <th className="p-2">Name</th>
                        <th className="p-2">Storage (GB)</th>
                        <th className="p-2">CPU</th>
                        <th className="p-2">RAM (GB)</th>
                        <th className="p-2">Max Members</th>
                        <th className="p-2">Duration</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Features</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((plan: any) => (
                        <tr key={plan.id} className="border-t">
                          <td className="p-2 align-top font-medium">{plan.name}</td>
                          <td className="p-2 align-top">{plan.storageGB}</td>
                          <td className="p-2 align-top">{plan.cpu}</td>
                          <td className="p-2 align-top">{plan.ramGB}</td>
                          <td className="p-2 align-top">{plan.maxMembers}</td>
                          <td className="p-2 align-top">{plan.durationMonths} month(s)</td>
                          <td className="p-2 align-top">${plan.price}</td>
                          <td className="p-2 align-top text-sm text-muted-foreground">
                            {plan.features.backups && 'Backups '}
                            {plan.features.monitoring && 'Monitoring '}
                            {plan.features.prioritySupport && 'Priority Support'}
                          </td>
                          <td className="p-2 align-top">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" onClick={() => openEditDialog(plan)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the "{plan.name}" plan? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePlan(plan.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>Plan Features</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Feature name"
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                />
                <Button onClick={handleCreateFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>

              <Separator />

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-muted-foreground">
                      <th className="p-2">ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featuresLoading && (
                      <tr>
                        <td className="p-2" colSpan={3}>Loading...</td>
                      </tr>
                    )}
                    {!featuresLoading && features.length === 0 && (
                      <tr>
                        <td className="p-2" colSpan={3}>No features found</td>
                      </tr>
                    )}
                    {features.map((f: any) => (
                      <tr key={f.id} className="border-t">
                        <td className="p-2 align-top">{f.id}</td>
                        <td className="p-2 align-top font-medium">{f.name ?? '-'}</td>
                        <td className="p-2 align-top">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the "{f.name}" feature? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteFeature(String(f.id))}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// PlanForm component inserted locally in this file
function PlanForm({ initialData, onSave, onCancel }: any) {
  // pull dynamic features from parent via a simple window global or prop if preferred
  // Since we're in the same file, we can pass features as a prop. Update the usage below.
  // For this snippet, we'll read from a global via a callback passed by parent.
  // But simpler: accept features via prop. See usage tweak at Dialog section below.

  const [availableFeatures, setAvailableFeatures] = useState<{id:number; name:string}[]>([]);
  // initialize selections: a map of featureId -> boolean
  const initialFeatureMap: Record<number, boolean> =
    (initialData?.features?._map) ??
    {}; // if editing an existing plan, use its dynamic map; otherwise empty

  const [form, setForm] = useState(() => ({
    id: initialData?.id ?? undefined,
    name: initialData?.name ?? '',
    storageGB: initialData?.storageGB ?? 10,
    cpu: initialData?.cpu ?? 1,
    ramGB: initialData?.ramGB ?? 1,
    maxMembers: initialData?.maxMembers ?? 1,
    durationMonths: initialData?.durationMonths ?? 1,
    price: initialData?.price ?? 0,
    featureMap: initialFeatureMap,
  }));

  // sync when editingPlan changes
  useEffect(() => {
    setForm({
      id: initialData?.id ?? undefined,
      name: initialData?.name ?? '',
      storageGB: initialData?.storageGB ?? 10,
      cpu: initialData?.cpu ?? 1,
      ramGB: initialData?.ramGB ?? 1,
      maxMembers: initialData?.maxMembers ?? 1,
      durationMonths: initialData?.durationMonths ?? 1,
      price: initialData?.price ?? 0,
      featureMap: initialData?.features?._map ?? {},
    });
  }, [initialData]);

  // fetch available features for the form independently to keep it fresh
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axiosSuperAdmin.get('/feature');
        const list = Array.isArray(data.data) ? data.data : [];
        const normalized = list.map((f: any) => ({ id: Number(f.id), name: f.name }));
        if (mounted) setAvailableFeatures(normalized);
        // ensure featureMap has keys for all features
        setForm(prev => ({
          ...prev,
          featureMap: normalized.reduce((acc: Record<number, boolean>, f:any) => {
            acc[f.id] = prev.featureMap[f.id] ?? false;
            return acc;
          }, {}),
        }));
      } catch (e) {
        console.error('Failed to load features in PlanForm', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Build payload expected by backend
  const buildBackendPayload = () => ({
    name: form.name,
    price: Number(form.price),
    memberLimit: Number(form.maxMembers),
    durationInMonths: Number(form.durationMonths),
    storageInGB: Number(form.storageGB),
    cpu: Number(form.cpu),
    ram: Number(form.ramGB),
    feature: Object.entries(form.featureMap).map(([featureId, enabled]) => ({
      featureId: Number(featureId),
      enabled: Boolean(enabled),
    })),
  });

  // Submit to backend (POST for create, PUT for update)
  const onSubmit = async () => {
    const payload = buildBackendPayload();

    console.log("Payload  to submit:", payload);

    try {
      const request = form.id
        ? axiosSuperAdmin.put(`/plans/${form.id}`, payload)
        : axiosSuperAdmin.post(`/subscription-plan/create`, payload);

      const res = await toast.promise(request, {
        loading: form.id ? 'Updating plan...' : 'Creating plan...',
        success: form.id ? 'Plan updated' : 'Plan created',
        error: 'Failed to save plan',
      });

      console.log("Response from server:", res);

      const data = (res as any)?.data ?? {};

      // Normalize back to local shape used in the UI
      const localPlan = {
        id: data.id ?? form.id ?? `${form.name.toLowerCase()}-${Date.now()}`,
        name: form.name,
        storageGB: form.storageGB,
        cpu: form.cpu,
        ramGB: form.ramGB,
        maxMembers: form.maxMembers,
        durationMonths: form.durationMonths,
        price: form.price,
        // expose both legacy keys (for table display) and dynamic map
        features: {
          backups: form.featureMap[1] ?? false,
          monitoring: form.featureMap[2] ?? false,
          prioritySupport: form.featureMap[3] ?? false,
          _map: { ...form.featureMap },
        },
      };

      onSave(localPlan);
      
      
    } catch (err) {
      console.error('Plan submit error', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Price (USD)</Label>
          <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>Storage (GB)</Label>
          <Input type="number" value={form.storageGB} onChange={e => setForm({ ...form, storageGB: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>CPU (vCPU)</Label>
          <Input type="number" value={form.cpu} onChange={e => setForm({ ...form, cpu: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>RAM (GB)</Label>
          <Input type="number" value={form.ramGB} onChange={e => setForm({ ...form, ramGB: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>Max Members</Label>
          <Input type="number" value={form.maxMembers} onChange={e => setForm({ ...form, maxMembers: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label>Duration (months)</Label>
          <Input type="number" value={form.durationMonths} onChange={e => setForm({ ...form, durationMonths: Number(e.target.value) })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Features</Label>
        <div className="flex flex-wrap items-center gap-4">
          {availableFeatures.length === 0 && (
            <span className="text-sm text-muted-foreground">No features found</span>
          )}
          {availableFeatures.map((f) => (
            <div className="flex items-center space-x-2" key={f.id}>
              <Switch
                checked={Boolean(form.featureMap[f.id])}
                onCheckedChange={(v: boolean) =>
                  setForm(prev => ({
                    ...prev,
                    featureMap: { ...prev.featureMap, [f.id]: v }
                  }))
                }
              />
              <span className="text-sm">{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit}>
          <Save className="h-4 w-4 mr-2" /> Save Plan
        </Button>
      </div>
    </div>
  );
}