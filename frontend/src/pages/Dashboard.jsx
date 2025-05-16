// rest-pms/frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSlotRequests, getUsers, getVehicles, getParkingSlots } from '../utils/api';


ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalUsers: 0,
    totalVehicles: 0,
    totalSlots: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [requestsRes, usersRes, vehiclesRes, slotsRes] = await Promise.all([
          getSlotRequests(1, 1000, ''),
          getUsers(1, 1000, ''),
          getVehicles(1, 1000, ''),
          getParkingSlots(1, 1000, ''),
        ]);

        const requests = requestsRes.data.data;
        const pending = requests.filter((r) => r.request_status === 'pending').length;
        const approved = requests.filter((r) => r.request_status === 'approved').length;
        const rejected = requests.filter((r) => r.request_status === 'rejected').length;

        setStats({
          pending,
          approved,
          rejected,
          totalUsers: usersRes.data.meta.totalItems,
          totalVehicles: vehiclesRes.data.meta.totalItems,
          totalSlots: slotsRes.data.meta.totalItems,
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch stats');
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const pieData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [stats.pending, stats.approved, stats.rejected],
        backgroundColor: ['#F59E0B', '#C8E6C9', '#EF4444'],
        borderColor: ['#D97706', '#B2DFDB', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex">
 
      <main className="flex-1 p-8 ">
        <h1 className="text-3xl font-extrabold text-green-800 mb-8">Dashboard</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-green-400 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100">
              <h2 className="text-xl font-bold text-green-700 mb-6">Slot Request Status</h2>
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top', labels: { color: '#166534' } },
                    tooltip: { backgroundColor: '#bbf7d0' },
                  },
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'Total Vehicles', value: stats.totalVehicles },
                { label: 'Total Slots', value: stats.totalSlots },
                { label: 'Pending Requests', value: stats.pending },
              ].map((item) => (
                <div key={item.label} className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 flex flex-col items-start">
                  <h3 className="text-lg font-semibold text-green-700">{item.label}</h3>
                  <p className="text-3xl font-extrabold mt-2 text-green-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;