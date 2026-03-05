import React, { useEffect, useState } from 'react';
import { bidApi } from '../services/api';
import type { BidRequest, PageInfo } from '../types';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { Eye, ChevronLeft, ChevronRight, Gavel, Search, X } from 'lucide-react';

const formatCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

const Bids: React.FC = () => {
  const [bids, setBids] = useState<BidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<BidRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });

  useEffect(() => { loadBids(); }, [currentPage, statusFilter]);

  // Client-side filtering function
  const getFilteredBids = () => {
    let filtered = bids;
    
    // Filter by search query (client-side only)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.bidRequestId?.toLowerCase().includes(query) || 
        b.eventDetails?.eventName?.toLowerCase().includes(query) || 
        b.eventDetails?.eventType?.toLowerCase().includes(query) ||
        b.menuItems?.some(m => m.itemName?.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const loadBids = async () => {
    try {
      setLoading(true);
      
      // Build API params
      const apiParams = {
        page: currentPage,
        size: pageSize,
        status: statusFilter || undefined,
      };
      
      console.log('📤 Sending API request with params:', apiParams);
      const response = await bidApi.getAllBids(apiParams);
      console.log('📥 Bids response:', response);
      
      // Apply client-side filtering as fallback
      let filteredBids = (response.data || []).filter(bid => bid && bid.bidRequestId);
      
      // Client-side status filter (fallback)
      if (statusFilter) {
        filteredBids = filteredBids.filter(b => 
          b.status?.toUpperCase() === statusFilter.toUpperCase()
        );
        console.log(`📊 After status filter (${statusFilter}): ${filteredBids.length} bids`);
      }
      
      // Client-side search filter (fallback)
      if (searchQuery.trim()) {
        filteredBids = filteredBids.filter(b => 
          b.eventDetails?.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.bidRequestId?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        console.log(`🔍 After search filter ("${searchQuery}"): ${filteredBids.length} bids`);
      }
      
      setBids(filteredBids);
      setPageInfo(response.pageInfo);
    } catch (error: any) { 
      console.error('❌ Failed to load bids:', error?.message);
      setBids([]);
    }
    finally { setLoading(false); }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setCurrentPage(0);
    console.log('🔄 All filters cleared');
  };

  const activeFilters = [
    statusFilter && `Status: ${statusFilter}`,
    searchQuery && `Search: ${searchQuery}`,
  ].filter(Boolean);

  const columns = [
    {
      key: 'bidRequestId', header: 'Bid Request',
      render: (b: BidRequest) => (
        <div>
          <p className="font-semibold text-gray-900 font-mono text-sm">{(b.bidRequestId || '').substring(0, 8)}...</p>
          <p className="text-xs text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'event', header: 'Event',
      render: (b: BidRequest) => (
        <div>
          <p className="font-semibold">{b.eventDetails?.eventName || 'N/A'}</p>
          <p className="text-xs text-gray-500">{b.eventDetails?.eventType || 'N/A'} • {b.eventDetails?.numberOfGuests || 0} guests</p>
        </div>
      ),
    },
    { key: 'eventDate', header: 'Event Date', render: (b: BidRequest) => b.eventDetails?.eventDate ? new Date(b.eventDetails.eventDate).toLocaleDateString() : 'N/A' },
    { key: 'menuItems', header: 'Items', render: (b: BidRequest) => b.menuItems?.length || 0 },
    {
      key: 'bids', header: 'Bids Received',
      render: (b: BidRequest) => (
        <div>
          <p className="font-semibold text-blue-600">{b.totalBidsReceived || 0}</p>
          {b.lowestBidAmount != null && <p className="text-xs text-green-600">Lowest: {formatCurrency(b.lowestBidAmount)}</p>}
        </div>
      ),
    },
    {
      key: 'competitivePeriod', header: 'Competitive Period',
      render: (b: BidRequest) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          b.competitivePeriod?.status === 'ACTIVE' ? 'bg-green-100 text-green-800'
          : b.competitivePeriod?.status === 'EXPIRED' ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800'
        }`}>{b.competitivePeriod?.status || 'N/A'}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (b: BidRequest) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          b.status === 'ACTIVE' ? 'bg-green-100 text-green-800'
          : b.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800'
          : b.status === 'EXPIRED' ? 'bg-red-100 text-red-800'
          : b.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800'
          : 'bg-yellow-100 text-yellow-800'
        }`}>{b.status || 'N/A'}</span>
      ),
    },
    {
      key: 'actions', header: 'View',
      render: () => (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors">
          <Eye className="w-4 h-4" />
        </span>
      ),
    },
  ];

  if (loading && bids.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold flex items-center gap-3"><Gavel className="w-8 h-8" />Bid Requests</h1>
          <p className="text-amber-100 mt-2">Total: {pageInfo.totalElements.toLocaleString()} bid requests</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bids..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
              onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(0)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(0); }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'ACCEPTED', label: 'Accepted' },
              { value: 'EXPIRED', label: 'Expired' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            placeholder="Filter by status"
          />
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
            {activeFilters.map((filter, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
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
        {bids.length === 0 ? (
          <div className="p-12 text-center">
            <Gavel className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No bids found</p>
            <p className="text-gray-500 mt-1">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredBids().map((bid, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => { setSelectedBid(bid); setShowDetailModal(true); }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                      {col.render(bid)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pageInfo.totalPages > 1 && getFilteredBids().length > 0 && (
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

      {/* Bid Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Bid Request Details" size="lg">
        {selectedBid && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-gray-700">Bid Request ID</label><p className="mt-1 font-mono text-sm">{selectedBid.bidRequestId}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Status</label><p className="mt-1">{selectedBid.status}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Created</label><p className="mt-1">{new Date(selectedBid.createdAt).toLocaleString()}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Expires</label><p className="mt-1">{new Date(selectedBid.expiresAt).toLocaleString()}</p></div>
            </div>

            {/* Event Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Event Details</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div><label className="text-sm text-gray-600">Event Name</label><p className="font-semibold">{selectedBid.eventDetails?.eventName || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-600">Type</label><p className="font-semibold">{selectedBid.eventDetails?.eventType || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-600">Date</label><p className="font-semibold">{selectedBid.eventDetails?.eventDate ? new Date(selectedBid.eventDetails.eventDate).toLocaleDateString() : 'N/A'}</p></div>
                <div><label className="text-sm text-gray-600">Guests</label><p className="font-semibold">{selectedBid.eventDetails?.numberOfGuests || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-600">Time</label><p className="font-semibold">{selectedBid.eventDetails?.eventStartTime || 'N/A'} - {selectedBid.eventDetails?.eventEndTime || 'N/A'}</p></div>
              </div>
            </div>

            {/* Menu Items */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Menu Items ({selectedBid.menuItems?.length || 0})</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                {selectedBid.menuItems && selectedBid.menuItems.length > 0 ? (
                  selectedBid.menuItems.map((item, i) => (
                    <div key={i} className="flex justify-between py-1 text-sm">
                      <span>{item.itemName || 'Unknown Item'}</span>
                      <span className="text-gray-500">Qty: {item.quantity || 0}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No menu items</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Budget</h3>
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600">Estimated Budget</label><p className="font-semibold">{formatCurrency(selectedBid.budget?.estimatedBudget || 0, selectedBid.budget?.currency || 'INR')}</p></div>
                <div><label className="text-sm text-gray-600">Budget Range</label><p className="font-semibold">{selectedBid.budget?.budgetRange || 'N/A'}</p></div>
              </div>
            </div>

            {/* Additional Requirements */}
            {selectedBid.additionalRequirements && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Additional Requirements</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p><span className="text-sm text-gray-600">Service Staff:</span> {selectedBid.additionalRequirements.serviceStaffNeeded ? `Yes (${selectedBid.additionalRequirements.numberOfStaff || 0} staff)` : 'No'}</p>
                  <p><span className="text-sm text-gray-600">Decoration:</span> {selectedBid.additionalRequirements.decorationNeeded ? 'Yes' : 'No'}</p>
                  {selectedBid.additionalRequirements.liveCounters && selectedBid.additionalRequirements.liveCounters.length > 0 && (
                    <p><span className="text-sm text-gray-600">Live Counters:</span> {selectedBid.additionalRequirements.liveCounters.join(', ')}</p>
                  )}
                  {selectedBid.additionalRequirements.specialInstructions && (
                    <p><span className="text-sm text-gray-600">Special Instructions:</span> {selectedBid.additionalRequirements.specialInstructions}</p>
                  )}
                </div>
              </div>
            )}

            {/* Competitive Period */}
            {selectedBid.competitivePeriod && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Competitive Period</h3>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-4">
                  <div><label className="text-sm text-gray-600">Start</label><p className="font-semibold text-sm">{selectedBid.competitivePeriod.startTime ? new Date(selectedBid.competitivePeriod.startTime).toLocaleString() : 'N/A'}</p></div>
                  <div><label className="text-sm text-gray-600">End</label><p className="font-semibold text-sm">{selectedBid.competitivePeriod.endTime ? new Date(selectedBid.competitivePeriod.endTime).toLocaleString() : 'N/A'}</p></div>
                  <div><label className="text-sm text-gray-600">Status</label><p className="font-semibold">{selectedBid.competitivePeriod.status || 'N/A'}</p></div>
                </div>
              </div>
            )}

            {/* Bid Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{selectedBid.totalBidsReceived || 0}</p>
                <p className="text-sm text-blue-800">Total Bids Received</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{selectedBid.lowestBidAmount != null ? formatCurrency(selectedBid.lowestBidAmount) : 'N/A'}</p>
                <p className="text-sm text-green-800">Lowest Bid</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bids;
