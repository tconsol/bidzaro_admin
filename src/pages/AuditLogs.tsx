import React, { useEffect, useState } from 'react';
import { auditLogApi } from '../services/api';
import type { AuditLog, PageInfo } from '../types';
import DataTable from '../components/DataTable';
import CustomSelect from '../components/CustomSelect';
import { FileText, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });

  useEffect(() => { loadLogs(); }, [currentPage, actionFilter, entityTypeFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogApi.getLogs({
        page: currentPage,
        size: pageSize,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
      });
      setLogs(response.data);
      setPageInfo(response.pageInfo);
    } catch (error) { }
    finally { setLoading(false); }
  };

  const applyQuickFilter = (action: string, entityType?: string) => {
    setActionFilter(action);
    setEntityTypeFilter(entityType || '');
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setActionFilter('');
    setEntityTypeFilter('');
    setCurrentPage(0);
  };

  const columns = [
    {
      key: 'timestamp', header: 'Timestamp',
      render: (log: AuditLog) => (
        <div>
          <p className="font-semibold text-sm">{new Date(log.timestamp).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'action', header: 'Action',
      render: (log: AuditLog) => {
        const actionColors: Record<string, string> = {
          'APPROVE': 'bg-green-100 text-green-800',
          'REJECT': 'bg-red-100 text-red-800',
          'SUSPEND': 'bg-red-100 text-red-800',
          'ACTIVATE': 'bg-emerald-100 text-emerald-800',
          'CREATE': 'bg-blue-100 text-blue-800',
          'UPDATE': 'bg-amber-100 text-amber-800',
          'DELETE': 'bg-rose-100 text-rose-800',
          'UNLOCK': 'bg-purple-100 text-purple-800',
          'PROCESS': 'bg-cyan-100 text-cyan-800',
          'REFUND': 'bg-indigo-100 text-indigo-800',
        };
        const colors = actionColors[log.action] || 'bg-gray-100 text-gray-800';
        return <span className={`px-3 py-1 ${colors} rounded-full text-xs font-semibold`}>{log.action || 'Unknown'}</span>;
      },
    },
    {
      key: 'entityType', header: 'Entity Type',
      render: (log: AuditLog) => (
        <div>
          <p className="font-semibold text-gray-900">{log.entityType || 'Unknown'}</p>
          <p className="text-xs text-gray-500 font-mono">{log.entityId?.substring(0, 8) || 'N/A'}...</p>
        </div>
      ),
    },
    {
      key: 'performedBy', header: 'Performed By',
      render: (log: AuditLog) => (
        <div>
          <p className="font-semibold text-gray-900">{log.performedByType || 'Unknown'}</p>
          <p className="text-xs text-gray-500 font-mono">{log.performedBy?.substring(0, 8) || 'N/A'}...</p>
        </div>
      ),
    },
    {
      key: 'changes', header: 'Changes',
      render: (log: AuditLog) => {
        if (!log.changes) return <span className="text-gray-400 text-sm">-</span>;
        return (
          <div className="text-sm text-gray-600">
            {Object.entries(log.changes).map(([key, value]) => (
              <div key={key}><span className="font-semibold">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
            ))}
          </div>
        );
      },
    },
  ];

  if (loading && logs.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-gray-700 to-zinc-800 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3"><FileText className="w-8 h-8" />Audit Logs</h1>
        <p className="text-gray-300 mt-1">Total: {pageInfo.totalElements} entries across {pageInfo.totalPages} page{pageInfo.totalPages !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {(actionFilter || entityTypeFilter) && (
            <button onClick={clearFilters} className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium">Clear Filters</button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Entity Type</label>
            <CustomSelect
              value={entityTypeFilter}
              onChange={(val) => { setEntityTypeFilter(val); setCurrentPage(0); }}
              options={[
                { value: '', label: 'All Types' },
                { value: 'USER', label: 'Users' },
                { value: 'VENDOR', label: 'Vendors' },
                { value: 'ORDER', label: 'Orders' },
                { value: 'PAYMENT', label: 'Payments' },
                { value: 'BID', label: 'Bids' },
                { value: 'MENU_ITEM', label: 'Menu Items' },
                { value: 'PLATFORM_CONFIG', label: 'Platform Config' },
                { value: 'SUPPORT_AGENT', label: 'Support Agents' },
                { value: 'ANNOUNCEMENT', label: 'Announcements' },
              ]}
              placeholder="Select entity type"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Action</label>
            <CustomSelect
              value={actionFilter}
              onChange={(val) => { setActionFilter(val); setCurrentPage(0); }}
              options={[
                { value: '', label: 'All Actions' },
                { value: 'APPROVE', label: 'Approve' },
                { value: 'REJECT', label: 'Reject' },
                { value: 'SUSPEND', label: 'Suspend' },
                { value: 'ACTIVATE', label: 'Activate' },
                { value: 'CREATE', label: 'Create' },
                { value: 'UPDATE', label: 'Update' },
                { value: 'DELETE', label: 'Delete' },
                { value: 'UNLOCK', label: 'Unlock' },
                { value: 'PROCESS', label: 'Process' },
                { value: 'REFUND', label: 'Refund' },
              ]}
              placeholder="Select action"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3">Quick Filters</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => applyQuickFilter('APPROVE', 'VENDOR')}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Vendor Approvals</button>
            <button onClick={() => applyQuickFilter('SUSPEND', 'USER')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">User Suspensions</button>
            <button onClick={() => applyQuickFilter('', 'VENDOR')}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">All Vendor Actions</button>
            <button onClick={() => applyQuickFilter('', 'PLATFORM_CONFIG')}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200">Platform Changes</button>
            <button onClick={() => applyQuickFilter('REJECT', '')}
              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200">All Rejections</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <DataTable data={logs} columns={columns} />
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
    </div>
  );
};

export default AuditLogs;
