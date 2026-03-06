import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { Mail, ArrowLeft, CheckCircle, UtensilsCrossed, AlertTriangle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const AuthShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-900/20 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <UtensilsCrossed className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">Bidzaro</h1>
          <p className="text-xl font-semibold text-orange-100 mb-5">Admin Portal</p>
          <p className="text-orange-200 text-sm leading-relaxed">Manage your catering platform with confidence.</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-10 sm:px-12">
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <UtensilsCrossed className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bidzaro Admin</h1>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );

  if (success) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-5">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-500 text-sm mb-1">We've sent a password reset OTP to <strong className="text-gray-700">{email}</strong></p>
          <p className="text-gray-400 text-xs mb-8">Please check your inbox and follow the instructions.</p>
          <button
            onClick={() => navigate('/reset-password', { state: { email } })}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all mb-4"
          >
            Enter Reset Code
          </button>
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
        <p className="text-gray-500 mt-1.5 text-sm">Enter your email and we'll send you reset instructions.</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-gray-400 transition"
            placeholder="Enter your registered email"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : (
            <><Mail className="w-4 h-4" /> Send Reset Code</>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-3 text-sm">
        <Link to="/login" className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <span className="text-gray-300">|</span>
        <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold">Create Account</Link>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;

