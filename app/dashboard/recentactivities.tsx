// import { useEffect, useState } from 'react';

// const RecentActivities = () => {
//   const [activities, setActivities] = useState([]);

//   useEffect(() => {
//     const fetchActivities = async () => {
//       try {
//         const response = await fetch('https://tawi-lea2.onrender.com/api/activities', {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
//         const data = await response.json();
//         if (data.success) {
//           setActivities(data.activities);
//         }
//       } catch (error) {
//         console.error('Failed to fetch activities:', error);
//       }
//     };
    
//     fetchActivities();
//   }, []);

//   return (
//     <div className="space-y-4">
//       {activities.length > 0 ? (
//         activities.map((activity) => (
//           <div key={activity.id} className="p-4 bg-gray-50 rounded-lg">
//             <div className="font-medium">{activity.description}</div>
//             <div className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</div>
//           </div>
//         ))
//       ) : (
//         <div>No recent activities.</div>
//       )}
//     </div>
//   );
// };

// export default RecentActivities;
