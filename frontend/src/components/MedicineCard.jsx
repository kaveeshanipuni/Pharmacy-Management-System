import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

const MedicineCard = ({ medicine }) => {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const [added, setAdded] = useState(false);

  const isOutOfStock = medicine.stock <= 0;
  const isLowStock = medicine.stock > 0 && medicine.stock <= 10;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock || isAdmin) return;

    addToCart(medicine, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={medicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'}
          alt={medicine.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs border border-slate-100">
            {medicine.category}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-600/90 text-white backdrop-blur-xs shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/90 text-white backdrop-blur-xs shadow-xs">
              Only {medicine.stock} left
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-600/85 text-white backdrop-blur-xs shadow-xs">
              In Stock ({medicine.stock})
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {medicine.name}
          </h3>

          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {medicine.description || 'Clinical dosage and indications available in details.'}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(medicine.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/medicines/${medicine._id}`}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer"
              title="View Medicine Details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  added
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-emerald-600/20 active:scale-95'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
