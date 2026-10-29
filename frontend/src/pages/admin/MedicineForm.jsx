import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Pill,
  Image as ImageIcon,
  Calendar,
  Layers,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';
import Alert from '../../components/Alert';

const CATEGORIES = [
  'Antibiotics',
  'Pain Relief',
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Dermatology',
  'Vitamins & Supplements',
  'First Aid & Antiseptics',
];

const MedicineForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Antibiotics',
    price: '',
    stock: '',
    expiryDate: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
  });

  const [customCategory, setCustomCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // If editing, fetch initial data
  useEffect(() => {
    if (isEdit) {
      const fetchMedicine = async () => {
        try {
          const res = await api.get(`/medicines/${id}`);
          const m = res.data;

          // Format expiry date for <input type="date">
          let formattedDate = '';
          if (m.expiryDate) {
            formattedDate = new Date(m.expiryDate).toISOString().split('T')[0];
          }

          setFormData({
            name: m.name || '',
            category: m.category || 'Antibiotics',
            price: m.price?.toString() || '',
            stock: m.stock?.toString() || '',
            expiryDate: formattedDate,
            description: m.description || '',
            imageUrl: m.imageUrl || '',
          });
        } catch (err) {
          console.error('[MedicineForm] Fetch error:', err);
          setServerError(err.response?.data?.message || 'Failed to load medicine for editing.');
        } finally {
          setFetching(false);
        }
      };
      fetchMedicine();
    }
  }, [id, isEdit]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Medicine name is required.';
    if (!formData.category.trim()) errs.category = 'Category is required.';

    const priceNum = parseFloat(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
      errs.price = 'Price must be a number greater than or equal to 0.';
    }

    const stockNum = parseInt(formData.stock, 10);
    if (formData.stock === '' || isNaN(stockNum) || stockNum < 0) {
      errs.stock = 'Stock must be an integer greater than or equal to 0.';
    }

    if (!formData.expiryDate) {
      errs.expiryDate = 'Expiry date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category === 'Other' && customCategory ? customCategory.trim() : formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        expiryDate: formData.expiryDate,
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      if (isEdit) {
        await api.put(`/medicines/${id}`, payload);
      } else {
        await api.post('/medicines', payload);
      }

      navigate('/admin/medicines');
    } catch (err) {
      console.error('[MedicineForm] Submit error:', err);
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors)) {
        const fieldErrors = {};
        apiErrors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
      setServerError(
        err.response?.data?.message || 'An error occurred while saving the medicine record.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
        Loading medicine data for editing...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/admin/medicines"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Inventory List
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Medicine Record' : 'Add New Medicine to Catalog'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isEdit
              ? 'Update dosage, pricing, and active inventory count'
              : 'Register a new pharmaceutical item into the clinical database'}
          </p>
        </div>
      </div>

      {serverError && (
        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError('')}
          className="mb-6"
        />
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Medicine Name & Strength <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Pill className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Amoxicillin 500mg Capsules"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>}
          </div>

          {/* Category & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Therapeutic Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>

              {formData.category === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify custom category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Batch Expiry Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    errors.expiryDate
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.expiryDate && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.expiryDate}</p>
              )}
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit Retail Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="14.50"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    errors.price
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Stock Count (Units) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="85"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    errors.stock
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.stock && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.stock}</p>}
            </div>
          </div>

          {/* Image URL & Live Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Image URL
            </label>
            <div className="flex gap-4 items-start">
              <div className="relative flex-1">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {formData.imageUrl && (
                <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 shadow-2xs">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Usage & Indications
            </label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Dosage advice, indications, contraindications, and storage temperature requirements..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/admin/medicines"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saving Record...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Update Medicine' : 'Add to Catalog'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineForm;
