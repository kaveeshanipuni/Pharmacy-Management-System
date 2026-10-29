import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, totalAmount, totalItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
          Looks like you haven't added any prescription or over-the-counter medicines to your basket yet.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Medicine Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your pharmaceutical items before checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.medicine._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.medicine.imageUrl}
                  alt={item.medicine.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-100 bg-slate-50"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.medicine.category}
                  </span>
                  <Link
                    to={`/medicines/${item.medicine._id}`}
                    className="font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-700 block mt-1 transition-colors"
                  >
                    {item.medicine.name}
                  </Link>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {formatCurrency(item.medicine.price)} each •{' '}
                    <span className="text-emerald-600 font-medium">{item.medicine.stock} in stock</span>
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
                <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.medicine._id, item.quantity - 1)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900 min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.medicine._id, item.quantity + 1)}
                    disabled={item.quantity >= item.medicine.stock}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-sm font-extrabold text-slate-900 block">
                    {formatCurrency(item.medicine.price * item.quantity)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.medicine._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({totalItems})</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Pharmacy Dispensing</span>
              <span className="text-emerald-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Standard Delivery</span>
              <span className="text-emerald-600 font-semibold">Free</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-base">Total Amount</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: { pathname: '/checkout' } } });
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified inventory check on order placement
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
