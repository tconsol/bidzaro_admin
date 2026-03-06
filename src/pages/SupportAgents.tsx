import React, { useEffect, useState } from 'react';
import { agentApi } from '../services/api';
import type { User, PageInfo } from '../types';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { Eye, Search, Ban, CheckCircle, ChevronLeft, ChevronRight, UserPlus, X, Check } from 'lucide-react';

const SupportAgents: React.FC = () => {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'unlock'>('suspend');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });
  const [actionReason, setActionReason] = useState('');

  // Agent creation form
  const [agentForm, setAgentForm] = useState({
    email: '', phone: '', password: '', firstName: '', lastName: '', country: 'INDIA',
  });
  const [agentLoading, setAgentLoading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, [currentPage, pageSize, statusFilter]);

  const getFilteredAgents = () => {
    let filtered = agents;
    
    // Double-check: Only show SUPPORT_AGENT role (safety filter)
    filtered = filtered.filter(a => a.userType?.toUpperCase() === 'SUPPORT_AGENT');
    
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

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await agentApi.getAllAgents({
        page: currentPage,
        size: pageSize,
        status: statusFilter || undefined,
      });
      
      let filteredAgents = response.data || [];
      
      // Filter ONLY SUPPORT_AGENT role (ensure we don't show other roles)
      filteredAgents = filteredAgents.filter(a => a.userType?.toUpperCase() === 'SUPPORT_AGENT');
      
      // Client-side status filter
      if (statusFilter) {
        filteredAgents = filteredAgents.filter(a => a.status?.toUpperCase() === statusFilter.toUpperCase());
      }
      
      setAgents(filteredAgents);
      setPageInfo(response.pageInfo);
    } catch (error) {
      showToast('Failed to load support agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadAgents();
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

  const handleViewDetails = async (agent: User) => {
    try {
      const fullAgent = await agentApi.getAgent(agent.userId);
      setSelectedAgent(fullAgent);
      setShowDetailModal(true);
    } catch (error) {
      setSelectedAgent(agent);
      setShowDetailModal(true);
    }
  };

  const handleStatusChange = (agent: User, action: 'suspend' | 'activate' | 'unlock') => {
    setSelectedAgent(agent);
    setActionType(action);
    setActionReason('');
    setShowActionModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedAgent) return;
    try {
      if (actionType === 'suspend') {
        await agentApi.suspendAgent(selectedAgent.userId, actionReason);
      } else if (actionType === 'activate') {
        await agentApi.activateAgent(selectedAgent.userId);
      } else if (actionType === 'unlock') {
        await agentApi.unlockAgent(selectedAgent.userId);
      }
      setShowActionModal(false);
      setActionReason('');
      loadAgents();
      showToast(`Agent ${actionType}ed successfully!`, 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || `Failed to ${actionType} agent`, 'error');
    }
  };

  const handleCreateAgent = async () => {
    setAgentLoading(true);
    try {
      await agentApi.createAgent(agentForm);
      showToast('Support agent created successfully!', 'success');
      setShowCreateModal(false);
      setAgentForm({ email: '', phone: '', password: '', firstName: '', lastName: '', country: 'INDIA' });
      loadAgents();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create agent', 'error');
    } finally {
      setAgentLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (agent: User) => (
        <div className="space-y-1">
          <p className="font-semibold text-gray-900">{agent.fullName || `${agent.firstName} ${agent.lastName}`}</p>
          <p className="text-sm text-gray-500">{agent.email}</p>
          <p className="text-sm text-gray-500">{agent.phone || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (agent: User) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          agent.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
          : agent.status === 'SUSPENDED' ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white'
          : agent.status === 'LOCKED' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
          : 'bg-gray-100 text-gray-800'
        }`}>
          {agent.status}
        </span>
      ),
    },
    {
      key: 'verified',
      header: 'Verified',
      render: (agent: User) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-700">Email</span>
            {agent.emailVerified ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-700">Phone</span>
            {agent.phoneVerified ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (agent: User) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewDetails(agent); }}
            className="p-2 bg-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(agent.status === 'ACTIVE' || agent.status === 'INACTIVE') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(agent, 'suspend'); }}
              className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              title="Suspend Agent"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
          {(agent.status === 'SUSPENDED' || agent.status === 'INACTIVE') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(agent, 'activate'); }}
              className="p-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              title="Activate Agent"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {(agent.status === 'LOCKED' || agent.status === 'INACTIVE') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(agent, 'unlock'); }}
              className="p-2 bg-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              title="Unlock Agent"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-orange-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Support Agents Management</h1>
            <p className="text-orange-50 mt-2">Manage support agents — Total: {getFilteredAgents().length.toLocaleString()}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <UserPlus className="w-5 h-5" />
            Create Agent
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
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

      {/* Agents Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <DataTable data={getFilteredAgents()} columns={columns} />

        {pageInfo?.totalPages && pageInfo.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {(pageInfo?.pageNumber || 0) + 1} of {pageInfo?.totalPages || 1} — {pageInfo?.totalElements || 0} agents
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">Page {currentPage + 1}</span>
              <button onClick={() => setCurrentPage(Math.min((pageInfo?.totalPages || 1) - 1, currentPage + 1))} disabled={currentPage >= (pageInfo?.totalPages || 1) - 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Agent Details">
        {selectedAgent && (
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-bold ring-2 ring-white/30 flex-shrink-0">
                  {selectedAgent.firstName?.[0]?.toUpperCase()}{selectedAgent.lastName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">{selectedAgent.fullName}</h2>
                  <p className="text-orange-100 text-sm truncate">{selectedAgent.email}</p>
                  <p className="text-orange-100 text-sm">{selectedAgent.phone || 'No phone'}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedAgent.status === 'ACTIVE' ? 'bg-green-400/30 ring-1 ring-green-300'
                    : selectedAgent.status === 'SUSPENDED' ? 'bg-red-400/30 ring-1 ring-red-300'
                    : selectedAgent.status === 'LOCKED' ? 'bg-yellow-400/30 ring-1 ring-yellow-300'
                    : 'bg-white/20 ring-1 ring-white/30'}`}>
                    {selectedAgent.status}
                  </span>
                </div>
              </div>
            </div>
            {/* Verification Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl ${selectedAgent.emailVerified ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                {selectedAgent.emailVerified ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedAgent.emailVerified ? 'Verified' : 'Not Verified'}</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${selectedAgent.phoneVerified ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                {selectedAgent.phoneVerified ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedAgent.phoneVerified ? 'Verified' : 'Not Verified'}</p>
                </div>
              </div>
            </div>
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Country', value: selectedAgent.country || '—' },
                { label: '2FA', value: selectedAgent.twoFactorEnabled ? 'Enabled' : 'Disabled' },
                { label: 'Language', value: selectedAgent.preferredLanguage || '—' },
                { label: 'Currency', value: selectedAgent.preferredCurrency || '—' },
                { label: 'Last Login', value: selectedAgent.lastLoginAt ? new Date(selectedAgent.lastLoginAt).toLocaleString() : 'Never' },
                { label: 'Member Since', value: new Date(selectedAgent.createdAt).toLocaleString() },
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

      {/* Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => { setShowActionModal(false); setActionReason(''); }}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Agent`}>
        {selectedAgent && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to {actionType} <strong>{selectedAgent.fullName}</strong>?
            </p>
            {actionType === 'suspend' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason (Required)</label>
                <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" rows={3}
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
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Support Agent">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input type="text" value={agentForm.firstName} onChange={(e) => setAgentForm({ ...agentForm, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="Priya" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input type="text" value={agentForm.lastName} onChange={(e) => setAgentForm({ ...agentForm, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="Sharma" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="agent@bidzaro.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
            <input type="tel" value={agentForm.phone} onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="+917890111222" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <input type="password" value={agentForm.password} onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="AgentPass@123" />
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
            <button onClick={handleCreateAgent} disabled={agentLoading}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">
              {agentLoading ? 'Creating...' : 'Create Agent'}
            </button>
            <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupportAgents;



