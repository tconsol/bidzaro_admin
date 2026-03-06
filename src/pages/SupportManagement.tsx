import { useEffect, useState } from 'react';
import { Ticket, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { TicketListItem, Ticket as TicketType } from '../types/support';
import supportAdminApi from '../lib/supportAdminApi';

interface SupportManagementProps {
  className?: string;
}

export default function SupportManagement({ className = '' }: SupportManagementProps) {
  const [allTickets, setAllTickets] = useState<TicketListItem[]>([]);
  const [myAssignedTickets, setMyAssignedTickets] = useState<TicketListItem[]>([]);
  const [resolvedTickets, setResolvedTickets] = useState<TicketListItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'resolved'>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [allRes, assignedRes, resolvedRes] = await Promise.all([
        supportAdminApi.getAllOpenTickets(0, 50),
        supportAdminApi.getMyAssignedTickets(),
        supportAdminApi.getResolvedTickets(0, 50),
      ]);

      setAllTickets(allRes.data || []);
      setMyAssignedTickets(assignedRes.data || []);
      setResolvedTickets(resolvedRes.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = async (ticketId: string) => {
    try {
      const response = await supportAdminApi.getTicketDetails(ticketId);
      setSelectedTicket(response.data);
      setResolutionNotes(response.data.resolutionNotes || '');
      setIsModalOpen(true);
    } catch (error) {
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket || !resolutionNotes.trim()) {
      alert('Please enter resolution notes');
      return;
    }

    setActionLoading(true);
    try {
      await supportAdminApi.resolveTicket(selectedTicket.ticketId, resolutionNotes);
      alert('Ticket resolved successfully!');
      setIsModalOpen(false);
      setSelectedTicket(null);
      await loadTickets();
    } catch (error) {
      alert('Failed to resolve ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedTicket) return;

    setActionLoading(true);
    try {
      await supportAdminApi.updateTicketStatus(selectedTicket.ticketId, status as any);
      alert('Ticket updated successfully!');
      await loadTickets();
      const updated = await supportAdminApi.getTicketDetails(selectedTicket.ticketId);
      setSelectedTicket(updated.data);
    } catch (error) {
      alert('Failed to update ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-orange-100 text-orange-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all':
        return <AlertCircle className="h-4 w-4" />;
      case 'assigned':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const ticketList =
    activeTab === 'all'
      ? allTickets
      : activeTab === 'assigned'
        ? myAssignedTickets
        : resolvedTickets;

  return (
    <div className={`min-h-screen bg-gray-50 p-4 md:p-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Ticket Management</h1>
          <p className="text-gray-600">
            Manage customer support tickets, chat with customers, and resolve issues.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{allTickets.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{myAssignedTickets.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{resolvedTickets.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {[
            { id: 'all', label: 'All Open', count: allTickets.length },
            { id: 'assigned', label: 'My Assigned', count: myAssignedTickets.length },
            { id: 'resolved', label: 'Resolved', count: resolvedTickets.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTabIcon(tab.id)}
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : ticketList.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets</h3>
            <p className="text-gray-600">
              {activeTab === 'all'
                ? 'No open tickets at the moment.'
                : activeTab === 'assigned'
                  ? 'No tickets assigned to you.'
                  : 'No resolved tickets yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {ticketList.map((ticket) => (
              <div
                key={ticket.ticketId}
                onClick={() => handleTicketClick(ticket.ticketId)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-400 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Ticket className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{ticket.subject}</h3>
                      <p className="text-sm text-gray-500">{ticket.ticketNumber}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${getStatusColor(ticket.status)}`}
                  >
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {ticket.conversationId && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      Chat available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTicket.ticketNumber}</h2>
                <p className="text-gray-600 mt-1">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTicket.status)}`}
                >
                  {selectedTicket.status.replace(/_/g, ' ')}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedTicket.priority)} border-current`}
                >
                  {selectedTicket.priority}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-700">Created</p>
                  <p className="text-gray-600">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                </div>
                {selectedTicket.orderId && (
                  <div>
                    <p className="font-semibold text-gray-700">Order ID</p>
                    <p className="text-gray-600">{selectedTicket.orderId}</p>
                  </div>
                )}
              </div>

              {/* Agent Actions */}
              {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Agent Actions</h3>

                  <div className="flex gap-2 mb-4">
                    {selectedTicket.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusUpdate('IN_PROGRESS')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
                      >
                        Start Progress
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate('WAITING_FOR_CUSTOMER')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
                    >
                      Wait for Customer
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Resolution Notes</label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={4}
                    />
                    <button
                      onClick={handleResolve}
                      disabled={actionLoading || !resolutionNotes.trim()}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      {actionLoading ? 'Resolving...' : 'Mark as Resolved'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



