import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Calendar,
  Layers,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/medicines/${id}`);
        setMedicine(res.data);
      } catch (err) {
        console.error('[MedicineDetail] Error:', err);
        setError(err.response?.data?.message || 'Medicine details could not be found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const isOutOfStock = medicine?.stock <= 0;

  const handleAddToCart = () => {
    if (!medicine || isOutOfStock || isAdmin) return;
    addToCart(medicine, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-12 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Medicine Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'The requested pharmaceutical product does not exist.'}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Section */}
          <div className="p-8 sm:p-12 bg-slate-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
            <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 bg-white">
              <img
                src={medicine.imageUrl}
                alt={medicine.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
                }}
              />
            </div>
          </div>

          {/* Product Information Section */}
          <div className="p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {medicine.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> FDA/CE Verified
                </span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {medicine.name}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(medicine.price)}
                </span>
                <span className="text-xs text-slate-400 font-medium">per unit/pack</span>
              </div>

              {/* Meta specifications */}
              <div className="mt-6 grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-medium">Inventory Stock</span>
                    <strong className="text-slate-800 font-semibold">
                      {isOutOfStock ? (
                        <span className="text-rose-600">Out of Stock</span>
                      ) : (
                        `${medicine.stock} units available`
                      )}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-medium">Batch Expiry</span>
                    <strong className="text-slate-800 font-semibold">
                      {formatDate(medicine.expiryDate)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Clinical Indications & Instructions
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {medicine.description || 'Consult with your attending physician or licensed pharmacist regarding recommended administration and contraindications.'}
                </p>
              </div>
            </div>

            {/* Actions: Quantity Selector & Add to Cart */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              {!isAdmin ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Quantity selector */}
                  {!isOutOfStock && (
                    <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-white">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-sm font-bold text-slate-900 min-w-10 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(medicine.stock, q + 1))}
                        disabled={quantity >= medicine.stock}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      added
                        ? 'bg-emerald-700 text-white shadow-md'
                        : isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/25 active:scale-98'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>{isOutOfStock ? 'Currently Unavailable' : `Add ${quantity} to Cart`}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                  <span>You are signed in as an Administrator. Purchasing is disabled for admin accounts.</span>
                  <Link
                    to={`/admin/medicines/${medicine._id}/edit`}
                    className="font-bold underline text-amber-900 hover:text-amber-950"
                  >
                    Edit Item
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetail;
