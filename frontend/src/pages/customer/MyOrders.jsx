import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  PackageX,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '../../utils/formatters';
import ConfirmModal from '../../components/ConfirmModal';
import Alert from '../../components/Alert';

const MyOrders = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(location.state?.successMessage || '');

  // Cancel order modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('[MyOrders] Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to retrieve your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenCancelModal = (order) => {
    setSelectedOrderToCancel(order);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderToCancel) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/${selectedOrderToCancel._id}/cancel`);
      setSuccessBanner('Order was successfully cancelled and medicine inventory was restored.');
      setCancelModalOpen(false);
      setSelectedOrderToCancel(null);
      fetchOrders();
    } catch (err) {
      console.error('[MyOrders] Cancel error:', err);
      alert(err.response?.data?.message || 'Failed to cancel the order.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prescription & Order History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track fulfillment states, review price snapshots, or cancel pending requests
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
          title="Error Loading Orders"
          message={error}
          onClose={() => setError('')}
          className="mb-6"
        />
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
            You haven't placed any pharmacy orders yet. Explore our medicine catalog to get started.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            Browse Catalog
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => {
            const badgeClass = getStatusBadgeStyle(order.status);
            const isPending = order.status === 'Pending';

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header */}
                <div className="p-6 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">ORDER ID:</span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {order._id}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Placed on {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ring-1 ${badgeClass} flex items-center gap-1.5`}
                    >
                      {order.status === 'Completed' && <CheckCircle className="w-3.5 h-3.5" />}
                      {order.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                      {order.status === 'Cancelled' && <XCircle className="w-3.5 h-3.5" />}
                      {order.status}
                    </span>

                    {isPending && (
                      <button
                        onClick={() => handleOpenCancelModal(order)}
                        className="px-3 py-1 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Items & Address */}
                <div className="p-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Prescribed Items (Immutable Snapshots)
                  </div>
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            {item.nameSnapshot}
                          </span>
                          <span className="text-slate-400 block mt-0.5">
                            Unit Price: {formatCurrency(item.priceSnapshot)} × {item.quantity} units
                          </span>
                        </div>
                        <span className="font-bold text-slate-800 text-sm">
                          {formatCurrency(item.priceSnapshot * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer with Delivery address and Total */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-700 block">Delivery Address:</span>
                        <span>{order.address}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Total Paid</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Pending Prescription Order?"
        message="Are you sure you want to cancel this order? Once cancelled, all ordered medicine quantities will be immediately restored to the live pharmacy stock."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        confirmVariant="danger"
        isLoading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedOrderToCancel(null);
        }}
      />
    </div>
  );
};

export default MyOrders;
