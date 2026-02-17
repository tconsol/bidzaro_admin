import axios from 'axios';
import type {
  TicketStatus,
  TicketsResponse,
  TicketResponse,
} from '../types/support';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

function getAuthToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
}

const supportAdminApi = {
  /**
   * Get all open tickets (for admins/agents)
   */
  async getAllOpenTickets(page = 0, size = 20): Promise<TicketsResponse> {
    try {
      const response = await axios.get<TicketsResponse>(
        `${API_BASE_URL}/support/admin/tickets`,
        {
          params: { page, size },
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch open tickets:', error);
      throw error;
    }
  },

  /**
   * Get my assigned tickets (for agents)
   */
  async getMyAssignedTickets(): Promise<TicketsResponse> {
    try {
      const response = await axios.get<TicketsResponse>(
        `${API_BASE_URL}/support/admin/my-tickets`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch my assigned tickets:', error);
      throw error;
    }
  },

  /**
   * Get resolved tickets
   */
  async getResolvedTickets(page = 0, size = 20): Promise<TicketsResponse> {
    try {
      const response = await axios.get<TicketsResponse>(
        `${API_BASE_URL}/support/admin/tickets/resolved`,
        {
          params: { page, size },
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch resolved tickets:', error);
      throw error;
    }
  },

  /**
   * Get ticket details
   */
  async getTicketDetails(ticketId: string): Promise<TicketResponse> {
    try {
      const response = await axios.get<TicketResponse>(
        `${API_BASE_URL}/support/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      throw error;
    }
  },

  /**
   * Assign ticket to an agent
   */
  async assignTicket(ticketId: string, agentId: string): Promise<TicketResponse> {
    try {
      const response = await axios.post<TicketResponse>(
        `${API_BASE_URL}/support/admin/tickets/${ticketId}/assign`,
        null,
        {
          params: { agentId },
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      throw error;
    }
  },

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<TicketResponse> {
    try {
      const response = await axios.patch<TicketResponse>(
        `${API_BASE_URL}/support/admin/tickets/${ticketId}/status`,
        null,
        {
          params: { status },
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      throw error;
    }
  },

  /**
   * Resolve ticket
   */
  async resolveTicket(ticketId: string, resolutionNotes: string): Promise<TicketResponse> {
    try {
      const response = await axios.post<TicketResponse>(
        `${API_BASE_URL}/support/admin/tickets/${ticketId}/resolve`,
        null,
        {
          params: { resolutionNotes },
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      throw error;
    }
  },
};

export default supportAdminApi;
