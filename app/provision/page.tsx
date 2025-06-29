'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { ProvisionForm } from '@/types';
import { containerAPI } from '@/lib/api/containers';

const subscriptionTiers = {
  starter: {
    name: 'Starter',
    memberLimit: 250,
    features: ['Basic Alumni Directory', 'Event Management', 'Email Support'],
    price: '$29/month'
  },
  professional: {
    name: 'Professional',
    memberLimit: 1000,
    features: ['Advanced Directory', 'Custom Branding', 'Analytics', 'Priority Support'],
    price: '$99/month'
  },
  enterprise: {
    name: 'Enterprise',
    memberLimit: 5000,
    features: ['Unlimited Features', 'SSO Integration', 'API Access', 'Dedicated Support'],
    price: '$299/month'
  }
};

const availableFeatures = [
  'Alumni Directory',
  'Event Management',
  'News & Announcements',
  'Job Board',
  'Mentorship Program',
  'Donation Management',
  'Custom Forms',
  'Analytics Dashboard',
  'Mobile App',
  'SSO Integration'
];

export default function ProvisionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProvisionForm>({
    orgName: '',
    adminName: '',
    adminEmail: '',
    subscriptionTier: 'professional',
    initialMembers: 0,
    customDomain: '',
    features: ['Alumni Directory', 'Event Management'],
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await containerAPI.provisionContainer(formData);
      toast.success('Container provisioning initiated successfully!');
      router.push('/containers');
    } catch (error) {
      toast.error('Failed to provision container');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }));
  };

  const selectedTier = subscriptionTiers[formData.subscriptionTier];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Provision New Container</h1>
          <p className="text-muted-foreground">
            Create a new Alumni Portal instance for an organization
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name *</Label>
                  <Input
                    id="orgName"
                    value={formData.orgName}
                    onChange={(e) => setFormData(prev => ({ ...prev, orgName: e.target.value }))}
                    placeholder="University of Example"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                  <Input
                    id="customDomain"
                    value={formData.customDomain}
                    onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
                    placeholder="alumni.university.edu"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initialMembers">Expected Initial Members</Label>
                <Input
                  id="initialMembers"
                  type="number"
                  value={formData.initialMembers}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialMembers: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Details */}
          <Card>
            <CardHeader>
              <CardTitle>Administrator Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Admin Name *</Label>
                  <Input
                    id="adminName"
                    value={formData.adminName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="admin@university.edu"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Add-ons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={(checked) => 
                        handleFeatureToggle(feature, checked as boolean)
                      }
                    />
                    <Label htmlFor={feature} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requirements or notes..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Tier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={formData.subscriptionTier} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, subscriptionTier: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(subscriptionTiers).map(([key, tier]) => (
                    <SelectItem key={key} value={key}>
                      {tier.name} - {tier.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedTier.name}</span>
                  <Badge variant="secondary">{selectedTier.price}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Up to {selectedTier.memberLimit.toLocaleString()} members
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Included Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedTier.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>Deployment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deployment Time:</span>
                <span>~5-10 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Initial Setup:</span>
                <span>Automated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SSL Certificate:</span>
                <span>Auto-provisioned</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backup Schedule:</span>
                <span>Daily @ 2 AM</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !formData.orgName || !formData.adminName || !formData.adminEmail}
            >
              {isSubmitting ? 'Provisioning...' : 'Provision Container'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}