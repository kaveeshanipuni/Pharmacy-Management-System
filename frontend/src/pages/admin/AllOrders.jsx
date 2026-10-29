import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  User,
  Filter,
} from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '../../utils/formatters';
import Alert from '../../components/Alert';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/orders', { params });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('[Admin Orders] Error:', err);
      setError(err.response?.data?.message || 'Failed to retrieve orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setSuccessBanner(`Order #${orderId} marked as ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      console.error('[Admin Orders] Status update failed:', err);
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Prescription Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming orders, verify prescription items, and mark orders as completed
          </p>
        </div>
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

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 mb-6 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1 shrink-0" />
        {['All', 'Pending', 'Completed', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === status
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status} Orders
          </button>
        ))}
      </div>

      {/* Orders Table Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
            Loading all customer orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs shadow-xs">
            No orders found with status "{statusFilter}".
          </div>
        ) : (
          orders.map((order) => {
            const isPending = order.status === 'Pending';
            const badgeClass = getStatusBadgeStyle(order.status);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">ORDER:</span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {order._id}
                      </span>
                      <span
                        className={`ml-2 px-2.5 py-0.5 text-xs font-bold rounded-full border ${badgeClass} inline-flex items-center gap-1`}
                      >
                        {order.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                        {order.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {order.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                        {order.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{order.user?.name || 'Customer'}</strong> ({order.user?.email || 'N/A'})
                      </span>
                      <span>•</span>
                      <span>Placed on {formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Admin Status Actions */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">Change Status:</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-semibold cursor-pointer focus:outline-hidden focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Completed')}
                        disabled={updatingId === order._id}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {/* Items snapshot table */}
                <div className="py-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Order Items Breakdown:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-slate-800 block">{item.nameSnapshot}</strong>
                          <span className="text-slate-400">
                            {item.quantity} × {formatCurrency(item.priceSnapshot)}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.priceSnapshot * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Address & Total */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Delivery Address: <strong className="text-slate-700">{order.address}</strong></span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-xs mr-2">Total Amount:</span>
                    <strong className="text-base font-extrabold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllOrders;
