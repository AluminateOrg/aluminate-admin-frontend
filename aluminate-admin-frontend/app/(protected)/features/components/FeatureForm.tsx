import React, { useState } from 'react';
import { Button, Input, Label } from '@/components/ui'; // Adjust the import path as necessary
import { toast } from 'sonner';
import axios from 'axios'; // Adjust the import path as necessary

const FeatureForm = () => {
  const [featureName, setFeatureName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureName) {
      toast.error('Feature name is required');
      return;
    }

    try {
      await axios.post('/api/features', { name: featureName });
      toast.success('Feature created successfully');
      setFeatureName('');
    } catch (error) {
      console.error('Error creating feature:', error);
      toast.error('Failed to create feature');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="feature-name">Feature Name</Label>
        <Input
          id="feature-name"
          value={featureName}
          onChange={(e) => setFeatureName(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Create Feature</Button>
    </form>
  );
};

export default FeatureForm;