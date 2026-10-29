import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Pill,
  ShoppingCart,
  ClipboardList,
  PackageCheck,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Pharma<span className="text-emerald-600">Care</span>
                {isAdmin && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> ADMIN
                  </span>
                )}
              </span>
              <p className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                Licensed Pharmacy & Rx Ordering
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" end className={navLinkClass}>
              Medicines
            </NavLink>

            {/* Customer Navigation */}
            {isAuthenticated && isCustomer && (
              <>
                <NavLink to="/orders" className={navLinkClass}>
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" />
                    My Orders
                  </span>
                </NavLink>

                <NavLink to="/cart" className={navLinkClass}>
                  <span className="flex items-center gap-1.5 relative">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                    {totalItems > 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white min-w-5 text-center">
                        {totalItems}
                      </span>
                    )}
                  </span>
                </NavLink>
              </>
            )}

            {/* Admin Navigation */}
            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin/medicines" className={navLinkClass}>
                  <span className="flex items-center gap-1.5">
                    <Pill className="w-4 h-4" />
                    Inventory CRUD
                  </span>
                </NavLink>

                <NavLink to="/admin/orders" className={navLinkClass}>
                  <span className="flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4" />
                    All Orders
                  </span>
                </NavLink>

                <Link
                  to="/admin/medicines/new"
                  className="ml-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Medicine
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Right Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  title="View Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-emerald-600/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isCustomer && (
              <Link
                to="/cart"
                className="p-2 relative text-slate-600 hover:text-emerald-600"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-600 text-white min-w-4 text-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1.5">
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Medicines
            </NavLink>

            {isAuthenticated && isCustomer && (
              <>
                <NavLink
                  to="/orders"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </NavLink>
                <NavLink
                  to="/cart"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shopping Cart ({totalItems})
                </NavLink>
                <NavLink
                  to="/profile"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </NavLink>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <NavLink
                  to="/admin/medicines"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inventory Management (CRUD)
                </NavLink>
                <NavLink
                  to="/admin/orders"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Customer Orders
                </NavLink>
                <NavLink
                  to="/admin/medicines/new"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  + Add New Medicine
                </NavLink>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-1 text-xs text-slate-500 font-medium">
                    Signed in as <strong className="text-slate-900">{user?.name}</strong> ({user?.role})
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 font-semibold hover:bg-rose-50 text-sm transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-xs"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
