import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { Mail, Phone, Shield, Sparkles, ArrowLeft, Search } from 'lucide-react';

type RecoveryType = 'email' | 'phone';

const AccountRecovery: React.FC = () => {
  const navigate = useNavigate();
  const [recoveryType, setRecoveryType] = useState<RecoveryType>('email');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<{ email?: string; phone?: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      if (recoveryType === 'email') {
        // Recover email using phone
        const response = await adminApi.recoverEmail(inputValue);
        setResult({ email: response.email });
      } else {
        // Recover phone using email
        const response = await adminApi.recoverPhone(inputValue);
        setResult({ phone: response.phone });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Recovery failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="hidden sm:block absolute -top-1/2 -left-1/2 w-full h-full bg-orange-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="hidden sm:block absolute -bottom-1/2 -right-1/2 w-full h-full bg-orange-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50"></div>
              <Shield className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bidzaro</h1>
          <p className="text-orange-100 text-sm">Professional Catering Management Platform</p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 rounded-2xl mb-4 shadow-lg">
              <Search className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Account Recovery</h2>
            <p className="mt-2 text-sm text-gray-600">
              Recover your account email or phone number
            </p>
          </div>

          {/* Recovery Type Selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setRecoveryType('email');
                setInputValue('');
                setResult(null);
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                recoveryType === 'email'
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-5 h-5" />
              <span>Find Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRecoveryType('phone');
                setInputValue('');
                setResult(null);
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                recoveryType === 'phone'
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Phone className="w-5 h-5" />
              <span>Find Phone</span>
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 mb-1">Recovery Successful!</p>
                  {result.email && (
                    <p className="text-sm text-green-700">
                      Your email: <strong>{result.email}</strong>
                    </p>
                  )}
                  {result.phone && (
                    <p className="text-sm text-green-700">
                      Your phone: <strong>{result.phone}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="input" className="block text-sm font-semibold text-gray-700">
                {recoveryType === 'email' ? 'Enter Your Phone Number' : 'Enter Your Email Address'}
              </label>
              <input
                id="input"
                name="input"
                type={recoveryType === 'email' ? 'tel' : 'email'}
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                placeholder={
                  recoveryType === 'email'
                    ? 'Enter your phone number'
                    : 'Enter your email address'
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {recoveryType === 'email'
                  ? 'We\'ll help you find the email associated with this phone number'
                  : 'We\'ll help you find the phone number associated with this email'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Recover {recoveryType === 'email' ? 'Email' : 'Phone'}</span>
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
              >
                Continue to Login
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 inline-flex items-center space-x-1">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/forgot-password" className="text-orange-500 hover:text-orange-600 font-semibold">
                Reset Password
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-white/80 mt-8">
          © 2025 Bidzaro. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AccountRecovery;

