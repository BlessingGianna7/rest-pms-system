import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { getSlotRequests, approveRequest, rejectRequest } from '../utils/api';
import Pagination from '../components/common/Pagination';


const SlotRequests = () => {
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getSlotRequests(page, limit, debouncedSearch);
      setRequests(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch requests');
    }
    setLoading(false);
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    try {
      const response = await approveRequest(id);
      alert(`Request approved. Slot: ${response.data.slot?.slot_number || 'N/A'}. Email: ${response.data.emailStatus}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      const response = await rejectRequest(selectedRequestId, rejectReason);
      alert(`Request rejected. Email: ${response.data.emailStatus}`);
      setRejectReason('');
      setSelectedRequestId(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequestDetails(request);
  };

  const closeDetailsModal = () => {
    setSelectedRequestDetails(null);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex">

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-green-800 mb-8">Slot Requests</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by plate number or status"
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
                  <th className="p-3 text-left">License Plate</th>
                  <th className="p-3 text-left">Vehicle Type</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-green-50">
                    <td className="p-3">{req.id}</td>
                    <td className="p-3">{req.Vehicle?.license_plate || 'N/A'}</td>
                    <td className="p-3 capitalize">{req.Vehicle?.type || 'N/A'}</td>
                    <td className="p-3">{getStatusBadge(req.request_status)}</td>
                    <td className="p-3">
                      {req.request_status.toLowerCase() === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setSelectedRequestId(req.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleViewDetails(req)}
                          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedRequestId && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-green-700 mb-4">
                Reject Request #{selectedRequestId}
              </h2>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection"
                className="input mb-4 w-full border border-green-300 rounded-lg p-2"
                rows="4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setRejectReason('');
                    setSelectedRequestId(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button onClick={handleReject} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedRequestDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-green-700 mb-4">
                Request Details #{selectedRequestDetails.id}
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">License Plate:</p>
                  <p>{selectedRequestDetails.Vehicle?.license_plate || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Vehicle Type:</p>
                  <p className="capitalize">{selectedRequestDetails.Vehicle?.type || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Status:</p>
                  <p>{selectedRequestDetails.request_status}</p>
                </div>
                <div>
                  <p className="font-semibold">Requested At:</p>
                  <p>{new Date(selectedRequestDetails.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeDetailsModal}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <Pagination meta={meta} setPage={setPage} />
      </main>
    </div>
  );
};

export default SlotRequests;