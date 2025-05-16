import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { getLogs } from '../utils/api';
import Pagination from '../components/common/Pagination';


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



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex">

      <main className="flex-1 p-8 ">
        <h1 className="text-3xl font-extrabold text-green-800 mb-8">Activity Logs</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by action or user ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full sm:w-1/2 border border-green-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-green-400 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-green-100">
            <table className="min-w-full">
              <thead>
                <tr className="bg-green-200 text-green-900">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">User ID</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-green-50">
                    <td className="p-3">{log.id}</td>
                    <td className="p-3">{log.user_id}</td>
                    <td className="p-3">{log.action}</td>
                    <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
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