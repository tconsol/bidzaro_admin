import React, { useEffect, useState } from 'react';
import { userApi, agentApi } from '../services/api';
import type { User, PageInfo, AdminRegistrationDto } from '../types';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { Shield, UserPlus, Eye, Ban, CheckCircle, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

const Admins: React.FC = () => {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });
  const [statusAction, setStatusAction] = useState<'suspend' | 'activate'>('suspend');
  const [statusReason, setStatusReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [agentForm, setAgentForm] = useState<AdminRegistrationDto>({
    email: '', phone: '', password: '', firstName: '', lastName: '', userType: 'SUPPORT_AGENT', country: 'INDIA',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadAdmins(); }, [currentPage, pageSize, typeFilter]);

  const getFilteredAdmins = () => {
    let filtered = admins;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.email?.toLowerCase().includes(query) ||
        a.firstName?.toLowerCase().includes(query) ||
        a.lastName?.toLowerCase().includes(query) ||
        a.phone?.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const userType = typeFilter || undefined;
      const response = await userApi.getAllUsers({ page: currentPage, size: pageSize, userType });
      // Filter to only admin-type users (ADMIN, SUPER_ADMIN) - exclude SUPPORT_AGENT
      const filtered = response.data.filter(u => ['ADMIN', 'SUPER_ADMIN'].includes(u.userType));
      setAdmins(filtered);
      setPageInfo(response.pageInfo);
    } catch (error) {
      showToast('Failed to load administrators', 'error');
    }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadAdmins();
  };

  const clearFilters = () => {
    setTypeFilter('');
    setSearchQuery('');
    setCurrentPage(0);
  };

  const activeFilters = [
    typeFilter && `Role: ${typeFilter}`,
    searchQuery && `Search: ${searchQuery}`,
  ].filter(Boolean);

  const handleCreateAgent = async () => {
    setSubmitting(true);
    try {
      await agentApi.createAgent(agentForm);
      showToast('Support agent created successfully!', 'success');
      setShowCreateModal(false);
      setAgentForm({ email: '', phone: '', password: '', firstName: '', lastName: '', userType: 'SUPPORT_AGENT', country: 'INDIA' });
      loadAdmins();
    } catch (error: any) { 
      showToast(error.response?.data?.message || 'Failed to create agent', 'error');
    }
    finally { setSubmitting(false); }
  };

  const handleStatusAction = async () => {
    if (!selectedAdmin) return;
    try {
      // Use agentApi for SUPPORT_AGENT users, userApi for others (ADMIN, SUPER_ADMIN)
      const isAgent = selectedAdmin.userType === 'SUPPORT_AGENT';
      if (statusAction === 'suspend') {
        isAgent ? await agentApi.suspendAgent(selectedAdmin.userId, statusReason) : await userApi.suspendUser(selectedAdmin.userId, statusReason);
      } else {
        isAgent ? await agentApi.activateAgent(selectedAdmin.userId) : await userApi.activateUser(selectedAdmin.userId);
      }
      setShowStatusModal(false);
      setStatusReason('');
      loadAdmins();
      showToast(`Admin ${statusAction}ed successfully!`, 'success');
    } catch (error: any) { 
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const columns = [
    {
      key: 'name', header: 'Name',
      render: (a: User) => (
        <div className="space-y-1">
          <p className="font-semibold text-gray-900">{a.fullName}</p>
          <p className="text-sm text-gray-500">{a.email}</p>
          <p className="text-sm text-gray-500">{a.phone || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'userType', header: 'Role',
      render: (a: User) => (
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${
          a.userType === 'SUPER_ADMIN' ? 'bg-orange-600'
          : 'bg-orange-500'
        }`}>{a.userType}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (a: User) => (
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${
          a.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-500 to-emerald-600'
          : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>{a.status}</span>
      ),
    },
    {
      key: 'lastLogin', header: 'Last Login',
      render: (a: User) => a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : 'Never',
    },
    {
      key: 'actions', header: 'Actions',
      render: (a: User) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setSelectedAdmin(a); setShowDetailModal(true); }}
            className="p-2 bg-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200" title="View Details"><Eye className="w-4 h-4" /></button>
          <button onClick={(e) => {
            e.stopPropagation();
            setSelectedAdmin(a);
            setStatusAction(a.status === 'ACTIVE' ? 'suspend' : 'activate');
            setShowStatusModal(true);
          }} className={`p-2 rounded-lg transition-all duration-200 ${a.status === 'ACTIVE' ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white hover:shadow-lg hover:scale-105' : 'bg-gradient-to-br from-green-400 to-green-600 text-white hover:shadow-lg hover:scale-105'}`}>
            {a.status === 'ACTIVE' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  if (loading && admins.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-orange-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3"><Shield className="w-8 h-8" />Admin Management</h1>
            <p className="text-white mt-2">Manage admins — Total: {getFilteredAdmins().length.toLocaleString()}</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
            <UserPlus className="w-5 h-5" />Create Admin
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <CustomSelect
            value={typeFilter}
            onChange={(val) => { setTypeFilter(val); setCurrentPage(0); }}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
            ]}
            placeholder="Filter by role"
          />
          <CustomSelect
            value={String(pageSize)}
            onChange={(val) => { setPageSize(Number(val)); setCurrentPage(0); }}
            options={[
              { value: '10', label: '10 per page' },
              { value: '20', label: '20 per page' },
              { value: '50', label: '50 per page' },
            ]}
            placeholder="Items per page"
          />
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
            {activeFilters.map((filter, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                {filter}
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="ml-2 flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <DataTable data={getFilteredAdmins()} columns={columns} />
        {pageInfo.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentPage(Math.min(pageInfo.totalPages - 1, currentPage + 1))} disabled={currentPage >= pageInfo.totalPages - 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Admin Details">
        {selectedAdmin && (
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-bold ring-2 ring-white/30 flex-shrink-0">
                  {selectedAdmin.firstName?.[0]?.toUpperCase()}{selectedAdmin.lastName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">{selectedAdmin.fullName}</h2>
                  <p className="text-orange-100 text-sm truncate">{selectedAdmin.email}</p>
                  <p className="text-orange-100 text-sm">{selectedAdmin.phone || 'No phone'}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedAdmin.status === 'ACTIVE' ? 'bg-green-400/30 ring-1 ring-green-300'
                    : 'bg-red-400/30 ring-1 ring-red-300'
                  }`}>{selectedAdmin.status}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedAdmin.userType === 'SUPER_ADMIN' ? 'bg-orange-300/30 ring-1 ring-orange-200' : 'bg-white/20 ring-1 ring-white/30'
                  }`}>{selectedAdmin.userType}</span>
                </div>
              </div>
            </div>
            {/* Verification Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl ${
                selectedAdmin.emailVerified ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
              }`}>
                <Shield className={`w-5 h-5 ${selectedAdmin.emailVerified ? 'text-green-600' : 'text-red-500'}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedAdmin.emailVerified ? 'Verified' : 'Not Verified'}</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${
                selectedAdmin.phoneVerified ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
              }`}>
                <Shield className={`w-5 h-5 ${selectedAdmin.phoneVerified ? 'text-green-600' : 'text-red-500'}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedAdmin.phoneVerified ? 'Verified' : 'Not Verified'}</p>
                </div>
              </div>
            </div>
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Country', value: selectedAdmin.country || '—' },
                { label: '2FA', value: selectedAdmin.twoFactorEnabled ? 'Enabled' : 'Disabled' },
                { label: 'Last Login', value: selectedAdmin.lastLoginAt ? new Date(selectedAdmin.lastLoginAt).toLocaleString() : 'Never' },
                { label: 'Member Since', value: new Date(selectedAdmin.createdAt).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Status Action Modal */}
      <Modal isOpen={showStatusModal} onClose={() => { setShowStatusModal(false); setStatusReason(''); }}
        title={statusAction === 'suspend' ? 'Suspend Admin' : 'Activate Admin'}>
        {selectedAdmin && (
          <div className="space-y-4">
            <p className="text-gray-600">Are you sure you want to {statusAction} <strong>{selectedAdmin.fullName}</strong>?</p>
            {statusAction === 'suspend' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
                <textarea value={statusReason} onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl" rows={3} placeholder="Reason for suspension..." />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleStatusAction} disabled={statusAction === 'suspend' && !statusReason.trim()}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">Confirm</button>
              <button onClick={() => setShowStatusModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Agent Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Support Agent">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input type="text" value={agentForm.firstName} onChange={(e) => setAgentForm({ ...agentForm, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input type="text" value={agentForm.lastName} onChange={(e) => setAgentForm({ ...agentForm, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
            <input type="tel" value={agentForm.phone} onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="+917890111222" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <input type="password" value={agentForm.password} onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
            <CustomSelect
              value={agentForm.country}
              onChange={(val) => setAgentForm({ ...agentForm, country: val })}
              options={[
                { value: 'INDIA', label: 'India' },
                { value: 'USA', label: 'USA' },
              ]}
              placeholder="Select country"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreateAgent} disabled={submitting || !agentForm.email || !agentForm.password || !agentForm.firstName || !agentForm.lastName}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">{submitting ? 'Creating...' : 'Create Agent'}</button>
            <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Admins;


