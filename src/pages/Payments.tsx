import React, { useEffect, useState } from 'react';
import { paymentApi } from '../services/api';
import type { PageInfo } from '../types';
import { useToast } from '../hooks/useToast';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import DataTable from '../components/DataTable';
import { CreditCard, RefreshCw, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const formatCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

const statusColors: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-orange-100 text-orange-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  PARTIALLY_REFUNDED: 'bg-indigo-100 text-indigo-800',
};

const Payments: React.FC = () => {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });
  const [transactionId, setTransactionId] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refundResult, setRefundResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadTransactions(); }, [currentPage, statusFilter, gatewayFilter]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await paymentApi.getRevenueStats();
      setStats(data);
    } catch { /* stats unavailable */ }
    finally { setStatsLoading(false); }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getAllTransactions({
        page: currentPage,
        size: pageSize,
        status: statusFilter || undefined,
        gateway: gatewayFilter || undefined,
      });
      setTransactions(response.data || []);
      setPageInfo(response.pageInfo);
    } catch { setTransactions([]); }
    finally { setLoading(false); }
  };

  const getFilteredTransactions = () => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t =>
      t.transactionId?.toLowerCase().includes(q) ||
      t.orderId?.toLowerCase().includes(q) ||
      t.gatewayTransactionId?.toLowerCase().includes(q) ||
      t.userId?.toLowerCase().includes(q)
    );
  };

  const openRefundForTransaction = (t: any) => {
    setTransactionId(t.transactionId);
    setRefundAmount(t.amount?.amount || 0);
    setRefundReason('');
    setShowRefundModal(true);
  };

  const columns = [
    {
      key: 'transactionId', header: 'Transaction',
      render: (t: any) => (
        <div>
          <p className="font-mono text-xs text-gray-700 font-semibold">{(t.transactionId || '').substring(0, 12)}…</p>
          {t.gatewayTransactionId && <p className="text-xs text-gray-400 font-mono">{(t.gatewayTransactionId || '').substring(0, 12)}…</p>}
        </div>
      ),
    },
    {
      key: 'paymentType', header: 'Type',
      render: (t: any) => <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">{t.paymentType || '—'}</span>,
    },
    {
      key: 'amount', header: 'Amount',
      render: (t: any) => (
        <div>
          <p className="font-semibold text-gray-900">{formatCurrency(t.amount?.amount || 0, t.amount?.currency || 'INR')}</p>
          <p className="text-xs text-gray-500">Fee: {formatCurrency(t.amount?.platformFee || 0)}</p>
        </div>
      ),
    },
    {
      key: 'gateway', header: 'Gateway',
      render: (t: any) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{t.paymentGateway || '—'}</p>
          <p className="text-xs text-gray-500">{t.paymentMethod || ''}</p>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (t: any) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[t.status] || 'bg-gray-100 text-gray-800'}`}>{t.status || '—'}</span>,
    },
    {
      key: 'date', header: 'Date',
      render: (t: any) => (
        <div className="text-xs">
          <p className="font-semibold text-gray-700">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</p>
          <p className="text-gray-400">{t.createdAt ? new Date(t.createdAt).toLocaleTimeString() : ''}</p>
        </div>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (t: any) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setSelectedTransaction(t); setShowDetailModal(true); }}
            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          {t.status === 'SUCCESS' && (
            <button onClick={(e) => { e.stopPropagation(); openRefundForTransaction(t); }}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all" title="Initiate Refund">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];


  const handleInitiateRefund = async () => {
    if (!transactionId || !refundAmount || !refundReason) return;
    setSubmitting(true);
    try {
      const result = await paymentApi.initiateRefund(transactionId, refundAmount, refundReason);
      setRefundResult(result);
      setShowRefundModal(false);
      setShowResultModal(true);
      setTransactionId('');
      setRefundAmount(0);
      setRefundReason('');
      showToast('Refund initiated successfully!', 'success');
      loadTransactions();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to initiate refund', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-orange-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><CreditCard className="w-8 h-8" />Payments & Transactions</h1>
            <p className="text-orange-100 mt-1">View all transactions and manage refunds</p>
          </div>
          <button onClick={() => { setTransactionId(''); setRefundAmount(0); setRefundReason(''); setShowRefundModal(true); }}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition-all">
            <RefreshCw className="w-5 h-5" />Initiate Refund
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      {!statsLoading && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue || 0), icon: '💰' },
              { label: 'This Month', value: formatCurrency(stats.currentMonthRevenue || 0), icon: '📅' },
              { label: 'Previous Month', value: formatCurrency(stats.previousMonthRevenue || 0), icon: '📆' },
              { label: 'Revenue Growth', value: `${(stats.revenueGrowth || 0).toFixed(1)}%`, icon: '📈' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Platform Fees', value: formatCurrency(stats.platformFees || 0), icon: '🏦' },
              { label: 'Vendor Payouts', value: formatCurrency(stats.vendorPayouts || 0), icon: '💸' },
              { label: 'Pending Payouts', value: formatCurrency(stats.pendingPayouts || 0), icon: '⏳' },
              { label: 'Total Transactions', value: (stats.totalTransactions || 0).toLocaleString(), icon: '📊' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Successful', value: (stats.successfulTransactions || 0).toLocaleString(), icon: '✅', color: 'text-green-600' },
              { label: 'Failed', value: (stats.failedTransactions || 0).toLocaleString(), icon: '❌', color: 'text-red-600' },
              { label: 'Refunded', value: (stats.refundedTransactions || 0).toLocaleString(), icon: '↩️', color: 'text-purple-600' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search by transaction ID, order ID, user ID..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="w-48">
            <CustomSelect value={statusFilter} onChange={(val) => { setStatusFilter(val); setCurrentPage(0); }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'SUCCESS', label: 'Success' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'REFUNDED', label: 'Refunded' },
                { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded' },
              ]} placeholder="Filter by status" />
          </div>
          <div className="w-48">
            <CustomSelect value={gatewayFilter} onChange={(val) => { setGatewayFilter(val); setCurrentPage(0); }}
              options={[
                { value: '', label: 'All Gateways' },
                { value: 'RAZORPAY', label: 'Razorpay' },
                { value: 'STRIPE', label: 'Stripe' },
                { value: 'PAYPAL', label: 'PayPal' },
              ]} placeholder="Filter by gateway" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        ) : getFilteredTransactions().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <CreditCard className="w-12 h-12 mb-3" />
            <p className="text-lg font-semibold">No transactions found</p>
            <p className="text-sm">Try adjusting filters or check back later</p>
          </div>
        ) : (
          <DataTable data={getFilteredTransactions()} columns={columns} />
        )}
        {pageInfo.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages} — {pageInfo.totalElements.toLocaleString()} transactions</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentPage(Math.min(pageInfo.totalPages - 1, currentPage + 1))} disabled={currentPage >= pageInfo.totalPages - 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Transaction Details" size="lg">
        {selectedTransaction && (
          <div className="space-y-5">
            {/* Status banner */}
            <div className={`rounded-2xl p-5 flex items-center justify-between ${statusColors[selectedTransaction.status] || 'bg-gray-100 text-gray-800'}`}>
              <div>
                <p className="text-xs font-semibold uppercase opacity-70 mb-0.5">Transaction ID</p>
                <p className="font-mono font-bold text-sm">{selectedTransaction.transactionId}</p>
                {selectedTransaction.gatewayTransactionId && (
                  <p className="font-mono text-xs opacity-70 mt-1">Gateway: {selectedTransaction.gatewayTransactionId}</p>
                )}
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/60 shadow">{selectedTransaction.status}</span>
            </div>

            {/* IDs grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Order ID', selectedTransaction.orderId],
                ['Bid ID', selectedTransaction.bidId],
                ['User ID', selectedTransaction.userId],
                ['Vendor ID', selectedTransaction.vendorId],
                ['Payment Type', selectedTransaction.paymentType],
                ['Payment Method', selectedTransaction.paymentMethod],
                ['Gateway', selectedTransaction.paymentGateway],
                ['Gateway Order ID', selectedTransaction.gatewayOrderId],
              ].filter(([, val]) => Boolean(val)).map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 break-all">{val}</p>
                </div>
              ))}
            </div>

            {/* Amount breakdown */}
            {selectedTransaction.amount && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <p className="text-sm font-bold text-orange-900 mb-3">Amount Breakdown</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-orange-700 font-semibold">Total Amount</p>
                    <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(selectedTransaction.amount.amount || 0, selectedTransaction.amount.currency || 'INR')}</p>
                  </div>
                  <div className="text-center bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-orange-700 font-semibold">Platform Fee</p>
                    <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(selectedTransaction.amount.platformFee || 0)}</p>
                  </div>
                  <div className="text-center bg-white rounded-xl p-3 shadow-sm">
                    <p className="text-xs text-orange-700 font-semibold">Vendor Payout</p>
                    <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(selectedTransaction.amount.vendorPayout || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment method details */}
            {selectedTransaction.paymentMethodDetails && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-3">Payment Method Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedTransaction.paymentMethodDetails.upiId && <div className="bg-white rounded-xl p-3"><span className="text-gray-500 text-xs">UPI ID</span><p className="font-semibold">{selectedTransaction.paymentMethodDetails.upiId}</p></div>}
                  {selectedTransaction.paymentMethodDetails.cardBrand && <div className="bg-white rounded-xl p-3"><span className="text-gray-500 text-xs">Card</span><p className="font-semibold">{selectedTransaction.paymentMethodDetails.cardBrand} ****{selectedTransaction.paymentMethodDetails.cardLastFour}</p></div>}
                  {selectedTransaction.paymentMethodDetails.bankName && <div className="bg-white rounded-xl p-3"><span className="text-gray-500 text-xs">Bank</span><p className="font-semibold">{selectedTransaction.paymentMethodDetails.bankName}</p></div>}
                  {selectedTransaction.paymentMethodDetails.walletName && <div className="bg-white rounded-xl p-3"><span className="text-gray-500 text-xs">Wallet</span><p className="font-semibold">{selectedTransaction.paymentMethodDetails.walletName}</p></div>}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Initiated', selectedTransaction.initiatedAt],
                ['Processed', selectedTransaction.processedAt],
                ['Settled', selectedTransaction.settledAt],
                ['Created', selectedTransaction.createdAt],
              ].map(([label, date]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
                  <p className="text-xs text-gray-900 mt-0.5">{date ? new Date(date as string).toLocaleString() : '—'}</p>
                </div>
              ))}
            </div>

            {selectedTransaction.failureReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm font-semibold text-red-700">Failure Reason</p>
                <p className="text-sm text-red-600 mt-1">{selectedTransaction.failureReason}</p>
              </div>
            )}

            {selectedTransaction.status === 'SUCCESS' && (
              <button onClick={() => { setShowDetailModal(false); openRefundForTransaction(selectedTransaction); }}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 font-semibold transition-all">
                <RefreshCw className="w-4 h-4" />Initiate Refund for this Transaction
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal isOpen={showRefundModal} onClose={() => setShowRefundModal(false)} title="Initiate Refund">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction ID <span className="text-red-500">*</span></label>
            <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              placeholder="Enter transaction ID" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Refund Amount (INR) <span className="text-red-500">*</span></label>
            <input type="number" value={refundAmount || ''} onChange={(e) => setRefundAmount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              placeholder="0.00" min={0} step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" rows={3}
              placeholder="Reason for refund..." />
          </div>
          <div className="flex gap-3">
            <button onClick={handleInitiateRefund}
              disabled={submitting || !transactionId || !refundAmount || !refundReason}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl disabled:opacity-50">
              {submitting ? 'Processing...' : 'Initiate Refund'}
            </button>
            <button onClick={() => setShowRefundModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Refund Result Modal */}
      <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)} title="Refund Initiated">
        {refundResult && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-semibold text-lg">Refund Successfully Initiated!</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-gray-700">Refund ID</label><p className="mt-1 font-mono text-sm">{refundResult.refundId}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Transaction ID</label><p className="mt-1 font-mono text-sm">{refundResult.transactionId}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Order ID</label><p className="mt-1 font-mono text-sm">{refundResult.orderId}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Refund Amount</label><p className="mt-1 font-semibold">{formatCurrency(refundResult.refundAmount, refundResult.currency)}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Status</label><p className="mt-1">{refundResult.status}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Estimated Arrival</label><p className="mt-1">{refundResult.estimatedArrival ? new Date(refundResult.estimatedArrival).toLocaleDateString() : '—'}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;



