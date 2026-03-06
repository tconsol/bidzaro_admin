import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Shield, Globe, Calendar, Clock } from 'lucide-react';

const Profile: React.FC = () => {
  const { admin } = useAuth();

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No profile data available. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-orange-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
            {admin.profilePictureUrl ? (
              <img src={admin.profilePictureUrl} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{admin.fullName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{admin.userType}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${admin.status === 'ACTIVE' ? 'bg-green-400/30' : 'bg-red-400/30'}`}>{admin.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-orange-500" />Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">User ID</span>
              <span className="font-mono text-sm text-gray-900">{admin.userId.substring(0, 12)}...</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">First Name</span>
              <span className="font-semibold text-gray-900">{admin.firstName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Last Name</span>
              <span className="font-semibold text-gray-900">{admin.lastName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Gender</span>
              <span className="font-semibold text-gray-900">{admin.gender || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Date of Birth</span>
              <span className="font-semibold text-gray-900">{admin.dateOfBirth || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-orange-500" />Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-4 h-4" />Email</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{admin.email}</span>
                {admin.emailVerified ? <span className="text-green-600">✅</span> : <span className="text-red-600">❌</span>}
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-4 h-4" />Phone</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{admin.phone}</span>
                {admin.phoneVerified ? <span className="text-green-600">✅</span> : <span className="text-red-600">❌</span>}
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Globe className="w-4 h-4" />Country</span>
              <span className="font-semibold text-gray-900">{admin.country}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Preferred Language</span>
              <span className="font-semibold text-gray-900">{admin.preferredLanguage || 'English'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Preferred Currency</span>
              <span className="font-semibold text-gray-900">{admin.preferredCurrency}</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-orange-500" />Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Two-Factor Auth</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${admin.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {admin.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Role</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">{admin.userType}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Account Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${admin.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{admin.status}</span>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" />Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" />Account Created</span>
              <span className="font-semibold text-gray-900">{new Date(admin.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" />Last Login</span>
              <span className="font-semibold text-gray-900">{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


