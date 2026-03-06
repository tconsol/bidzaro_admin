import axios from 'axios';
import type {
  AdminLoginDto,
  AdminRegistrationDto,
  AuthResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
  DashboardStats,
  User,
  Vendor,
  Order,
  BidRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  MenuItem,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  PromoCode,
  CreatePromoRequest,
  SupportTicket,
  PlatformConfig,
  UpdatePlatformConfigRequest,
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AuditLog,
  RefundResponse,
  AnalyticsOverview,
  PageInfo,
} from '../types';

// Use VITE_API_BASE_URL when provided; otherwise use relative paths so Vite dev proxy can forward requests.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ==================== Token Refresh Queue ====================

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        const { accessToken: newAccessToken } = response.data;
        localStorage.setItem('accessToken', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== Helper — unwrap { success, data } responses ====================

const unwrap = <T>(res: any): T => {
  const payload = res.data;
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data;
  return payload;
};

const unwrapPaginated = <T>(res: any): { data: T[]; pageInfo: PageInfo } => {
  const payload = res.data;
  return {
    data: payload.data || [],
    pageInfo: payload.pageInfo || { pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 },
  };
};

// ==================== Helper — remove undefined values from params ====================

const cleanParams = (params?: Record<string, any>): Record<string, any> | undefined => {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
  );
};

// ==================== Admin Authentication ====================

export const adminApi = {
  login: (data: AdminLoginDto): Promise<AuthResponse> =>
    api.post('/api/v1/auth/login', data).then(res => unwrap<AuthResponse>(res)),

  register: (data: AdminRegistrationDto): Promise<AuthResponse> =>
    api.post('/api/v1/auth/register', data).then(res => unwrap<AuthResponse>(res)),

  forgotPassword: (data: ForgotPasswordDto): Promise<{ message: string }> =>
    api.post('/api/v1/auth/forgot-password', data).then(res => unwrap<{ message: string }>(res)),

  resetPassword: (data: ResetPasswordDto): Promise<{ message: string }> =>
    api.post('/api/v1/auth/reset-password', data).then(res => unwrap<{ message: string }>(res)),

  recoverEmail: (phone: string): Promise<{ email: string }> =>
    api.get(`/api/v1/auth/recover/forgot-email?phone=${phone}`).then(res => unwrap<{ email: string }>(res)),

  recoverPhone: (email: string): Promise<{ phone: string }> =>
    api.get(`/api/v1/auth/recover/forgot-phone?email=${email}`).then(res => unwrap<{ phone: string }>(res)),

  refreshToken: (refreshToken: string): Promise<{ accessToken: string }> =>
    api.post('/api/v1/auth/refresh', { refreshToken }).then(res => unwrap<{ accessToken: string }>(res)),
};

// ==================== Dashboard ====================

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    api.get('/api/v1/admin/dashboard').then(res => unwrap<DashboardStats>(res)),

  // Platform analytics overview
  getAnalyticsOverview: (): Promise<any> =>
    api.get('/api/v1/admin/analytics/overview').then(res => unwrap<any>(res)),
};

// ==================== Generic Admin Entity Actions (3 Universal Endpoints) ====================

type EntityType = 'users' | 'vendors' | 'agents';

export const adminEntityApi = {
  // Generic suspend endpoint: PATCH /admin/{entityType}/{entityId}/suspend?reason=...
  suspend: (entityType: EntityType, entityId: string, reason?: string): Promise<any> =>
    api.patch(`/api/v1/admin/${entityType}/${entityId}/suspend`, {}, { 
      params: cleanParams({ reason }) 
    }).then(res => unwrap<any>(res)),

  // Generic activate endpoint: PATCH /admin/{entityType}/{entityId}/activate
  activate: (entityType: EntityType, entityId: string): Promise<any> =>
    api.patch(`/api/v1/admin/${entityType}/${entityId}/activate`, {}).then(res => unwrap<any>(res)),

  // Generic unlock endpoint: PATCH /admin/{entityType}/{entityId}/unlock
  unlock: (entityType: EntityType, entityId: string): Promise<any> =>
    api.patch(`/api/v1/admin/${entityType}/${entityId}/unlock`, {}).then(res => unwrap<any>(res)),
};

// ==================== User Management ====================

export const userApi = {
  getAllUsers: (params?: {
    page?: number;
    size?: number;
    status?: string;
    userType?: string;
    search?: string;
  }): Promise<{ data: User[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/users', { params: cleanParams(params) }).then(res => unwrapPaginated<User>(res)),

  getUserById: (userId: string): Promise<User> =>
    api.get(`/api/v1/admin/users/${userId}`).then(res => unwrap<User>(res)),

  // Update user status - supports ACTIVE, SUSPENDED, DELETED
  updateUserStatus: (userId: string, status: string, reason?: string): Promise<User> =>
    api.put(`/api/v1/admin/users/${userId}/status`, { status, reason }).then(res => unwrap<User>(res)),

  // Delete user (soft delete)
  deleteUser: (userId: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/api/v1/admin/users/${userId}`).then(res => unwrap<{ success: boolean; message: string }>(res)),

  // Search users
  searchUsers: (params?: { query?: string; page?: number; size?: number }): Promise<{ data: User[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/users/search', { params: cleanParams(params) }).then(res => unwrapPaginated<User>(res)),

  // Legacy wrappers for backward compatibility - route to generic endpoints
  suspendUser: (userId: string, reason: string): Promise<User> =>
    adminEntityApi.suspend('users', userId, reason).then(res => res as User),

  activateUser: (userId: string): Promise<User> =>
    adminEntityApi.activate('users', userId).then(res => res as User),

  unlockUser: (userId: string): Promise<User> =>
    adminEntityApi.unlock('users', userId).then(res => res as User),
};

// ==================== Vendor Management ====================

export const vendorApi = {
  getAllVendors: (params?: {
    page?: number;
    size?: number;
    approvalStatus?: string;
    status?: string;
    country?: string;
    search?: string;
  }): Promise<{ data: Vendor[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/vendors', { params: cleanParams(params) }).then(res => unwrapPaginated<Vendor>(res)),

  getVendorById: (vendorId: string): Promise<Vendor> =>
    api.get(`/api/v1/admin/vendors/${vendorId}`).then(res => unwrap<Vendor>(res)),

  approveVendor: (vendorId: string, notes?: string): Promise<Vendor> =>
    api.put(`/api/v1/admin/vendors/${vendorId}/approve`, { notes }).then(res => unwrap<Vendor>(res)),

  rejectVendor: (vendorId: string, reason: string): Promise<Vendor> =>
    api.put(`/api/v1/admin/vendors/${vendorId}/reject`, { reason }).then(res => unwrap<Vendor>(res)),

  suspendVendor: (vendorId: string, reason: string): Promise<Vendor> =>
    api.put(`/api/v1/admin/vendors/${vendorId}/suspend`, { reason }).then(res => unwrap<Vendor>(res)),

  reactivateVendor: (vendorId: string): Promise<Vendor> =>
    api.put(`/api/v1/admin/vendors/${vendorId}/reactivate`, {}).then(res => unwrap<Vendor>(res)),

  // Verify vendor document
  verifyDocument: (vendorId: string, documentId: string, status: string, notes?: string): Promise<any> =>
    api.put(`/api/v1/admin/vendors/${vendorId}/documents/${documentId}/verify`, { status, notes }).then(res => unwrap(res)),

  // Toggle featured vendor
  toggleFeatured: (vendorId: string, featured: boolean): Promise<Vendor> =>
    api.put(`/api/v1/admin/vendors/${vendorId}/featured`, { featured }).then(res => unwrap<Vendor>(res)),

  // Legacy wrappers for backward compatibility - route to generic endpoints
  activateVendor: (vendorId: string): Promise<Vendor> =>
    adminEntityApi.activate('vendors', vendorId).then(res => res as Vendor),

  unlockVendor: (vendorId: string): Promise<Vendor> =>
    adminEntityApi.unlock('vendors', vendorId).then(res => res as Vendor),
};

// ==================== Agent Management ====================

export const agentApi = {
  // Create a support agent
  createAgent: (data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
    country?: string;
  }): Promise<User> =>
    api.post('/api/v1/admin/support-agents', data).then(res => unwrap<User>(res)),

  // Get all support agents with pagination
  getAllAgents: (params?: { page?: number; size?: number; status?: string; sortBy?: string; sortDir?: string }): Promise<{ data: User[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/support-agents', { params: cleanParams(params) }).then(res => unwrapPaginated<User>(res)),

  // Get support agent details
  getAgent: (agentId: string): Promise<User> =>
    api.get(`/api/v1/admin/support-agents/${agentId}`).then(res => unwrap<User>(res)),

  // Update support agent
  updateAgent: (agentId: string, data: Partial<User>): Promise<User> =>
    api.put(`/api/v1/admin/support-agents/${agentId}`, data).then(res => unwrap<User>(res)),

  // Get agent workload statistics
  getAgentWorkload: (agentId: string): Promise<any> =>
    api.get(`/api/v1/admin/support-agents/${agentId}/workload`).then(res => unwrap(res)),

  // Assign ticket to agent
  assignTicket: (ticketId: string, agentId: string): Promise<any> =>
    api.put(`/api/v1/admin/support/tickets/${ticketId}/assign`, { agentId }).then(res => unwrap(res)),

  // Generic actions using 'agents' entity type
  suspendAgent: (agentId: string, reason: string): Promise<any> =>
    adminEntityApi.suspend('agents', agentId, reason),

  activateAgent: (agentId: string): Promise<any> =>
    adminEntityApi.activate('agents', agentId),

  unlockAgent: (agentId: string): Promise<any> =>
    adminEntityApi.unlock('agents', agentId),

  // Legacy wrapper for backward compatibility
  createAgentLegacy: (data: AdminRegistrationDto): Promise<User> =>
    api.post('/api/v1/admin/users/create-agent', data).then(res => unwrap<User>(res)),
};

// ==================== Order Management ====================

export const orderApi = {
  getAllOrders: (params?: {
    page?: number;
    size?: number;
    status?: string;
    vendorId?: string;
    userId?: string;
  }): Promise<{ data: Order[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/orders', { params: cleanParams(params) }).then(res => unwrapPaginated<Order>(res)),

  getOrderById: (orderId: string): Promise<Order> =>
    api.get(`/api/v1/admin/orders/${orderId}`).then(res => unwrap<Order>(res)),

  updateOrderStatus: (orderId: string, status: string, reason?: string): Promise<Order> =>
    api.put(`/api/v1/admin/orders/${orderId}/status`, { status, reason }).then(res => unwrap<Order>(res)),

  // Legacy method name
  overrideOrderStatus: (orderId: string, status: string, reason: string): Promise<Order> =>
    orderApi.updateOrderStatus(orderId, status, reason),
};

// ==================== Bid Management ====================

export const bidApi = {
  getAllBids: (params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<{ data: BidRequest[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/bids', { params: cleanParams(params) }).then(res => unwrapPaginated<BidRequest>(res)),
};

// ==================== Menu Management ====================

export const menuApi = {
  // Category endpoints
  getAllCategories: (): Promise<Category[]> =>
    api.get('/api/v1/admin/menu/categories').then(res => {
      const payload = res.data;
      return payload.data ?? payload;
    }),

  getCategoryById: (categoryId: string): Promise<Category> =>
    api.get(`/api/v1/admin/menu/categories/${categoryId}`).then(res => unwrap<Category>(res)),

  createCategory: (data: CreateCategoryRequest): Promise<Category> =>
    api.post('/api/v1/admin/menu/categories', data).then(res => unwrap<Category>(res)),

  updateCategory: (categoryId: string, data: UpdateCategoryRequest): Promise<Category> =>
    api.put(`/api/v1/admin/menu/categories/${categoryId}`, data).then(res => unwrap<Category>(res)),

  deleteCategory: (categoryId: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/api/v1/admin/menu/categories/${categoryId}`).then(res => unwrap<{ success: boolean; message: string }>(res)),

  activateCategory: (categoryId: string): Promise<Category> =>
    api.patch(`/api/v1/admin/menu/categories/${categoryId}/activate`, {}).then(res => unwrap<Category>(res)),

  inactivateCategory: (categoryId: string): Promise<Category> =>
    api.patch(`/api/v1/admin/menu/categories/${categoryId}/inactivate`, {}).then(res => unwrap<Category>(res)),

  // Menu item endpoints
  getAllMenuItems: (): Promise<MenuItem[]> =>
    api.get('/api/v1/admin/menu/items').then(res => {
      const payload = res.data;
      return payload.data || payload;
    }),

  getMenuItemById: (itemId: string): Promise<MenuItem> =>
    api.get(`/api/v1/admin/menu/items/${itemId}`).then(res => unwrap<MenuItem>(res)),

  createMenuItem: (data: CreateMenuItemRequest): Promise<MenuItem> =>
    api.post('/api/v1/admin/menu/items', data).then(res => unwrap<MenuItem>(res)),

  updateMenuItem: (itemId: string, data: UpdateMenuItemRequest): Promise<MenuItem> =>
    api.put(`/api/v1/admin/menu/items/${itemId}`, data).then(res => unwrap<MenuItem>(res)),

  deleteMenuItem: (itemId: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/api/v1/admin/menu/items/${itemId}`).then(res => unwrap<{ success: boolean; message: string }>(res)),

  activateMenuItem: (itemId: string): Promise<MenuItem> =>
    api.patch(`/api/v1/admin/menu/items/${itemId}/activate`, {}).then(res => unwrap<MenuItem>(res)),

  inactivateMenuItem: (itemId: string): Promise<MenuItem> =>
    api.patch(`/api/v1/admin/menu/items/${itemId}/inactivate`, {}).then(res => unwrap<MenuItem>(res)),

  // Review moderation
  moderateReview: (reviewId: string, status: string, notes?: string): Promise<any> =>
    api.put(`/api/v1/admin/reviews/${reviewId}/moderate`, { status, notes }).then(res => unwrap(res)),
};

// ==================== Promo Code Management ====================

export const promoApi = {
  getAllPromos: (params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<{ data: PromoCode[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/promos', { params: cleanParams(params) }).then(res => unwrapPaginated<PromoCode>(res)),

  getPromoById: (promoId: string): Promise<PromoCode> =>
    api.get(`/api/v1/admin/promos/${promoId}`).then(res => unwrap<PromoCode>(res)),

  createPromo: (data: CreatePromoRequest): Promise<PromoCode> =>
    api.post('/api/v1/admin/promos', data).then(res => unwrap<PromoCode>(res)),

  updatePromo: (promoId: string, data: Partial<CreatePromoRequest>): Promise<PromoCode> =>
    api.put(`/api/v1/admin/promos/${promoId}`, data).then(res => unwrap<PromoCode>(res)),

  deactivatePromo: (promoId: string): Promise<PromoCode> =>
    api.put(`/api/v1/admin/promos/${promoId}/deactivate`, {}).then(res => unwrap<PromoCode>(res)),

  deletePromo: (promoId: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/api/v1/admin/promos/${promoId}`).then(res => unwrap<{ success: boolean; message: string }>(res)),
};

// ==================== Support Tickets ====================

export const supportApi = {
  getAllTickets: (params?: {
    page?: number;
    size?: number;
    status?: string;
    priority?: string;
  }): Promise<{ data: SupportTicket[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/support/tickets', { params: cleanParams(params) }).then(res => unwrapPaginated<SupportTicket>(res)),
};

// ==================== Payments / Transactions ====================

export const paymentApi = {
  getAllTransactions: (params?: {
    page?: number;
    size?: number;
    status?: string;
    gateway?: string;
    userId?: string;
    orderId?: string;
  }): Promise<{ data: any[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/payments', { params: cleanParams(params) }).then(res => unwrapPaginated<any>(res)),

  getRevenueStats: (): Promise<any> =>
    api.get('/api/v1/admin/payments/stats').then(res => unwrap<any>(res)),

  initiateRefund: (transactionId: string, refundAmount: number, reason: string): Promise<RefundResponse> =>
    api.post(`/api/v1/admin/payments/${transactionId}/refund`, { refundAmount, reason }).then(res => unwrap<RefundResponse>(res)),
};

// ==================== Platform Config ====================

export const platformConfigApi = {
  getConfig: (country: string): Promise<PlatformConfig> =>
    api.get(`/api/v1/admin/platform-config/${country}`).then(res => unwrap<PlatformConfig>(res)),

  updateConfig: (country: string, data: UpdatePlatformConfigRequest): Promise<PlatformConfig> =>
    api.put(`/api/v1/admin/platform-config/${country}`, data).then(res => unwrap<PlatformConfig>(res)),
};

// ==================== Announcements ====================

export const announcementApi = {
  create: (data: CreateAnnouncementRequest): Promise<Announcement> =>
    api.post('/api/v1/admin/announcements', data).then(res => unwrap<Announcement>(res)),

  getAll: (params?: {
    page?: number;
    size?: number;
  }): Promise<{ data: Announcement[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/announcements', { params: cleanParams(params) }).then(res => unwrapPaginated<Announcement>(res)),

  getById: (announcementId: string): Promise<Announcement> =>
    api.get(`/api/v1/admin/announcements/${announcementId}`).then(res => unwrap<Announcement>(res)),

  update: (announcementId: string, data: UpdateAnnouncementRequest): Promise<Announcement> =>
    api.put(`/api/v1/admin/announcements/${announcementId}`, data).then(res => unwrap<Announcement>(res)),

  delete: (announcementId: string): Promise<void> =>
    api.delete(`/api/v1/admin/announcements/${announcementId}`).then(() => {}),

  changeStatus: (announcementId: string, isActive: boolean): Promise<Announcement> =>
    api.patch(`/api/v1/admin/announcements/${announcementId}/status`, { isActive }).then(res => unwrap<Announcement>(res)),
};

// ==================== Analytics ====================

export const analyticsApi = {
  getPlatformOverview: (): Promise<any> =>
    api.get('/api/v1/admin/analytics/overview').then(res => unwrap<any>(res)),

  getVendorAnalytics: (vendorId: string): Promise<any> =>
    api.get(`/api/v1/analytics/vendor/${vendorId}`).then(res => unwrap<any>(res)),

  getOverview: (period: string): Promise<AnalyticsOverview> =>
    api.get('/api/v1/analytics/overview', { params: cleanParams({ period }) }).then(res => unwrap<AnalyticsOverview>(res)),
};

// ==================== Audit Logs ====================

export const auditLogApi = {
  getLogs: (params?: {
    page?: number;
    size?: number;
    action?: string;
    entityType?: string;
    entityId?: string;
    performedBy?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: AuditLog[]; pageInfo: PageInfo }> =>
    api.get('/api/v1/admin/audit-logs', { params: cleanParams(params) }).then(res => unwrapPaginated<AuditLog>(res)),
};

export default api;
