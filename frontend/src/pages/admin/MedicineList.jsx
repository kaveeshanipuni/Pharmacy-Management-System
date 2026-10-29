import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
  PackageCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ConfirmModal from '../../components/ConfirmModal';
import Alert from '../../components/Alert';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/medicines?limit=100');
      setMedicines(res.data.medicines || []);
    } catch (err) {
      console.error('[Admin Medicines] Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleOpenDelete = (medicine) => {
    setMedicineToDelete(medicine);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!medicineToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/medicines/${medicineToDelete._id}`);
      setSuccessBanner(`Successfully deleted "${medicineToDelete.name}" from inventory.`);
      setDeleteModalOpen(false);
      setMedicineToDelete(null);
      fetchMedicines();
    } catch (err) {
      console.error('[Admin Delete] Error:', err);
      alert(err.response?.data?.message || 'Failed to delete medicine.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pharmacy Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete administrative CRUD controls over catalog medicines, dosages, and stock
          </p>
        </div>

        <Link
          to="/admin/medicines/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </Link>
      </div>

      {successBanner && (
        <Alert
          type="success"
          message={successBanner}
          onClose={() => setSuccessBanner('')}
          className="mb-6"
        />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="mb-6"
        />
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inventory by title or category..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredMedicines.length}</strong> of {medicines.length} items
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
            Loading inventory records...
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No medicines match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMedicines.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.imageUrl}
                          alt={m.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
                          }}
                        />
                        <div>
                          <strong className="text-slate-900 font-bold block">{m.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {m._id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(m.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          m.stock <= 10 ? 'text-amber-600 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {m.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(m.expiryDate)}</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/medicines/${m._id}/edit`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Medicine"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenDelete(m)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Medicine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Medicine from Catalog?"
        message={`Are you sure you want to permanently delete "${medicineToDelete?.name}"? Past customer orders and receipts will remain intact thanks to immutable price snapshots.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMedicineToDelete(null);
        }}
      />
    </div>
  );
};

export default MedicineList;
