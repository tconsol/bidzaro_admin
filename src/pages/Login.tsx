import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertTriangle, Eye, EyeOff, UtensilsCrossed } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccountLockedModal, setShowAccountLockedModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';

      if (typeof errorMessage === 'string' && (
          errorMessage.toLowerCase().includes('locked') || 
          errorMessage.toLowerCase().includes('blocked') ||
          errorMessage.toLowerCase().includes('max') ||
          err?.response?.status === 423)) {
        setShowAccountLockedModal(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-800/30 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <UtensilsCrossed className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Bidzaro</h1>
          <p className="text-2xl font-semibold text-orange-100 mb-6">Admin Portal</p>
          <p className="text-orange-200 text-base leading-relaxed">
            Manage your catering platform with confidence. Full control over users, vendors, orders, and more.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[{label: 'Users', val: '10K+'}, {label: 'Orders', val: '50K+'}, {label: 'Vendors', val: '1K+'}].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-2xl font-bold text-white">{stat.val}</p>
                <p className="text-orange-200 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-10 sm:px-10">
        {/* Mobile Brand Header */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <UtensilsCrossed className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Bidzaro</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2 text-sm">Sign in to your admin account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Phone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="identifier" className="text-sm font-semibold text-gray-700">
                  Email or Phone
                </label>
                <Link to="/account-recovery" className="text-xs font-medium text-orange-600 hover:text-orange-700">
                  Forgot email or phone?
                </Link>
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                value={formData.identifier}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400 transition"
                placeholder="Enter your email or phone"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-orange-600 hover:text-orange-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400 transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Account Locked Modal */}
      {showAccountLockedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={() => setShowAccountLockedModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Locked</h3>
              <p className="text-gray-600 text-sm">
                Your account has been temporarily locked due to multiple failed login attempts.
              </p>
              <p className="text-gray-600 text-sm mt-2">
                We've sent a password reset link to your registered email address.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setShowAccountLockedModal(false); navigate('/forgot-password'); }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all"
              >
                Reset Password
              </button>
              <button
                onClick={() => { setShowAccountLockedModal(false); navigate('/account-recovery'); }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all"
              >
                Recover Account Details
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-5">Need help? Contact support@bidzaro.com</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
