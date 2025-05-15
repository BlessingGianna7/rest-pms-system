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
  const [bulkForm, setBulkForm] = useState({ count: '', location: '', size: '', vehicle_type: '' });
  const [editForm, setEditForm] = useState({ slot_number: '', location: '', size: '', vehicle_type: '', status: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getParkingSlots(page, limit, debouncedSearch);
      setSlots(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch parking slots');
    }
    setLoading(false);
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const { count, location, size, vehicle_type } = bulkForm;
    if (!count || !location || !size || !vehicle_type) {
      alert('All fields are required');
      return;
    }
    if (isNaN(count) || parseInt(count) <= 0) {
      alert('Count must be a positive number');
      return;
    }
    const slots = Array.from({ length: parseInt(count) }, (_, i) => ({
      slot_number: `S${Date.now()}-${i + 1}`,
      location,
      size,
      vehicle_type,
    }));
    try {
      await createBulkParkingSlots({ slots });
      alert('Parking slots created');
      setBulkForm({ count: '', location: '', size: '', vehicle_type: '' });
      setShowBulkModal(false);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create parking slots');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { slot_number, location, size, vehicle_type, status } = editForm;
    if (!slot_number || !location || !size || !vehicle_type || !status) {
      alert('All fields are required');
      return;
    }
    try {
      await updateParkingSlot(editId, { slot_number, location, size, vehicle_type, status });
      alert('Parking slot updated');
      setEditForm({ slot_number: '', location: '', size: '', vehicle_type: '', status: '' });
      setIsEditing(false);
      setEditId(null);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update parking slot');
    }
  };

  const handleEdit = (slot) => {
    setEditForm({
      slot_number: slot.slot_number,
      location: slot.location,
      size: slot.size,
      vehicle_type: slot.vehicle_type,
      status: slot.status,
    });
    setIsEditing(true);
    setEditId(slot.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking slot?')) {
      try {
        await deleteParkingSlot(id);
        alert('Parking slot deleted');
        fetchSlots();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete parking slot');
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-accent min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-6">Parking Slots</h1>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by slot number, vehicle type, or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full sm:w-1/2"
        />
        <button
          onClick={() => setShowBulkModal(true)}
          className="btn-primary"
        >
          Create Bulk Slots
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Slot Number</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Size</th>
                <th className="p-3 text-left">Vehicle Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="border-b hover:bg-accent">
                  <td className="p-3">{slot.id}</td>
                  <td className="p-3">{slot.slot_number}</td>
                  <td className="p-3">{slot.location}</td>
                  <td className="p-3">{slot.size}</td>
                  <td className="p-3">{slot.vehicle_type}</td>
                  <td className="p-3">
                    {slot.status === 'unavailable' ? (
                      <span className="text-red-500">Occupied</span>
                    ) : (
                      <span className="text-green-500">Available</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(slot)}
                        className="btn-warning px-3 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="btn-danger px-3 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">Create Bulk Parking Slots</h2>
            <form onSubmit={handleBulkSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="count">
                  Number of Slots
                </label>
                <input
                  type="number"
                  name="count"
                  value={bulkForm.count}
                  onChange={handleBulkInputChange}
                  className="input"
                  required
                  min="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={bulkForm.location}
                  onChange={handleBulkInputChange}
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="size">
                  Size
                </label>
                <select
                  name="size"
                  value={bulkForm.size}
                  onChange={handleBulkInputChange}
                  className="input"
                  required
                >
                  <option value="">Select Size</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="vehicle_type">
                  Vehicle Type
                </label>
                <select
                  name="vehicle_type"
                  value={bulkForm.vehicle_type}
                  onChange={handleBulkInputChange}
                  className="input"
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="car">Car</option>
                  <option value="taxi">Taxi</option>
                  <option value="truck">Truck</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">Edit Parking Slot #{editId}</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="slot_number">
                  Slot Number
                </label>
                <input
                  type="text"
                  name="slot_number"
                  value={editForm.slot_number}
                  onChange={handleEditInputChange}
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditInputChange}
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="size">
                  Size
                </label>
                <select
                  name="size"
                  value={editForm.size}
                  onChange={handleEditInputChange}
                  className="input"
                  required
                >
                  <option value="">Select Size</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="vehicle_type">
                  Vehicle Type
                </label>
                <select
                  name="vehicle_type"
                  value={editForm.vehicle_type}
                  onChange={handleEditInputChange}
                  className="input"
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="car">Car</option>
                  <option value="taxi">Taxi</option>
                  <option value="truck">Truck</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditInputChange}
                  className="input"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Occupied</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditForm({ slot_number: '', location: '', size: '', vehicle_type: '', status: '' });
                    setIsEditing(false);
                    setEditId(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Pagination meta={meta} setPage={setPage} />
    </div>
  );
};

export default ParkingSlots;