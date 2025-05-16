import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { getLogs } from '../utils/api';
import Pagination from '../components/common/Pagination';
import { FaTachometerAlt, FaCar, FaParking, FaHistory } from 'react-icons/fa';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getLogs(page, limit, debouncedSearch);
      setLogs(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch logs');
    }
    setLoading(false);
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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
        <h1 className="text-3xl font-bold text-navy-blue-700 mb-6">Activity Logs</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by action or user ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full sm:w-1/2 border border-navy-blue-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-navy-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-navy-blue-200">
            <table className="min-w-full">
              <thead>
                <tr className="bg-navy-blue-700 text-white">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">User ID</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-navy-blue-700">{log.id}</td>
                    <td className="p-3 text-navy-blue-700">{log.user_id}</td>
                    <td className="p-3 text-navy-blue-700">{log.action}</td>
                    <td className="p-3 text-navy-blue-700">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} setPage={setPage} />
      </main>
    </div>
  );
};

export default Logs;