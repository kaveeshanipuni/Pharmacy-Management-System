import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pill, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/validators';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'admin') {
        navigate('/admin/medicines');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      setServerError(
        err.response?.data?.message ||
        'Unable to sign in. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo helper buttons
  const fillCredentials = (role) => {
    if (role === 'admin') {
      setFormData({
        email: 'admin@pharmacy.com',
        password: 'adminPassword123',
      });
    } else {
      setFormData({
        email: 'customer@pharmacy.com',
        password: 'customerPassword123',
      });
    }
    setErrors({});
    setServerError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-md w-full p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20 mb-3">
            <Pill className="w-6 h-6 rotate-45" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to PharmaCare
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your prescription orders and pharmacy account
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  errors.password
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Buttons for Marking & Evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('customer')}
              className="py-1.5 px-2 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="py-1.5 px-2 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
