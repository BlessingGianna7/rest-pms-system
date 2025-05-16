import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaCar, FaParking, FaHistory, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { removeToken } from '../utils/auth'; // Adjust import if needed
import { FaClipboardList } from 'react-icons/fa';
const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken(); // or your logout logic
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-green-200 via-green-100 to-green-50 p-6 h-screen fixed shadow-xl border-r border-green-200 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-extrabold text-green-800 mb-8 flex items-center gap-2">
          <span className="bg-green-100 p-2 rounded-full">
            <FaParking className="text-green-500" />
          </span>
          PMS
        </h2>
        <nav className="space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center text-left py-2 px-4 rounded-lg text-green-900 hover:bg-green-200 transition">
            <FaTachometerAlt className="mr-3 text-green-500" /> Dashboard
          </button>
          <button onClick={() => navigate('/vehicles')} className="w-full flex items-center text-left py-2 px-4 rounded-lg text-green-900 hover:bg-green-200 transition">
            <FaCar className="mr-3 text-green-500" /> Vehicles
          </button>
            <button
             onClick={() => navigate('/slot-requests')}
             className="w-full flex items-center text-left py-2 px-4 rounded-lg text-green-900 hover:bg-green-200 transition"
               >
    <FaClipboardList className="mr-3 text-green-500" /> Slot Requests
  </button>

          <button onClick={() => navigate('/parking-slots')} className="w-full flex items-center text-left py-2 px-4 rounded-lg text-green-900 hover:bg-green-200 transition">
            <FaParking className="mr-3 text-green-500" /> Parking Slots
          </button>
          <button onClick={() => navigate('/logs')} className="w-full flex items-center text-left py-2 px-4 rounded-lg text-green-900 hover:bg-green-200 transition">
            <FaHistory className="mr-3 text-green-500" /> Activity Logs
          </button>
          <button onClick={() => navigate('/users')} className="w-full flex items-center text-left py-2 px-4 rounded-lg text-green-900 hover:bg-green-200 transition">
            <FaUser className="mr-3 text-green-500" /> Users
          </button>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="w-full flex items-center text-left py-2 px-4 rounded-lg text-red-700 hover:bg-red-100 transition mt-8"
      >
        <FaSignOutAlt className="mr-3" /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;