import React, { useEffect, useState } from 'react';
import { platformConfigApi } from '../services/api';
import type { PlatformConfig, UpdatePlatformConfigRequest, BiddingConfig, PaymentConfig, CancellationPolicy, CommissionConfig, RefundTier } from '../types';
import { useToast } from '../hooks/useToast';
import CustomSelect from '../components/CustomSelect';
import { Settings, Save, Globe } from 'lucide-react';

const PlatformConfigPage: React.FC = () => {
  const { showToast } = useToast();
  const [country, setCountry] = useState('INDIA');
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable copies
  const [biddingConfig, setBiddingConfig] = useState<BiddingConfig>({
    competitivePeriodHours: 24, coolingPeriodHours: 2, paymentCoolingPeriodHours: 4,
    bidExpiryHours: 72, minVendorsForCompetitive: 3, maxBidRevisions: 3,
  });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    tokenPercentage: 10, enabledGateways: [], defaultGateway: '', paymentTimeoutHours: 24, autoRefundEnabled: true,
  });
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>({
    cancellationWindowDays: 7, refundTiers: [],
  });
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig>({
    platformFeePercentage: 5, vendorCommissionPercentage: 10, paymentGatewayFeePercentage: 2,
  });

  useEffect(() => { loadConfig(); }, [country]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await platformConfigApi.getConfig(country);
      setConfig(data);
      setBiddingConfig(data.biddingConfig);
      setPaymentConfig(data.paymentConfig);
      setCancellationPolicy(data.cancellationPolicy);
      setCommissionConfig(data.commissionConfig);
    } catch (error) {
      showToast('Failed to load platform configuration', 'error');
    }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: UpdatePlatformConfigRequest = { biddingConfig, paymentConfig, cancellationPolicy, commissionConfig };
      const updated = await platformConfigApi.updateConfig(country, updateData);
      setConfig(updated);
      showToast('Configuration saved successfully!', 'success');
    } catch (error: any) { 
      showToast(error.response?.data?.message || 'Failed to save configuration', 'error');
    }
    finally { setSaving(false); }
  };

  const addRefundTier = () => {
    setCancellationPolicy({
      ...cancellationPolicy,
      refundTiers: [...cancellationPolicy.refundTiers, { daysBeforeEvent: 0, refundPercentage: 0 }],
    });
  };

  const updateRefundTier = (index: number, field: keyof RefundTier, value: number) => {
    const updated = [...cancellationPolicy.refundTiers];
    updated[index] = { ...updated[index], [field]: value };
    setCancellationPolicy({ ...cancellationPolicy, refundTiers: updated });
  };

  const removeRefundTier = (index: number) => {
    setCancellationPolicy({
      ...cancellationPolicy,
      refundTiers: cancellationPolicy.refundTiers.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-slate-600 to-gray-800 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Settings className="w-8 h-8" />Platform Configuration</h1>
            {config && <p className="text-gray-300 mt-1">Last updated: {new Date(config.updatedAt).toLocaleString()} by {config.updatedBy}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 w-48">
              <Globe className="w-5 h-5" />
              <CustomSelect
                value={country}
                onChange={(val) => setCountry(val)}
                options={[
                  { value: 'INDIA', label: 'India' },
                  { value: 'USA', label: 'USA' },
                ]}
                placeholder="Select country"
                className="w-full"
              />
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 disabled:opacity-50">
              <Save className="w-5 h-5" />{saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Bidding Config */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bidding Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([
            ['competitivePeriodHours', 'Competitive Period (hrs)'],
            ['coolingPeriodHours', 'Cooling Period (hrs)'],
            ['paymentCoolingPeriodHours', 'Payment Cooling (hrs)'],
            ['bidExpiryHours', 'Bid Expiry (hrs)'],
            ['minVendorsForCompetitive', 'Min Vendors for Competitive'],
            ['maxBidRevisions', 'Max Bid Revisions'],
          ] as [keyof BiddingConfig, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
              <input type="number" value={biddingConfig[key]}
                onChange={(e) => setBiddingConfig({ ...biddingConfig, [key]: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Config */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Token Percentage (%)</label>
            <input type="number" value={paymentConfig.tokenPercentage}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, tokenPercentage: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Default Gateway</label>
            <input type="text" value={paymentConfig.defaultGateway}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, defaultGateway: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Timeout (hrs)</label>
            <input type="number" value={paymentConfig.paymentTimeoutHours}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, paymentTimeoutHours: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Enabled Gateways (comma-separated)</label>
            <input type="text" value={paymentConfig.enabledGateways.join(', ')}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, enabledGateways: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="RAZORPAY, STRIPE" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={paymentConfig.autoRefundEnabled}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, autoRefundEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">Auto Refund Enabled</span>
            </label>
          </div>
        </div>
      </div>

      {/* Commission Config */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Commission Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Fee (%)</label>
            <input type="number" step="0.1" value={commissionConfig.platformFeePercentage}
              onChange={(e) => setCommissionConfig({ ...commissionConfig, platformFeePercentage: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor Commission (%)</label>
            <input type="number" step="0.1" value={commissionConfig.vendorCommissionPercentage}
              onChange={(e) => setCommissionConfig({ ...commissionConfig, vendorCommissionPercentage: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Gateway Fee (%)</label>
            <input type="number" step="0.1" value={commissionConfig.paymentGatewayFeePercentage}
              onChange={(e) => setCommissionConfig({ ...commissionConfig, paymentGatewayFeePercentage: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cancellation Policy</h2>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cancellation Window (days)</label>
          <input type="number" value={cancellationPolicy.cancellationWindowDays}
            onChange={(e) => setCancellationPolicy({ ...cancellationPolicy, cancellationWindowDays: Number(e.target.value) })}
            className="w-64 px-4 py-2 border border-gray-300 rounded-xl" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Refund Tiers</h3>
            <button onClick={addRefundTier} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 text-sm font-semibold">+ Add Tier</button>
          </div>
          {cancellationPolicy.refundTiers.map((tier, index) => (
            <div key={index} className="flex items-center gap-4 mb-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Days Before Event</label>
                <input type="number" value={tier.daysBeforeEvent} onChange={(e) => updateRefundTier(index, 'daysBeforeEvent', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Refund Percentage (%)</label>
                <input type="number" value={tier.refundPercentage} onChange={(e) => updateRefundTier(index, 'refundPercentage', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <button onClick={() => removeRefundTier(index)} className="mt-4 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">✕</button>
            </div>
          ))}
          {cancellationPolicy.refundTiers.length === 0 && <p className="text-gray-400 text-sm">No refund tiers configured.</p>}
        </div>
      </div>
    </div>
  );
};

export default PlatformConfigPage;
export { PlatformConfigPage as PlatformConfig };


