import React, { useEffect, useState } from 'react';
import { orderApi } from '../services/api';
import type { Order, PageInfo } from '../types';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { Eye, ChevronLeft, ChevronRight, ShoppingBag, RefreshCw, Search } from 'lucide-react';

const formatCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

const Orders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadOrders(); }, [currentPage, statusFilter]);

  // Client-side filtering function
  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.orderId?.toLowerCase().includes(query) || 
        o.contactInfo?.primaryContactName?.toLowerCase().includes(query) || 
        o.contactInfo?.primaryContactEmail?.toLowerCase().includes(query) || 
        o.vendorOrders?.some(v => v.vendorName?.toLowerCase().includes(query))
      );
    }
    
    // Status filter is already applied server-side
    return filtered;
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAllOrders({ page: currentPage, size: pageSize, status: statusFilter || undefined });
      // Filter out orders with missing critical data
      const validOrders = (response.data || []).filter(order => order && order.orderId);
      setOrders(validOrders);
      setPageInfo(response.pageInfo);
    } catch (error: any) { 
      setOrders([]);
    }
    finally { setLoading(false); }
  };

  const handleOverrideStatus = async () => {
    if (!selectedOrder || !overrideStatus || !overrideReason) return;
    try {
      await orderApi.overrideOrderStatus(selectedOrder.orderId, overrideStatus, overrideReason);
      setShowStatusModal(false);
      setOverrideStatus('');
      setOverrideReason('');
      loadOrders();
      showToast('Order status updated successfully!', 'success');
    } catch (error: any) { 
      showToast(error.response?.data?.message || 'Failed to override order status', 'error');
    }
  };

  const columns = [
    {
      key: 'orderId', header: 'Order',
      render: (o: Order) => (
        <div>
          <p className="font-semibold text-gray-900 font-mono text-sm">{(o.orderId || '').substring(0, 8)}...</p>
          <p className="text-xs text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'event', header: 'Event',
      render: (o: Order) => (
        <div>
          <p className="font-semibold">{o.eventDetails?.eventName || 'N/A'}</p>
          <p className="text-xs text-gray-500">{o.eventDetails?.eventType || 'N/A'} • {o.eventDetails?.numberOfGuests || 0} guests</p>
        </div>
      ),
    },
    { key: 'eventDate', header: 'Event Date', render: (o: Order) => o.eventDetails?.eventDate ? new Date(o.eventDetails.eventDate).toLocaleDateString() : 'N/A' },
    { key: 'vendors', header: 'Vendors', render: (o: Order) => o.vendorOrders?.length || 0 },
    {
      key: 'total', header: 'Total',
      render: (o: Order) => formatCurrency(o.pricing?.totalAmount || 0, o.pricing?.currency || 'INR'),
    },
    {
      key: 'payment', header: 'Payment',
      render: (o: Order) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          o.paymentDetails?.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800'
          : o.paymentDetails?.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
        }`}>{o.paymentDetails?.paymentStatus || 'N/A'}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (o: Order) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          o.status === 'COMPLETED' ? 'bg-green-100 text-green-800'
          : o.status === 'CONFIRMED' ? 'bg-orange-100 text-orange-800'
          : o.status === 'CANCELLED' ? 'bg-red-100 text-red-800'
          : o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800'
          : 'bg-gray-100 text-gray-800'
        }`}>{o.status || 'N/A'}</span>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (o: Order) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); setShowDetailModal(true); }}
            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200" title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); setShowStatusModal(true); }}
            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200" title="Override Status"><RefreshCw className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  if (loading && orders.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3"><ShoppingBag className="w-8 h-8" />Order Management</h1>
        <p className="text-orange-100 mt-1">Total: {pageInfo.totalElements.toLocaleString()} orders</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders by ID, customer, or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="w-52">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setCurrentPage(0); }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'DELIVERED', label: 'Delivered' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              placeholder="Filter by status"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <DataTable data={getFilteredOrders()} columns={columns} />
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
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Event */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Event Details</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div><label className="text-sm text-gray-600">Event Name</label><p className="font-semibold">{selectedOrder.eventDetails?.eventName || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-600">Type</label><p className="font-semibold">{selectedOrder.eventDetails?.eventType || 'N/A'}</p></div>
                <div><label className="text-sm text-gray-600">Date & Time</label><p className="font-semibold">{selectedOrder.eventDetails?.eventDate ? new Date(selectedOrder.eventDetails.eventDate).toLocaleDateString() : 'N/A'} {selectedOrder.eventDetails?.eventTime ? `at ${selectedOrder.eventDetails.eventTime}` : ''}</p></div>
                <div><label className="text-sm text-gray-600">Guests</label><p className="font-semibold">{selectedOrder.eventDetails?.numberOfGuests || 'N/A'}</p></div>
                <div className="col-span-2"><label className="text-sm text-gray-600">Venue</label><p className="font-semibold">{selectedOrder.eventDetails?.venueAddress ? `${selectedOrder.eventDetails.venueAddress.streetAddress}, ${selectedOrder.eventDetails.venueAddress.city}` : 'N/A'}</p></div>
              </div>
            </div>

            {/* Vendor Orders */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Vendor Orders ({selectedOrder.vendorOrders?.length || 0})</h3>
              {selectedOrder.vendorOrders && selectedOrder.vendorOrders.length > 0 ? (
                selectedOrder.vendorOrders.map(vo => (
                  <div key={vo.vendorOrderId} className="bg-gray-50 rounded-xl p-4 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">{vo.vendorName || 'Unknown Vendor'}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        vo.vendorStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{vo.vendorStatus || 'N/A'}</span>
                    </div>
                    {vo.items && vo.items.length > 0 ? (
                      vo.items.map(item => (
                        <div key={item.vendorItemId} className="flex justify-between text-sm py-1">
                          <span>{item.itemName || 'Unknown Item'} x{item.quantity || 0}</span>
                          <span>{formatCurrency(item.totalPrice || 0)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No items</p>
                    )}
                    <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(vo.totalAmount || 0)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No vendor orders</p>
              )}
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pricing Breakdown</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(selectedOrder.pricing?.subtotal || 0)}</span></div>
                <div className="flex justify-between"><span>Service Charges</span><span>{formatCurrency(selectedOrder.pricing?.serviceCharges || 0)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(selectedOrder.pricing?.taxAmount || 0)}</span></div>
                <div className="flex justify-between"><span>Platform Fee</span><span>{formatCurrency(selectedOrder.pricing?.platformFee || 0)}</span></div>
                {(selectedOrder.pricing?.discountAmount || 0) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(selectedOrder.pricing?.discountAmount || 0)}</span></div>}
                <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(selectedOrder.pricing?.totalAmount || 0)}</span></div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Payment</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div><label className="text-sm text-gray-600">Token Amount</label><p className="font-semibold">{formatCurrency(selectedOrder.paymentDetails?.tokenAmount || 0)} {selectedOrder.paymentDetails?.tokenPaid ? '✅' : '❌'}</p></div>
                <div><label className="text-sm text-gray-600">Total Paid</label><p className="font-semibold">{formatCurrency(selectedOrder.paymentDetails?.totalPaid || 0)}</p></div>
                <div><label className="text-sm text-gray-600">Balance Due</label><p className="font-semibold">{formatCurrency(selectedOrder.paymentDetails?.balanceDue || 0)}</p></div>
                <div><label className="text-sm text-gray-600">Status</label><p className="font-semibold">{selectedOrder.paymentDetails?.paymentStatus || 'N/A'}</p></div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Info</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                {selectedOrder.contactInfo ? (
                  <p>{selectedOrder.contactInfo.primaryContactName || 'N/A'} • {selectedOrder.contactInfo.primaryContactPhone || 'N/A'} • {selectedOrder.contactInfo.primaryContactEmail || 'N/A'}</p>
                ) : (
                  <p className="text-gray-500">No contact information available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Override Modal */}
      <Modal isOpen={showStatusModal} onClose={() => { setShowStatusModal(false); setOverrideStatus(''); setOverrideReason(''); }}
        title="Override Order Status">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Status <span className="text-red-500">*</span></label>
            <CustomSelect
              value={overrideStatus}
              onChange={(val) => setOverrideStatus(val)}
              options={[
                { value: '', label: 'Select status...' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'DELIVERED', label: 'Delivered' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              placeholder="Select status"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
            <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" rows={3} placeholder="Reason for status override..." />
          </div>
          <div className="flex gap-3">
            <button onClick={handleOverrideStatus} disabled={!overrideStatus || !overrideReason}
              className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-orange-700">Override Status</button>
            <button onClick={() => setShowStatusModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;




