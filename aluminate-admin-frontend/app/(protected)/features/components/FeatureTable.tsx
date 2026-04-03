// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Button } from '@/components/ui/button';
// import { Table } from '@/components/ui/table';
// import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator';
// import { toast } from 'sonner';
// import { Feature } from '@/types/feature';

// const FeatureTable = () => {
//   const [features, setFeatures] = useState<Feature[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchFeatures = async () => {
//     try {
//       const response = await axios.get('/api/features');
//       setFeatures(response.data);
//     } catch (error) {
//       console.error('Failed to fetch features', error);
//       toast.error('Failed to fetch features');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFeatures();
//   }, []);

//   return (
//     <div className="space-y-4">
//       <Label>Feature List</Label>
//       <Separator />
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <Table>
//           <thead>
//             <tr>
//               <th>Name</th>
//             </tr>
//           </thead>
//           <tbody>
//             {features.map((feature) => (
//               <tr key={feature.id}>
//                 <td>{feature.name}</td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       )}
//       <Button onClick={fetchFeatures}>Refresh</Button>
//     </div>
//   );
// };

// export default FeatureTable;