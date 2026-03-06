import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import type { DashboardStats } from '../types';
import StatCard from '../components/StatCard';
import {
  Users,
  Store,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

// Deep merge function for nested objects
const mergeStats = (defaults: DashboardStats, incoming: Partial<DashboardStats>): DashboardStats => ({
  userStats: { ...defaults.userStats, ...incoming.userStats },
  vendorStats: { ...defaults.vendorStats, ...incoming.vendorStats },
  orderStats: { ...defaults.orderStats, ...incoming.orderStats },
  revenueStats: { ...defaults.revenueStats, ...incoming.revenueStats },
  bidStats: { ...defaults.bidStats, ...incoming.bidStats },
});

// Provide defaults for missing stats data
const defaultStats: DashboardStats = {
  userStats: {
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
  },
  vendorStats: {
    totalVendors: 0,
    activeVendors: 0,
    pendingApproval: 0,
    verifiedVendors: 0,
    newVendorsThisMonth: 0,
  },
  orderStats: {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    ordersThisMonth: 0,
  },
  revenueStats: {
    totalRevenue: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    platformFees: 0,
    pendingPayouts: 0,
  },
  bidStats: {
    totalBidRequests: 0,
    activeBidRequests: 0,
    acceptedBids: 0,
    expiredBids: 0,
  },
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      // Deep merge received data with defaults to handle missing fields
      setStats(mergeStats(defaultStats, data));
    } catch (error) {
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-orange-500 rounded-2xl flex items-center justify-center animate-pulse shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Overview of your platform statistics and performance</p>
        </div>
      </div>

      {/* User & Vendor Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="Total Users"
          value={stats.userStats.totalUsers.toLocaleString()}
          icon={Users}
          color="from-orange-500 to-orange-600"
          change={`+${stats.userStats.newUsersToday} today`}
          changeType="increase"
        />
        <StatCard
          title="Active Users"
          value={stats.userStats.activeUsers.toLocaleString()}
          icon={CheckCircle}
          color="from-orange-400 to-orange-500"
          change={`+${stats.userStats.newUsersThisMonth} this month`}
          changeType="increase"
        />
        <StatCard
          title="Total Vendors"
          value={stats.vendorStats.totalVendors.toLocaleString()}
          icon={Store}
          color="from-orange-600 to-orange-700"
          change={`${stats.vendorStats.pendingApproval} pending`}
          changeType="neutral"
        />
        <StatCard
          title="Active Vendors"
          value={stats.vendorStats.activeVendors.toLocaleString()}
          icon={TrendingUp}
          color="from-orange-500 to-orange-600"
          change={`${stats.vendorStats.verifiedVendors} verified`}
          changeType="increase"
        />
      </div>

      {/* Order & Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="Total Orders"
          value={stats.orderStats.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="from-orange-500 to-orange-600"
          change={`${stats.orderStats.ordersToday} today`}
          changeType="increase"
        />
        <StatCard
          title="Pending Orders"
          value={stats.orderStats.pendingOrders.toLocaleString()}
          icon={Clock}
          color="from-orange-400 to-orange-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenueStats.totalRevenue)}
          icon={DollarSign}
          color="from-orange-600 to-orange-700"
          change={`${formatCurrency(stats.revenueStats.revenueToday)} today`}
          changeType="increase"
        />
        <StatCard
          title="Active Bid Requests"
          value={stats.bidStats.activeBidRequests.toLocaleString()}
          icon={MessageSquare}
          color="from-orange-500 to-orange-600"
          change={`${stats.bidStats.totalBidRequests.toLocaleString()} total`}
          changeType="neutral"
        />
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Order Status</h3>
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">Completed</span>
                <span className="text-3xl font-bold text-green-600">{stats.orderStats.completedOrders.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full" style={{ width: `${stats.orderStats.totalOrders > 0 ? (stats.orderStats.completedOrders / stats.orderStats.totalOrders) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">Pending</span>
                <span className="text-3xl font-bold text-orange-600">{stats.orderStats.pendingOrders.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full" style={{ width: `${stats.orderStats.totalOrders > 0 ? (stats.orderStats.pendingOrders / stats.orderStats.totalOrders) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">Cancelled</span>
                <span className="text-3xl font-bold text-red-600">{stats.orderStats.cancelledOrders.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full" style={{ width: `${stats.orderStats.totalOrders > 0 ? (stats.orderStats.cancelledOrders / stats.orderStats.totalOrders) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Revenue Summary</h3>
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <span className="text-gray-700 font-medium text-sm">This Week</span>
              <span className="text-sm font-bold text-orange-700">{formatCurrency(stats.revenueStats.revenueThisWeek)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium text-sm">This Month</span>
              <span className="text-sm font-bold text-gray-700">{formatCurrency(stats.revenueStats.revenueThisMonth)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50/50 rounded-xl">
              <span className="text-gray-700 font-medium text-sm">Platform Fees</span>
              <span className="text-sm font-bold text-orange-600">{formatCurrency(stats.revenueStats.platformFees)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium text-sm">Pending Payouts</span>
              <span className="text-sm font-bold text-gray-700">{formatCurrency(stats.revenueStats.pendingPayouts)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-5">Bid Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-orange-600">{stats.bidStats.totalBidRequests.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">Total Requests</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-orange-500">{stats.bidStats.activeBidRequests.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">Active Requests</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{stats.bidStats.acceptedBids.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">Accepted Bids</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-600">{stats.bidStats.expiredBids.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">Expired Bids</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
