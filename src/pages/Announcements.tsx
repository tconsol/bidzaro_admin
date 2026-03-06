import React, { useEffect, useState } from 'react';
import { announcementApi } from '../services/api';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest, PageInfo } from '../types';
import { useToast } from '../hooks/useToast';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { Megaphone, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Power } from 'lucide-react';

const Announcements: React.FC = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAnnouncementRequest>({
    title: '',
    message: '',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [editForm, setEditForm] = useState<UpdateAnnouncementRequest>({
    title: '',
    message: '',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    startDate: '',
    endDate: '',
  });

  useEffect(() => { loadAnnouncements(); }, [currentPage]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementApi.getAll({ page: currentPage, size: pageSize });
      setAnnouncements(response.data);
      setPageInfo(response.pageInfo);
    } catch (error) { }
    finally { setLoading(false); }
  };

  // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO-8601 UTC (YYYY-MM-DDTHH:mm:ssZ)
  const formatDateToUTC = (dateString: string): string => {
    if (!dateString) return '';
    // datetime-local input gives "2026-03-20T14:37", we need "2026-03-20T14:37:00Z"
    return `${dateString}:00Z`;
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const data = {
        ...form,
        startDate: form.startDate ? formatDateToUTC(form.startDate) : undefined,
        endDate: form.endDate ? formatDateToUTC(form.endDate) : undefined,
      };
      await announcementApi.create(data as CreateAnnouncementRequest);
      setShowCreateModal(false);
      setForm({
        title: '',
        message: '',
        priority: 'NORMAL',
        targetAudience: 'ALL',
        startDate: '',
        endDate: '',
        isActive: true,
      });
      loadAnnouncements();
    } catch (error: any) { showToast(error.response?.data?.message || 'Failed to create announcement', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleOpenView = async (announcement: Announcement) => {
    try {
      const fullAnnouncement = await announcementApi.getById(announcement.announcementId);
      setSelectedAnnouncement(fullAnnouncement);
      setShowViewModal(true);
    } catch (error) { showToast('Failed to load announcement details', 'error'); }
  };

  const handleOpenEdit = async (announcement: Announcement) => {
    try {
      const fullAnnouncement = await announcementApi.getById(announcement.announcementId);
      setSelectedAnnouncement(fullAnnouncement);
      // Convert ISO date to datetime-local format (remove Z and :00)
      const startDate = fullAnnouncement.startDate ? fullAnnouncement.startDate.slice(0, 16) : '';
      const endDate = fullAnnouncement.endDate ? fullAnnouncement.endDate.slice(0, 16) : '';
      setEditForm({
        title: fullAnnouncement.title,
        message: fullAnnouncement.message,
        priority: fullAnnouncement.priority,
        targetAudience: fullAnnouncement.targetAudience,
        startDate,
        endDate,
      });
      setShowEditModal(true);
    } catch (error) { showToast('Failed to load announcement details', 'error'); }
  };

  const handleUpdate = async () => {
    if (!selectedAnnouncement) return;
    setSubmitting(true);
    try {
      const data = {
        ...editForm,
        startDate: editForm.startDate ? formatDateToUTC(editForm.startDate) : undefined,
        endDate: editForm.endDate ? formatDateToUTC(editForm.endDate) : undefined,
      };
      await announcementApi.update(selectedAnnouncement.announcementId, data);
      setShowEditModal(false);
      setSelectedAnnouncement(null);
      loadAnnouncements();
    } catch (error: any) { showToast(error.response?.data?.message || 'Failed to update announcement', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    setSubmitting(true);
    try {
      await announcementApi.delete(selectedAnnouncement.announcementId);
      setShowDeleteConfirm(false);
      setSelectedAnnouncement(null);
      loadAnnouncements();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete announcement', 'error');
    }
    finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (announcement: Announcement) => {
    setTogglingId(announcement.announcementId);
    try {
      const newStatus = !(announcement.isActive ?? true);
      await announcementApi.changeStatus(announcement.announcementId, newStatus);
      loadAnnouncements();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to change announcement status', 'error');
    }
    finally { setTogglingId(null); }
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-orange-100 text-orange-800',
    NORMAL: 'bg-green-100 text-green-800',
    HIGH: 'bg-yellow-100 text-yellow-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-gray-100 text-gray-800',
  };

  const columns = [
    {
      key: 'title', header: 'Title',
      render: (a: Announcement) => (
        <div>
          <p className="font-semibold text-gray-900">{a.title}</p>
          <p className="text-sm text-gray-500 line-clamp-1">{a.message}</p>
        </div>
      ),
    },
    {
      key: 'priority', header: 'Priority',
      render: (a: Announcement) => <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[a.priority] || 'bg-gray-100 text-gray-800'}`}>{a.priority}</span>,
    },
    {
      key: 'audience', header: 'Audience',
      render: (a: Announcement) => <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">{a.targetAudience}</span>,
    },
    {
      key: 'isActive', header: 'Status',
      render: (a: Announcement) => {
        const isActive = a.isActive ?? true;
        const statusKey = isActive ? 'active' : 'inactive';
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[statusKey]}`}>{isActive ? 'Active' : 'Inactive'}</span>;
      },
    },
    {
      key: 'startDate', header: 'Date Range',
      render: (a: Announcement) => {
        const start = a.startDate ? new Date(a.startDate).toLocaleDateString() : '—';
        const end = a.endDate ? new Date(a.endDate).toLocaleDateString() : '—';
        return <span className="text-sm text-gray-600">{start} to {end}</span>;
      },
    },
    {
      key: 'createdAt', header: 'Created',
      render: (a: Announcement) => new Date(a.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions', header: 'Actions',
      render: (a: Announcement) => {
        const isToggling = togglingId === a.announcementId;
        const isActive = a.isActive ?? true;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleToggleStatus(a)}
              disabled={isToggling}
              className={`p-2 transition rounded-lg ${
                isActive
                  ? 'text-orange-600 hover:bg-orange-50'
                  : 'text-green-600 hover:bg-green-50'
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={`Click to ${isActive ? 'deactivate' : 'activate'}`}
            >
              <Power className={`w-4 h-4 ${isToggling ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => handleOpenView(a)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="View details">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => handleOpenEdit(a)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Edit">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => { setSelectedAnnouncement(a); setShowDeleteConfirm(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (loading && announcements.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-orange-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Megaphone className="w-8 h-8" />Announcements</h1>
            <p className="text-orange-100 mt-1">Total: {pageInfo.totalElements} announcements</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 hover:bg-white/30">
            <Plus className="w-5 h-5" />New Announcement
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <DataTable data={announcements} columns={columns} />
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

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Announcement">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span> ({form.title.length}/200)</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 200) })}
              className={`w-full px-4 py-2 border ${form.title.length < 5 ? 'border-red-300' : 'border-gray-300'} rounded-xl`}
              placeholder="5-200 characters" maxLength={200} />
            {form.title.length < 5 && form.title.length > 0 && <p className="text-xs text-red-600 mt-1">Minimum 5 characters required</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message <span className="text-red-500">*</span> ({form.message.length}/2000)</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 2000) })}
              className={`w-full px-4 py-2 border ${form.message.length < 10 ? 'border-red-300' : 'border-gray-300'} rounded-xl`}
              rows={4} placeholder="10-2000 characters" maxLength={2000} />
            {form.message.length < 10 && form.message.length > 0 && <p className="text-xs text-red-600 mt-1">Minimum 10 characters required</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
              <CustomSelect
                value={form.priority || 'NORMAL'}
                onChange={(val) => setForm({ ...form, priority: val as any })}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'NORMAL', label: 'Normal' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
                placeholder="Select priority"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audience</label>
              <CustomSelect
                value={form.targetAudience || 'ALL'}
                onChange={(val) => setForm({ ...form, targetAudience: val as any })}
                options={[
                  { value: 'ALL', label: 'All' },
                  { value: 'USERS', label: 'Users Only' },
                  { value: 'VENDORS', label: 'Vendors Only' },
                  { value: 'SUPPORT_AGENTS', label: 'Support Agents' },
                  { value: 'ADMINS', label: 'Admins Only' },
                ]}
                placeholder="Select audience"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date (optional)</label>
              <input type="datetime-local" value={form.startDate || ''}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
              <p className="text-xs text-gray-500 mt-1">Sent as ISO-8601 UTC (YYYY-MM-DDTHH:mm:ssZ)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date (optional)</label>
              <input type="datetime-local" value={form.endDate || ''}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
              <p className="text-xs text-gray-500 mt-1">Sent as ISO-8601 UTC (YYYY-MM-DDTHH:mm:ssZ)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={submitting || form.title.length < 5 || form.message.length < 10}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Creating...' : 'Create Announcement'}
            </button>
            <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Announcement Details">
        {selectedAnnouncement && (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedAnnouncement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedAnnouncement.message}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Priority</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[selectedAnnouncement.priority] || 'bg-gray-100 text-gray-800'}`}>
                  {selectedAnnouncement.priority}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedAnnouncement.isActive ? 'active' : 'inactive']}`}>
                  {selectedAnnouncement.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Target Audience</p>
                <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                  {selectedAnnouncement.targetAudience}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Created By</p>
                <p className="text-sm text-gray-700 mt-1">{selectedAnnouncement.createdByName || selectedAnnouncement.createdBy}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Start Date</p>
                <p className="text-sm text-gray-700 mt-1">{selectedAnnouncement.startDate ? new Date(selectedAnnouncement.startDate).toLocaleString() : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">End Date</p>
                <p className="text-sm text-gray-700 mt-1">{selectedAnnouncement.endDate ? new Date(selectedAnnouncement.endDate).toLocaleString() : '—'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowViewModal(false); handleOpenEdit(selectedAnnouncement); }} 
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600">
                Edit
              </button>
              <button onClick={() => setShowViewModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Announcement">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span> ({editForm.title?.length || 0}/200)</label>
            <input type="text" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value.slice(0, 200) })}
              className={`w-full px-4 py-2 border ${(editForm.title?.length || 0) < 5 ? 'border-red-300' : 'border-gray-300'} rounded-xl`}
              placeholder="5-200 characters" maxLength={200} />
            {(editForm.title?.length || 0) < 5 && (editForm.title?.length || 0) > 0 && <p className="text-xs text-red-600 mt-1">Minimum 5 characters required</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message <span className="text-red-500">*</span> ({editForm.message?.length || 0}/2000)</label>
            <textarea value={editForm.message || ''} onChange={(e) => setEditForm({ ...editForm, message: e.target.value.slice(0, 2000) })}
              className={`w-full px-4 py-2 border ${(editForm.message?.length || 0) < 10 ? 'border-red-300' : 'border-gray-300'} rounded-xl`}
              rows={4} placeholder="10-2000 characters" maxLength={2000} />
            {(editForm.message?.length || 0) < 10 && (editForm.message?.length || 0) > 0 && <p className="text-xs text-red-600 mt-1">Minimum 10 characters required</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
              <CustomSelect
                value={editForm.priority || 'NORMAL'}
                onChange={(val) => setEditForm({ ...editForm, priority: val as any })}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'NORMAL', label: 'Normal' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
                placeholder="Select priority"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audience</label>
              <CustomSelect
                value={editForm.targetAudience || 'ALL'}
                onChange={(val) => setEditForm({ ...editForm, targetAudience: val as any })}
                options={[
                  { value: 'ALL', label: 'All' },
                  { value: 'USERS', label: 'Users Only' },
                  { value: 'VENDORS', label: 'Vendors Only' },
                  { value: 'SUPPORT_AGENTS', label: 'Support Agents' },
                  { value: 'ADMINS', label: 'Admins Only' },
                ]}
                placeholder="Select audience"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date (optional)</label>
              <input type="datetime-local" value={editForm.startDate || ''}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
              <p className="text-xs text-gray-500 mt-1">Sent as ISO-8601 UTC (YYYY-MM-DDTHH:mm:ssZ)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date (optional)</label>
              <input type="datetime-local" value={editForm.endDate || ''}
                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
              <p className="text-xs text-gray-500 mt-1">Sent as ISO-8601 UTC (YYYY-MM-DDTHH:mm:ssZ)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input type="checkbox" id="edit-isActive" checked={editForm.isActive !== false}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            <label htmlFor="edit-isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
              Active — announcement is currently published
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleUpdate} disabled={submitting || (editForm.title?.length || 0) < 5 || (editForm.message?.length || 0) < 10}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Updating...' : 'Update Announcement'}
            </button>
            <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Announcement">
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete this announcement?</p>
          {selectedAnnouncement && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{selectedAnnouncement.title}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedAnnouncement.message}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={submitting}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Announcements;



