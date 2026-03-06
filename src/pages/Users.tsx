import React, { useEffect, useState } from 'react';
import { userApi } from '../services/api';
import type { User, PageInfo } from '../types';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { Eye, Search, Ban, CheckCircle, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const Users: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'unlock'>('suspend');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, statusFilter]);

  // Client-side filtering function
  const getFilteredUsers = () => {
    let filtered = users;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.email?.toLowerCase().includes(query) || 
        u.firstName?.toLowerCase().includes(query) || 
        u.lastName?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query)
      );
    }
    
    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(u => u.status?.toUpperCase() === statusFilter.toUpperCase());
    }
    
    return filtered;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers({
        page: currentPage,
        size: pageSize,
        status: statusFilter || undefined,
        userType: 'USER', // Only fetch USER type
        search: searchQuery || undefined,
      });
      
      // Apply client-side filtering to ensure filters work
      let filteredUsers = response.data || [];
      
      // Client-side userType filter - ENSURE we only get USER type
      filteredUsers = filteredUsers.filter(u => u.userType?.toUpperCase() === 'USER');
      
      // Client-side status filter
      if (statusFilter) {
        filteredUsers = filteredUsers.filter(u => u.status?.toUpperCase() === statusFilter.toUpperCase());
      }
      
      setUsers(filteredUsers);
      setPageInfo(response.pageInfo);
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadUsers();
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setCurrentPage(0);
  };

  const activeFilters = [
    statusFilter && `Status: ${statusFilter}`,
    searchQuery && `Search: ${searchQuery}`,
  ].filter(Boolean);

  const handleViewDetails = async (user: User) => {
    try {
      const fullUser = await userApi.getUserById(user.userId);
      setSelectedUser(fullUser);
      setShowDetailModal(true);
    } catch {
      setSelectedUser(user);
      setShowDetailModal(true);
    }
  };

  const handleStatusChange = (user: User, action: 'suspend' | 'activate' | 'unlock') => {
    setSelectedUser(user);
    setActionType(action);
    setActionReason('');
    setShowActionModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedUser) return;
    try {
      if (actionType === 'suspend') {
        await userApi.suspendUser(selectedUser.userId, actionReason);
      } else if (actionType === 'activate') {
        await userApi.activateUser(selectedUser.userId);
      } else if (actionType === 'unlock') {
        await userApi.unlockUser(selectedUser.userId);
      }
      setShowActionModal(false);
      setActionReason('');
      loadUsers();
      showToast(`User ${actionType}ed successfully!`, 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || `Failed to ${actionType} user`, 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div className="space-y-1">
          <p className="font-semibold text-gray-900">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">{user.phone || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'userType',
      header: 'Type',
      render: (user: User) => (
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${
          user.userType === 'ADMIN' ? 'bg-orange-600'
          : user.userType === 'SUPER_ADMIN' ? 'bg-orange-600'
          : user.userType === 'SUPPORT_AGENT' ? 'bg-orange-500'
          : 'bg-gradient-to-r from-slate-500 to-slate-600'
        }`}>
          {user.userType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${
          user.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : user.status === 'SUSPENDED' ? 'bg-gradient-to-r from-red-500 to-rose-600'
            : user.status === 'LOCKED' ? 'bg-gradient-to-r from-amber-500 to-orange-600'
            : 'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          {user.status}
        </span>
      ),
    },
    {
      key: 'verified',
      header: 'Verified',
      render: (user: User) => (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Email</span>
            {user.emailVerified ? (
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-md">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-md">
                <X className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Phone</span>
            {user.phoneVerified ? (
              <div className="flex items-center justify-center w-6 h-6 bg-orange-500 rounded-md">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md">
                <X className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewDetails(user); }}
            className="p-2 bg-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(user.status === 'ACTIVE' || user.status === 'INACTIVE') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(user, 'suspend'); }}
              className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              title="Suspend User"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
          {(user.status === 'SUSPENDED' || user.status === 'INACTIVE') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(user, 'activate'); }}
              className="p-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              title="Activate User"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {(user.status === 'LOCKED' || user.status === 'INACTIVE') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(user, 'unlock'); }}
              className="p-2 bg-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              title="Unlock User"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-orange-500 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Users Management</h1>
            <p className="text-green-50 mt-2">Manage all registered users — Total: {getFilteredUsers().length.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(0); }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'SUSPENDED', label: 'Suspended' },
              { value: 'LOCKED', label: 'Locked' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            placeholder="Filter by status"
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
              <span key={idx} className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <DataTable data={getFilteredUsers()} columns={columns} />

        {pageInfo.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages} — {pageInfo.totalElements} users
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">Page {currentPage + 1}</span>
              <button onClick={() => setCurrentPage(Math.min(pageInfo.totalPages - 1, currentPage + 1))} disabled={currentPage >= pageInfo.totalPages - 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="User Details">
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-gray-700">Full Name</label><p className="mt-1 text-gray-900">{selectedUser.fullName}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">User Type</label><p className="mt-1 text-gray-900">{selectedUser.userType}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Email</label><p className="mt-1 text-gray-900">{selectedUser.email} {selectedUser.emailVerified ? '✅' : '❌'}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Phone</label><p className="mt-1 text-gray-900">{selectedUser.phone} {selectedUser.phoneVerified ? '✅' : '❌'}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Status</label><p className="mt-1 text-gray-900">{selectedUser.status}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Country</label><p className="mt-1 text-gray-900">{selectedUser.country}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Gender</label><p className="mt-1 text-gray-900">{selectedUser.gender || 'N/A'}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Date of Birth</label><p className="mt-1 text-gray-900">{selectedUser.dateOfBirth || 'N/A'}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">2FA Enabled</label><p className="mt-1 text-gray-900">{selectedUser.twoFactorEnabled ? 'Yes' : 'No'}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Last Login</label><p className="mt-1 text-gray-900">{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Created At</label><p className="mt-1 text-gray-900">{new Date(selectedUser.createdAt).toLocaleString()}</p></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => { setShowActionModal(false); setActionReason(''); }}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} User`}>
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to {actionType} <strong>{selectedUser.fullName}</strong>?
            </p>
            {actionType === 'suspend' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
                <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500" rows={3}
                  placeholder="Enter reason for suspension..." required />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={confirmStatusChange}
                disabled={actionType === 'suspend' && !actionReason.trim()}
                className={`flex-1 text-white px-4 py-2 rounded-xl disabled:opacity-50 ${
                  actionType === 'activate' ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                  : actionType === 'suspend' ? 'bg-gradient-to-r from-orange-600 to-orange-500'
                  : 'bg-orange-500'
                }`}>
                Confirm
              </button>
              <button onClick={() => { setShowActionModal(false); setActionReason(''); }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Agent Modal */}
    </div>
  );
};

export default Users;





