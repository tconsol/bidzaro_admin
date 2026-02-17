// Support Module Types for webid-admin

export type TicketCategory = 
  | 'ORDER_ISSUE' 
  | 'PAYMENT' 
  | 'ACCOUNT' 
  | 'TECHNICAL' 
  | 'GENERAL' 
  | 'VENDOR_ISSUE';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 
  | 'OPEN' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'WAITING_FOR_CUSTOMER' 
  | 'RESOLVED' 
  | 'CLOSED';

export type MessageType = 'TEXT' | 'ATTACHMENT' | 'SYSTEM';

// Ticket Types
export interface Ticket {
  ticketId: string;
  ticketNumber: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  subject: string;
  description: string;
  orderId?: string;
  vendorId?: string;
  paymentId?: string;
  attachmentUrls?: string[];
  assignedTo?: string;
  resolutionNotes?: string;
  rating?: number;
  feedback?: string;
  conversationId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketListItem {
  ticketId: string;
  ticketNumber: string;
  status: TicketStatus;
  subject: string;
  priority: TicketPriority;
  conversationId?: string;
  createdAt: string;
}

export interface TicketsResponse {
  success: boolean;
  data: TicketListItem[];
  pageInfo?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface TicketResponse {
  success: boolean;
  data: Ticket;
}

// Chat Types
export interface ChatMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  message: string;
  messageType: MessageType;
  attachmentUrl?: string;
  isRead: boolean;
  sentAt: string;
}

export interface Conversation {
  conversationId: string;
  ticketId: string;
  participantIds: string[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  pageInfo?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
