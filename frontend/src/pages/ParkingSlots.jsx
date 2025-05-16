import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import {
  getParkingSlots,
  createBulkParkingSlots,
  updateParkingSlot,
  deleteParkingSlot,
} from '../utils/api';
import Pagination from '../components/common/Pagination';


const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, currentPage: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bulkForm, setBulkForm] = useState({ count: '', vehicle_type: '' });
  const [editForm, setEditForm] = useState({ slot_number: '', vehicle_type: '', status: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getParkingSlots(page, limit, debouncedSearch);
      setSlots(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch parking slots');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { count, vehicle_type } = bulkForm;
    if (!count || !vehicle_type) {
      setError('All fields are required');
      return;
    }
    const countNum = parseInt(count);
    if (isNaN(countNum)) {
      setError('Count must be a number');
      return;
    }
    if (countNum <= 0 || countNum > 100) {
      setError('Count must be between 1 and 100');
      return;
    }
    setIsCreating(true);
    try {
      const prefix = `SLOT-${Math.floor(Math.random() * 1000)}`;
      const slots = Array.from({ length: countNum }, (_, i) => ({
        slot_number: `${prefix}-${i + 1}`,
        vehicle_type,
        status: 'available'
      }));
      await createBulkParkingSlots({ slots });
      setBulkForm({ count: '', vehicle_type: '' });
      setShowBulkModal(false);
      await fetchSlots();
      alert(`${countNum} parking slots created successfully!`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create parking slots';
      setError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { slot_number, vehicle_type, status } = editForm;
    if (!slot_number || !vehicle_type || !status) {
      setError('All fields are required');
      return;
    }
    try {
      await updateParkingSlot(editId, { slot_number, vehicle_type, status });
      setEditForm({ slot_number: '', vehicle_type: '', status: '' });
      setIsEditing(false);
      setEditId(null);
      await fetchSlots();
      alert('Parking slot updated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update parking slot';
      setError(errorMsg);
    }
  };

  const handleEdit = (slot) => {
    setEditForm({
      slot_number: slot.slot_number,
      vehicle_type: slot.vehicle_type,
      status: slot.status,
    });
    setEditId(slot.id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking slot?')) {
      return;
    }
    try {
      await deleteParkingSlot(id);
      await fetchSlots();
      alert('Parking slot deleted successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete parking slot';
      setError(errorMsg);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex">

      <main className="flex-1 p-8 ">
        <h1 className="text-3xl font-extrabold text-green-800 mb-8">Parking Slots</h1>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by slot number or vehicle type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full sm:w-1/2 border border-green-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Add Bulk Slots
          </button>
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
                  <th className="p-3 text-left">Slot Number</th>
                  <th className="p-3 text-left">Vehicle Type</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id} className="border-b hover:bg-green-50">
                    <td className="p-3">{slot.slot_number}</td>
                    <td className="p-3 capitalize">{slot.vehicle_type}</td>
                    <td className="p-3 capitalize">{slot.status}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} setPage={setPage} />

        {showBulkModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-green-700 mb-4">Add Bulk Parking Slots</h2>
              <form onSubmit={handleBulkSubmit}>
                <div className="mb-4">
                  <label className="block mb-1">Count</label>
                  <input
                    type="number"
                    name="count"
                    value={bulkForm.count}
                    onChange={handleBulkInputChange}
                    className="input w-full border border-green-300 rounded-lg p-2"
                    min="1"
                    max="100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    name="vehicle_type"
                    value={bulkForm.vehicle_type}
                    onChange={handleBulkInputChange}
                    className="input w-full border border-green-300 rounded-lg p-2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-green-700 mb-4">Edit Parking Slot</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block mb-1">Slot Number</label>
                  <input
                    type="text"
                    name="slot_number"
                    value={editForm.slot_number}
                    onChange={handleEditInputChange}
                    className="input w-full border border-green-300 rounded-lg p-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    name="vehicle_type"
                    value={editForm.vehicle_type}
                    onChange={handleEditInputChange}
                    className="input w-full border border-green-300 rounded-lg p-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Status</label>
                  <input
                    type="text"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditInputChange}
                    className="input w-full border border-green-300 rounded-lg p-2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ParkingSlots;