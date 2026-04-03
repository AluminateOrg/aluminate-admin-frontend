// import React, { useEffect, useState } from 'react';
// import FeatureForm from './components/FeatureForm';
// import FeatureTable from './components/FeatureTable';
// import axios from 'axios';
// import { toast } from 'sonner';

// export default function FeaturesPage() {
//   const [features, setFeatures] = useState([]);

//   const fetchFeatures = async () => {
//     try {
//       const response = await axios.get('/api/features');
//       setFeatures(response.data);
//     } catch (error) {
//       console.error('Failed to fetch features', error);
//       toast.error('Failed to fetch features');
//     }
//   };

//   useEffect(() => {
//     fetchFeatures();
//   }, []);

//   const handleFeatureCreated = (newFeature) => {
//     setFeatures((prevFeatures) => [...prevFeatures, newFeature]);
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold">Feature Management</h1>
//       <FeatureForm onFeatureCreated={handleFeatureCreated} />
//       <FeatureTable features={features} />
//     </div>
//   );
// }