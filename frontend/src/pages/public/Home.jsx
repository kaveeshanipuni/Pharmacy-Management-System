import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, RefreshCw, AlertCircle, PackageOpen } from 'lucide-react';
import api from '../../api/axios';
import MedicineCard from '../../components/MedicineCard';

const Home = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 12,
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const res = await api.get('/medicines', { params });
      setMedicines(res.data.medicines || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
      if (res.data.categories && res.data.categories.length > 0) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('[Home] Failed to load medicines:', err);
      setError(err.response?.data?.message || 'Failed to connect to the pharmacy catalog service.');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, sort]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMedicines();
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4 backdrop-blur-xs">
            Trusted Clinical Excellence
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Certified Pharmacy & Prescription Ordering
          </h1>
          <p className="mt-4 text-emerald-100/80 text-sm sm:text-base leading-relaxed">
            Browse our licensed pharmaceutical catalog with real-time stock verification, atomic inventory management, and fast fulfillment.
          </p>
        </div>

        {/* Decorative backdrop elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-20 -bottom-20 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by drug name or description (e.g., Amoxicillin, Relief)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>

          {/* Sort Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="price-asc">Sort by: Price (Low to High)</option>
              <option value="price-desc">Sort by: Price (High to Low)</option>
              <option value="name-asc">Sort by: Name (A to Z)</option>
              <option value="name-desc">Sort by: Name (Z to A)</option>
            </select>
          </div>

          {/* Refresh / Reset Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {selectedCategory === 'All' ? 'All Medicines' : selectedCategory}
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({total} {total === 1 ? 'item' : 'items'} available)
          </span>
        </h2>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center my-8">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-rose-900">Unable to load catalog</h3>
          <p className="text-sm text-rose-700 mt-1">{error}</p>
          <button
            onClick={fetchMedicines}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse flex flex-col"
            >
              <div className="aspect-4/3 bg-slate-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded-xl mt-auto"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && medicines.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No matching medicines found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
            Try adjusting your search query or selecting a different therapeutic category.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Grid of Medicines */}
      {!loading && !error && medicines.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {medicines.map((medicine) => (
            <MedicineCard key={medicine._id} medicine={medicine} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>

          <span className="text-xs font-medium text-slate-500 px-3">
            Page <strong className="text-slate-900">{page}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
