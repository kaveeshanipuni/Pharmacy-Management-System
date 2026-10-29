import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';

const Checkout = () => {
  const { cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('742 Evergreen Medical Park, Sector 4, Metro City');
  const [addressError, setAddressError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Your basket is empty</h2>
        <p className="text-xs text-slate-500 mt-2">Cannot checkout with zero items.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setAddressError('Delivery address is required.');
      return;
    }
    if (address.trim().length < 5) {
      setAddressError('Please provide a complete delivery address (at least 5 characters).');
      return;
    }

    setAddressError('');
    setOrderError('');
    setLoading(true);

    try {
      const payload = {
        address: address.trim(),
        items: cart.map((item) => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/orders', payload);
      clearCart();
      navigate('/orders', {
        state: { successMessage: 'Your prescription order has been successfully placed!' },
      });
    } catch (err) {
      console.error('[Checkout] Order placement error:', err);
      setOrderError(
        err.response?.data?.message ||
        'Failed to place order. A selected medication may have insufficient inventory.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Checkout & Dispensing
      </h1>
      <p className="text-xs text-slate-500 mb-8">
        Review your delivery destination and confirm order placement
      </p>

      {orderError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Inventory Verification Alert</h4>
            <p className="mt-0.5">{orderError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Address and Patient Form */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Information
          </h2>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Recipient Customer
              </label>
              <input
                type="text"
                disabled
                value={`${user?.name} (${user?.email})`}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Physical Delivery Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (addressError) setAddressError('');
                }}
                placeholder="Street name, building, apartment/suite number, city, postal code..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  addressError
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {addressError && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{addressError}</p>
              )}
            </div>

            {/* Atomic safety guarantee badge */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-emerald-900 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Atomic Stock Guarantee</strong>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">
                  Upon clicking confirm, the backend checks live inventory and decrements stock atomically with rollback compensation to guarantee zero overselling.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Breakdown */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100">
            Items in Order ({cart.length})
          </h2>

          <div className="mt-4 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.medicine._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{item.medicine.name}</span>
                  <span className="text-slate-400">
                    {item.quantity} × {formatCurrency(item.medicine.price)}
                  </span>
                </div>
                <span className="font-extrabold text-slate-800">
                  {formatCurrency(item.medicine.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Standard Dispensing</span>
              <span className="text-emerald-600 font-semibold">Free</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Total Due</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Verifying Stock & Placing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm & Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
