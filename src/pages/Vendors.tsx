import React, { useEffect, useState } from 'react';
import { vendorApi } from '../services/api';
import type { Vendor, PageInfo } from '../types';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { Eye, Search, CheckCircle, XCircle, Ban, ChevronLeft, ChevronRight, Building2, FileText, X } from 'lucide-react';

const Vendors: React.FC = () => {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'activate' | 'unlock'>('approve');
  const [actionReason, setActionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });

  useEffect(() => { loadVendors(); }, [currentPage, approvalStatusFilter, statusFilter, countryFilter]);

  // Client-side filtering function
  const getFilteredVendors = () => {
    let filtered = vendors;
    
    // Filter by search query (client-side only)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.businessName?.toLowerCase().includes(query) || 
        v.ownerInfo?.firstName?.toLowerCase().includes(query) || 
        v.ownerInfo?.lastName?.toLowerCase().includes(query) || 
        v.businessEmail?.toLowerCase().includes(query) ||
        v.registeredEmail?.toLowerCase().includes(query) ||
        v.businessPhone?.toLowerCase().includes(query) ||
        v.registeredPhone?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build API params - cleanParams removes undefined values
      const apiParams = {
        page: currentPage,
        size: pageSize,
        approvalStatus: approvalStatusFilter || undefined,
        status: statusFilter || undefined,
        country: countryFilter || undefined,
      };
      
      const response = await vendorApi.getAllVendors(apiParams);
      
      // Apply client-side filtering as fallback (in case backend doesn't implement them)
      let filteredVendors = response.data || [];
      
      // Client-side approvalStatus filter (fallback)
      if (approvalStatusFilter) {
        filteredVendors = filteredVendors.filter(v => 
          v.approvalStatus?.toUpperCase() === approvalStatusFilter.toUpperCase()
        );
      }
      
      // Client-side status filter (fallback)
      if (statusFilter) {
        filteredVendors = filteredVendors.filter(v => 
          v.status?.toUpperCase() === statusFilter.toUpperCase()
        );
      }
      
      // Client-side country filter (fallback)
      if (countryFilter) {
        filteredVendors = filteredVendors.filter(v => 
          v.country?.toUpperCase() === countryFilter.toUpperCase()
        );
      }
      
      // Client-side search filter (fallback)
      if (searchQuery.trim()) {
        filteredVendors = filteredVendors.filter(v => 
          v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.businessEmail?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setVendors(filteredVendors);
      setPageInfo(response.pageInfo);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to load vendors';
      setError(errorMsg);
      setVendors([]);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setApprovalStatusFilter('');
    setStatusFilter('');
    setCountryFilter('');
    setSearchQuery('');
    setCurrentPage(0);
  };

  const activeFilters = [
    approvalStatusFilter && `Approval: ${approvalStatusFilter}`,
    statusFilter && `Status: ${statusFilter}`,
    countryFilter && `Country: ${countryFilter}`,
    searchQuery && `Search: ${searchQuery}`,
  ].filter(Boolean);

  const handleSearch = () => { setCurrentPage(0); loadVendors(); };

  const openAction = (vendor: Vendor, type: 'approve' | 'reject' | 'suspend' | 'activate' | 'unlock') => {
    setSelectedVendor(vendor);
    setActionType(type);
    setActionReason('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedVendor) return;
    try {
      if (actionType === 'approve') await vendorApi.approveVendor(selectedVendor.vendorId, actionReason || undefined);
      else if (actionType === 'reject') await vendorApi.rejectVendor(selectedVendor.vendorId, actionReason);
      else if (actionType === 'suspend') await vendorApi.suspendVendor(selectedVendor.vendorId, actionReason);
      else if (actionType === 'activate') await vendorApi.activateVendor(selectedVendor.vendorId);
      else if (actionType === 'unlock') await vendorApi.unlockVendor(selectedVendor.vendorId);
      
      setShowActionModal(false);
      loadVendors();
      showToast(`Vendor ${actionType}d successfully!`, 'success');
    } catch (error: any) { 
      showToast(error.response?.data?.message || `Failed to ${actionType} vendor`, 'error');
    }
  };

  const columns = [
    {
      key: 'business', header: 'Business',
      render: (v: Vendor) => (
        <div>
          <p className="font-semibold text-gray-900">{v.businessName}</p>
          <p className="text-sm text-gray-500">{v.businessEmail}</p>
        </div>
      ),
    },
    { key: 'businessType', header: 'Type', render: (v: Vendor) => <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">{v.businessType}</span> },
    { key: 'country', header: 'Country', render: (v: Vendor) => v.country },
    {
      key: 'approvalStatus', header: 'Approval',
      render: (v: Vendor) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          v.approvalStatus === 'APPROVED' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
          : v.approvalStatus === 'REJECTED' ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white'
          : v.approvalStatus === 'PENDING' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
          : 'bg-gray-100 text-gray-800'
        }`}>{v.approvalStatus}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (v: Vendor) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          v.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
          : v.status === 'SUSPENDED' ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white'
          : 'bg-gray-100 text-gray-800'
        }`}>{v.status}</span>
      ),
    },
    {
      key: 'stats', header: 'Orders',
      render: (v: Vendor) => v.stats ? (
        <div className="flex items-center justify-between gap-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">{v.stats.completedOrders}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="h-8 border-l border-gray-300"></div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">{v.stats.totalOrders}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      ) : 'N/A',
    },
    {
      key: 'actions', header: 'Actions',
      render: (v: Vendor) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={(e) => { e.stopPropagation(); setSelectedVendor(v); setShowDetailModal(true); }}
            className="p-2 bg-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200" title="View Details"><Eye className="w-4 h-4" /></button>
          {v.approvalStatus === 'PENDING' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); openAction(v, 'approve'); }}
                className="p-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200" title="Approve"><CheckCircle className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); openAction(v, 'reject'); }}
                className="p-2 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200" title="Reject"><XCircle className="w-4 h-4" /></button>
            </>
          )}
          {v.status === 'ACTIVE' && v.approvalStatus === 'APPROVED' && (
            <button onClick={(e) => { e.stopPropagation(); openAction(v, 'suspend'); }}
              className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200" title="Suspend"><Ban className="w-4 h-4" /></button>
          )}
          {v.status === 'SUSPENDED' && (
            <button onClick={(e) => { e.stopPropagation(); openAction(v, 'activate'); }}
              className="p-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200" title="Activate"><CheckCircle className="w-4 h-4" /></button>
          )}
          {(v.approvalStatus === 'PENDING' || v.status === 'SUSPENDED') && (
            <button onClick={(e) => { e.stopPropagation(); openAction(v, 'unlock'); }}
              className="p-2 bg-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200" title="Unlock"><Ban className="w-4 h-4" /></button>
          )}
        </div>
      ),
    },
  ];

  if (loading && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-red-50 p-8 rounded-xl">
          <p className="text-red-700 font-semibold">Error Loading Vendors</p>
          <p className="text-red-600 mt-2">{error}</p>
          <button onClick={() => loadVendors()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Try Again
          </button>
        </div>
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
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3"><Building2 className="w-8 h-8" />Vendor Management</h1>
            <p className="text-orange-100 mt-2">Manage all vendors — Total: {pageInfo.totalElements.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <CustomSelect
            value={approvalStatusFilter}
            onChange={(val) => { setApprovalStatusFilter(val); setCurrentPage(0); }}
            options={[
              { value: '', label: 'All Approval' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
            placeholder="Filter by approval"
          />
          <CustomSelect
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(0); }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'SUSPENDED', label: 'Suspended' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            placeholder="Filter by status"
          />
          <CustomSelect
            value={countryFilter}
            onChange={(val) => { setCountryFilter(val); setCurrentPage(0); }}
            options={[
              { value: '', label: 'All Countries' },
              { value: 'INDIA', label: 'India' },
              { value: 'USA', label: 'USA' },
            ]}
            placeholder="Filter by country"
          />
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
            {activeFilters.map((filter, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {vendors.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No vendors found</p>
            <p className="text-gray-500 mt-1">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <>
            <DataTable data={getFilteredVendors()} columns={columns} />
          </>
        )}
        {pageInfo.totalPages > 1 && getFilteredVendors().length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentPage(Math.min(pageInfo.totalPages - 1, currentPage + 1))} disabled={currentPage >= pageInfo.totalPages - 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Vendor Details" size="lg">
        {selectedVendor && (
          <div className="space-y-5">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-bold ring-2 ring-white/30 flex-shrink-0">
                  {selectedVendor.businessName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold">{selectedVendor.businessName}</h2>
                  <p className="text-orange-100 text-sm">{selectedVendor.businessType}</p>
                  <p className="text-orange-100 text-sm truncate">{selectedVendor.businessEmail}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedVendor.approvalStatus === 'APPROVED' ? 'bg-green-400/30 ring-1 ring-green-300'
                    : selectedVendor.approvalStatus === 'REJECTED' ? 'bg-red-400/30 ring-1 ring-red-300'
                    : 'bg-yellow-400/30 ring-1 ring-yellow-300'}`}>
                    {selectedVendor.approvalStatus}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedVendor.status === 'ACTIVE' ? 'bg-green-400/30 ring-1 ring-green-300'
                    : 'bg-red-400/30 ring-1 ring-red-300'}`}>
                    {selectedVendor.status}
                  </span>
                  <div className="flex gap-1.5">
                    {selectedVendor.verified && <span className="px-2 py-0.5 bg-blue-400/30 ring-1 ring-blue-300 text-white rounded-full text-xs font-bold">✓ Verified</span>}
                    {selectedVendor.featured && <span className="px-2 py-0.5 bg-yellow-400/30 ring-1 ring-yellow-300 text-white rounded-full text-xs font-bold">⭐ Featured</span>}
                  </div>
                </div>
              </div>
              {/* Ratings */}
              {selectedVendor.ratings && (
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-6">
                  <div>
                    <span className="text-2xl font-bold">{selectedVendor.ratings.averageRating?.toFixed(1) ?? '—'}</span>
                    <span className="text-orange-200 text-sm ml-1">/ 5.0</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedVendor.ratings.totalReviews ?? 0} reviews</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedVendor.description && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700">{selectedVendor.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Business Email', value: `${selectedVendor.businessEmail || '—'} ${selectedVendor.businessEmailVerified ? '✓' : '✗'}` },
                { label: 'Business Phone', value: `${selectedVendor.businessPhone || '—'} ${selectedVendor.businessPhoneVerified ? '✓' : '✗'}` },
                { label: 'Registration No.', value: selectedVendor.businessRegistrationNumber || '—' },
                { label: 'Tax ID', value: selectedVendor.taxId || '—' },
                { label: 'Established Year', value: String(selectedVendor.establishedYear || '—') },
                { label: 'Country', value: selectedVendor.country || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">{value}</p>
                </div>
              ))}
            </div>

            {/* Owner Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Owner Information</h3>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                {[
                  { label: 'Name', value: `${selectedVendor.ownerInfo?.firstName || ''} ${selectedVendor.ownerInfo?.lastName || ''}`.trim() || '—' },
                  { label: 'Email', value: selectedVendor.ownerInfo?.email || '—' },
                  { label: 'Phone', value: selectedVendor.ownerInfo?.phone || '—' },
                  { label: 'ID Proof', value: selectedVendor.ownerInfo?.idProofType ? `${selectedVendor.ownerInfo.idProofType}: ${selectedVendor.ownerInfo.idProofNumber || '—'}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Business Address</h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{selectedVendor.businessAddress?.streetAddress || 'N/A'}, {selectedVendor.businessAddress?.city || 'N/A'}, {selectedVendor.businessAddress?.state || 'N/A'} - {selectedVendor.businessAddress?.postalCode || 'N/A'}, {selectedVendor.businessAddress?.country || 'N/A'}</p>
            </div>

            {/* Service Areas */}
            {selectedVendor.serviceAreas?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Service Areas</h3>
                <div className="space-y-2">
                  {selectedVendor.serviceAreas.map((area, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{area.city}, {area.state}</p>
                      </div>
                      {area.radiusKm && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{area.radiusKm} km radius</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity & Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Capacity</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p><span className="text-sm text-gray-600">Min Guests:</span> {selectedVendor.capacity?.minGuests || 'N/A'}</p>
                  <p><span className="text-sm text-gray-600">Max Guests:</span> {selectedVendor.capacity?.maxGuests || 'N/A'}</p>
                  <p><span className="text-sm text-gray-600">Concurrent Events:</span> {selectedVendor.capacity?.concurrentEvents || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Pricing</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p><span className="text-sm text-gray-600">Starting:</span> {selectedVendor.pricing?.currency || 'N/A'} {selectedVendor.pricing?.startingPricePerPlate || 'N/A'}/plate</p>
                  <p><span className="text-sm text-gray-600">Average:</span> {selectedVendor.pricing?.currency || 'N/A'} {selectedVendor.pricing?.averagePricePerPlate || 'N/A'}/plate</p>
                </div>
              </div>
            </div>

            {/* Cuisines & Specialties */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Cuisines</h3>
                <div className="flex flex-wrap gap-2">{selectedVendor.cuisinesOffered?.length ? selectedVendor.cuisinesOffered.map(c => <span key={c} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">{c}</span>) : <span className="text-gray-500 text-sm">No cuisines listed</span>}</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Specialties</h3>
                <div className="flex flex-wrap gap-2">{selectedVendor.specialties?.length ? selectedVendor.specialties.map(s => <span key={s} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">{s}</span>) : <span className="text-gray-500 text-sm">No specialties listed</span>}</div>
              </div>
            </div>

            {/* Documents */}
            {selectedVendor.documents?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2"><FileText className="w-4 h-4" />Documents</h3>
                <div className="space-y-2">
                  {selectedVendor.documents.map(doc => (
                    <div key={doc.documentId} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div>
                        <p className="font-semibold text-gray-900">{doc.documentName}</p>
                        <p className="text-sm text-gray-500">{doc.documentType} • {doc.documentNumber}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{doc.verificationStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Vendor`}>
        {selectedVendor && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to <strong>{actionType}</strong> <strong>{selectedVendor.businessName}</strong>?
            </p>
            {(actionType === 'approve' || actionType === 'reject' || actionType === 'suspend') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {actionType === 'approve' ? 'Notes (Optional)' : <>Reason <span className="text-red-500">*</span></>}
                </label>
                <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" rows={3}
                  placeholder={`Enter ${actionType === 'approve' ? 'notes' : 'reason'}...`} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={confirmAction}
                disabled={(actionType === 'reject' || actionType === 'suspend') && !actionReason.trim()}
                className={`flex-1 text-white px-4 py-2 rounded-xl disabled:opacity-50 ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700'
                  : actionType === 'reject' ? 'bg-red-600 hover:bg-red-700'
                  : actionType === 'suspend' ? 'bg-orange-600 hover:bg-orange-700'
                  : actionType === 'activate' ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-500 hover:bg-orange-600'
                }`}>
                Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </button>
              <button onClick={() => setShowActionModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Vendors;




