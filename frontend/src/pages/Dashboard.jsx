import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSlotRequests, getUsers, getVehicles, getParkingSlots } from '../utils/api';
import { FaTachometerAlt, FaCar, FaParking, FaHistory } from 'react-icons/fa'; // Import icons

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
        backgroundColor: ['#F59E0B', '#C8E6C9', '#EF4444'], // Updated green to baby green
        borderColor: ['#D97706', '#B2DFDB', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-pastel-blue-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-baby-green-100 p-6 h-screen fixed shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Parking System</h2>
        <nav>
          <button
            onClick={() => handleNavigation('/')}
            className="w-full flex items-center text-left py-2 px-4 mb-2 rounded-lg bg-baby-green-100 text-white hover:bg-baby-green-200 transition-all duration-300"
          >
            <FaTachometerAlt className="mr-2" /> Dashboard
          </button>
          <button
            onClick={() => handleNavigation('/vehicles')}
            className="w-full flex items-center text-left py-2 px-4 mb-2 rounded-lg bg-baby-green-100 text-white hover:bg-baby-green-200 transition-all duration-300"
          >
            <FaCar className="mr-2" /> Vehicles
          </button>
          <button
            onClick={() => handleNavigation('/parking-slots')}
            className="w-full flex items-center text-left py-2 px-4 mb-2 rounded-lg bg-baby-green-100 text-white hover:bg-baby-green-200 transition-all duration-300"
          >
            <FaParking className="mr-2" /> Parking Slots
          </button>
          <button
            onClick={() => handleNavigation('/logs')}
            className="w-full flex items-center text-left py-2 px-4 mb-2 rounded-lg bg-baby-green-100 text-white hover:bg-baby-green-200 transition-all duration-300"
          >
            <FaHistory className="mr-2" /> Activity Logs
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 ml-64">
        <h1 className="text-3xl font-bold text-navy-blue-700 mb-6">Dashboard</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-navy-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-navy-blue-200">
              <h2 className="text-xl font-semibold text-navy-blue-700 mb-4">Slot Request Status</h2>
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top', labels: { color: '#1E3A8A' } },
                    tooltip: { backgroundColor: '#1E3A8A' },
                  },
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, color: 'bg-navy-blue-500' },
                { label: 'Total Vehicles', value: stats.totalVehicles, color: 'bg-navy-blue-600' },
                { label: 'Total Slots', value: stats.totalSlots, color: 'bg-navy-blue-700' },
                { label: 'Pending Requests', value: stats.pending, color: 'bg-navy-blue-800' },
              ].map((item) => (
                <div key={item.label} className="bg-white p-4 rounded-lg shadow-lg border border-navy-blue-200">
                  <h3 className="text-lg font-semibold text-navy-blue-700">{item.label}</h3>
                  <p className={`text-2xl font-bold text-white ${item.color} p-2 rounded mt-2`}>
                    {item.value}
                  </p>
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