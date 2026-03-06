import React, { useState } from 'react';
import { paymentApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import Modal from '../components/Modal';
import { CreditCard, RefreshCw } from 'lucide-react';

const formatCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

const Payments: React.FC = () => {
  const { showToast } = useToast();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refundResult, setRefundResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);

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
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to initiate refund', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-orange-500 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3"><CreditCard className="w-8 h-8" />Payments & Refunds</h1>
        <p className="text-orange-100 mt-1">Manage payment refunds for transactions</p>
      </div>

      {/* Refund Action Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initiate Refund</h2>
          <p className="text-gray-500 mb-6">Process a refund for a specific payment transaction. Enter the transaction ID, refund amount, and reason to proceed.</p>
          <button onClick={() => setShowRefundModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
            Start Refund Process
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-orange-900 mb-2">Payment Information</h3>
        <div className="text-sm text-orange-800 space-y-1">
          <p>• Payment details are available in each Order's detail view (Order Management page).</p>
          <p>• To initiate a refund, you need the <strong>Transaction ID</strong> from the payment system.</p>
          <p>• Refund amounts cannot exceed the original transaction amount.</p>
          <p>• Once a refund is initiated, it may take 5-7 business days to process.</p>
        </div>
      </div>

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
              <p className="text-green-700 font-semibold text-lg mb-1">Refund Successfully Initiated!</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-gray-700">Refund ID</label><p className="mt-1 font-mono text-sm">{refundResult.refundId}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Transaction ID</label><p className="mt-1 font-mono text-sm">{refundResult.transactionId}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Order ID</label><p className="mt-1 font-mono text-sm">{refundResult.orderId}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Refund Amount</label><p className="mt-1 font-semibold">{formatCurrency(refundResult.refundAmount, refundResult.currency)}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Status</label><p className="mt-1">{refundResult.status}</p></div>
              <div><label className="text-sm font-semibold text-gray-700">Estimated Arrival</label><p className="mt-1">{new Date(refundResult.estimatedArrival).toLocaleDateString()}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;


