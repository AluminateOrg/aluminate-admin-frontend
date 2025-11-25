import { NextApiRequest, NextApiResponse } from 'next';
import { createFeature, getFeatures } from '@/lib/api/features';
import { validateFeature } from '@/lib/validators/feature';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const features = await getFeatures();
      res.status(200).json(features);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch features' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body;
      const validationError = validateFeature({ name });

      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const newFeature = await createFeature({ name });
      res.status(201).json(newFeature);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create feature' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}