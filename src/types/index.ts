// ==================== Auth Types ====================

export interface Admin {
  userId: string;
  vendorId: string | null;
  email: string;
  phone: string;
  userType: 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT_AGENT';
  firstName: string;
  lastName: string;
  fullName: string;
  profilePictureUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  preferredLanguage: string | null;
  preferredCurrency: string;
  country: string;
  status: string;
  notificationPreferences: NotificationPreferences | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Admin;
}

export interface AdminLoginDto {
  identifier: string;
  password: string;
}

export interface AdminRegistrationDto {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'ADMIN' | 'SUPPORT_AGENT';
  country: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== Notification Preferences ====================

export interface NotificationPreferences {
  emailNotifications: {
    orderUpdates: boolean;
    bidUpdates: boolean;
    promotional: boolean;
    newsletter: boolean;
    paymentReminders: boolean;
    securityAlerts: boolean;
  };
  smsNotifications: {
    orderUpdates: boolean;
    bidUpdates: boolean;
    paymentReminders: boolean;
    securityAlerts: boolean;
  };
  pushNotifications: {
    orderUpdates: boolean;
    bidUpdates: boolean;
    promotional: boolean;
    paymentReminders: boolean;
  };
  whatsappNotifications: {
    orderUpdates: boolean;
    bidUpdates: boolean;
  };
}

// ==================== Dashboard Stats ====================

export interface DashboardStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  };
  vendorStats: {
    totalVendors: number;
    activeVendors: number;
    pendingApproval: number;
    verifiedVendors: number;
    newVendorsThisMonth: number;
  };
  orderStats: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    ordersToday: number;
    ordersThisWeek: number;
    ordersThisMonth: number;
  };
  revenueStats: {
    totalRevenue: number;
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    platformFees: number;
    pendingPayouts: number;
  };
  bidStats: {
    totalBidRequests: number;
    activeBidRequests: number;
    acceptedBids: number;
    expiredBids: number;
  };
}

// ==================== Pagination ====================

export interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pageInfo: PageInfo;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ==================== User Types ====================

export interface User {
  userId: string;
  vendorId: string | null;
  email: string;
  phone: string;
  userType: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePictureUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  preferredLanguage: string | null;
  preferredCurrency: string;
  country: string;
  status: string;
  notificationPreferences: NotificationPreferences | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UpdateUserStatusDto {
  status: string;
  reason?: string;
}

// ==================== Vendor Types ====================

export interface VendorAddress {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface VendorOwnerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  idProofType: string;
  idProofNumber: string;
}

export interface VendorServiceArea {
  city: string;
  state: string;
  radiusKm: number;
}

export interface VendorCapacity {
  minGuests: number;
  maxGuests: number;
  concurrentEvents: number;
}

export interface VendorPricing {
  currency: string;
  startingPricePerPlate: number;
  averagePricePerPlate: number;
}

export interface VendorRatings {
  averageRating: number | null;
  totalReviews: number;
}

export interface VendorStats {
  totalOrders: number;
  completedOrders: number;
  ordersCount: number;
}

export interface VendorDocument {
  documentId: string;
  documentType: string;
  documentName: string;
  documentUrl: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string | null;
  verificationStatus: string;
  uploadedAt: string;
}

export interface Vendor {
  vendorId: string;
  userId: string;
  registeredEmail: string;
  registeredPhone: string;
  registeredEmailVerified: boolean;
  registeredPhoneVerified: boolean;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessEmailVerified: boolean;
  businessPhoneVerified: boolean;
  businessType: string;
  businessRegistrationNumber: string;
  taxId: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string;
  establishedYear: number;
  cuisinesOffered: string[];
  specialties: string[];
  businessAddress: VendorAddress;
  ownerInfo: VendorOwnerInfo;
  serviceAreas: VendorServiceArea[];
  capacity: VendorCapacity;
  pricing: VendorPricing;
  ratings: VendorRatings | null;
  stats: VendorStats | null;
  status: string;
  approvalStatus: string;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  documents: VendorDocument[];
  country: string;
}

// ==================== Order Types ====================

export interface OrderEventDetails {
  eventType: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  numberOfGuests: number;
  venueAddress: VendorAddress;
}

export interface VendorOrderItem {
  vendorItemId: string;
  itemName: string;
  quantity: number;
  pricePerPlate: number;
  totalPrice: number;
}

export interface VendorOrder {
  vendorOrderId: string;
  vendorId: string;
  vendorUserId: string | null;
  vendorName: string;
  items: VendorOrderItem[] | null;
  subtotal: number;
  serviceCharge: number;
  taxAmount: number;
  totalAmount: number;
  vendorStatus: string;
  deliveryStatus: string;
}

export interface OrderPricing {
  currency: string;
  subtotal: number;
  serviceCharges: number;
  taxAmount: number;
  platformFee: number;
  discountAmount: number;
  totalAmount: number;
}

export interface PaymentDetails {
  tokenAmount: number;
  tokenPaid: boolean;
  tokenPaidAt: string | null;
  totalPaid: number;
  balanceDue: number;
  paymentStatus: string;
}

export interface OrderContactInfo {
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
}

export interface Order {
  orderId: string;
  userId: string;
  bidRequestId: string;
  eventDetails: OrderEventDetails;
  vendorOrders: VendorOrder[];
  pricing: OrderPricing;
  paymentDetails: PaymentDetails;
  contactInfo: OrderContactInfo;
  specialInstructions: string | null;
  status: string;
  cancellation: any | null;
  createdAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
}

// ==================== Bid Types ====================

export interface BidEventDetails {
  eventType: string;
  eventName: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  numberOfGuests: number;
  venueAddress: VendorAddress;
}

export interface BidMenuItem {
  vendorItemId: string | null;
  masterItemId: string;
  itemName: string;
  quantity: number;
}

export interface BidAdditionalRequirements {
  serviceStaffNeeded: boolean;
  numberOfStaff: number;
  decorationNeeded: boolean;
  liveCounters: string[];
  specialInstructions: string;
}

export interface BidBudget {
  currency: string;
  estimatedBudget: number;
  budgetRange: string;
}

export interface BidCompetitivePeriod {
  startTime: string;
  endTime: string;
  status: string;
}

export interface BidRequest {
  bidRequestId: string;
  userId: string;
  eventDetails: BidEventDetails;
  menuItems: BidMenuItem[];
  additionalRequirements: BidAdditionalRequirements;
  budget: BidBudget;
  targetedVendors: string[];
  competitivePeriod: BidCompetitivePeriod;
  acceptedBid: any | null;
  status: string;
  totalBidsReceived: number;
  lowestBidAmount: number | null;
  createdAt: string;
  expiresAt: string;
}

// ==================== Menu Types ====================

export interface Category {
  categoryId: string;
  categoryName: string;
  categoryNameHindi: string;
  description: string;
  displayOrder: number;
  iconUrl: string;
  status: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  categoryNameHindi?: string;
  description?: string;
  displayOrder?: number;
  iconUrl?: string;
}

export interface UpdateCategoryRequest {
  categoryName?: string;
  categoryNameHindi?: string;
  description?: string;
  displayOrder?: number;
  iconUrl?: string;
}

export interface NutritionalInfo {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  servingSizeGrams: number;
}

export interface MenuItem {
  masterItemId: string;
  itemName: string;
  itemNameHindi: string;
  description: string;
  categoryId: string;
  categoryName: string | null;
  cuisineType: string;
  foodType: string;
  spiceLevel: string;
  dietaryTags: string[];
  allergens: string[];
  nutritionalInfo: NutritionalInfo;
  imageUrls: string[];
  isPopular: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  itemName: string;
  itemNameHindi?: string;
  description: string;
  categoryId: string;
  cuisineType: string;
  foodType: string;
  spiceLevel: string;
  dietaryTags?: string[];
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  imageUrls?: string[];
  isPopular?: boolean;
}

export interface UpdateMenuItemRequest {
  itemName?: string;
  itemNameHindi?: string;
  description?: string;
  categoryId?: string;
  cuisineType?: string;
  foodType?: string;
  spiceLevel?: string;
  dietaryTags?: string[];
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  imageUrls?: string[];
  isPopular?: boolean;
}

// ==================== Promo Code Types ====================

export interface PromoCode {
  promoCodeId: string;
  code: string;
  title: string;
  description: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  value: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  validFrom: string;
  validTo: string;
  usageLimitGlobal: number | null;
  usageLimitPerUser: number | null;
  usedCount: number;
  applicableTo: 'ALL' | 'SPECIFIC_VENDORS' | 'SPECIFIC_CUISINES';
  applicableVendorIds: string[] | null;
  applicableCuisines: string[] | null;
  firstOrderOnly: boolean;
  status: string;
  createdAt: string;
}

export interface CreatePromoRequest {
  code: string;
  title: string;
  description: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  value: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimitGlobal?: number;
  usageLimitPerUser?: number;
  applicableTo: 'ALL' | 'SPECIFIC_VENDORS' | 'SPECIFIC_CUISINES';
  applicableVendorIds?: string[];
  applicableCuisines?: string[];
  firstOrderOnly?: boolean;
}

// ==================== Support Ticket Types ====================

export interface TicketSLA {
  firstResponseDue: string;
  resolutionDue: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  slaBreached: boolean;
}

export interface TicketRelatedEntities {
  orderId: string | null;
  vendorId: string | null;
  paymentId: string | null;
}

export interface SupportTicket {
  ticketId: string;
  ticketNumber: string;
  createdBy: string;
  createdByName: string;
  category: string;
  subcategory: string;
  priority: string;
  subject: string;
  description: string;
  relatedEntities: TicketRelatedEntities;
  assignedTo: string | null;
  assignedAt: string | null;
  conversationId: string | null;
  status: string;
  sla: TicketSLA;
  resolution: string | null;
  customerSatisfaction: number | null;
  createdAt: string;
  closedAt: string | null;
}

// ==================== Platform Config Types ====================

export interface BiddingConfig {
  competitivePeriodHours: number;
  coolingPeriodHours: number;
  paymentCoolingPeriodHours: number;
  bidExpiryHours: number;
  minVendorsForCompetitive: number;
  maxBidRevisions: number;
}

export interface PaymentConfig {
  tokenPercentage: number;
  enabledGateways: string[];
  defaultGateway: string;
  paymentTimeoutHours: number;
  autoRefundEnabled: boolean;
}

export interface RefundTier {
  daysBeforeEvent: number;
  refundPercentage: number;
}

export interface CancellationPolicy {
  cancellationWindowDays: number;
  refundTiers: RefundTier[];
}

export interface CommissionConfig {
  platformFeePercentage: number;
  vendorCommissionPercentage: number;
  paymentGatewayFeePercentage: number;
}

export interface PlatformConfig {
  configId: string;
  country: string;
  biddingConfig: BiddingConfig;
  paymentConfig: PaymentConfig;
  cancellationPolicy: CancellationPolicy;
  commissionConfig: CommissionConfig;
  updatedBy: string;
  updatedAt: string;
}

export interface UpdatePlatformConfigRequest {
  biddingConfig?: BiddingConfig;
  paymentConfig?: PaymentConfig;
  cancellationPolicy?: CancellationPolicy;
  commissionConfig?: CommissionConfig;
}

// ==================== Audit Log Types ====================

export interface AuditLog {
  id: string;
  logId: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedByType: string;
  changes: Record<string, any> | null;
  metadata: any | null;
  timestamp: string;
}

export interface AuditLogFilters {
  action?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
}

// ==================== Announcement Types ====================

export interface Announcement {
  announcementId: string;
  title: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetAudience: 'ALL' | 'USERS' | 'VENDORS' | 'ADMINS';
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetAudience?: 'ALL' | 'USERS' | 'VENDORS' | 'ADMINS';
  startDate?: string;
  endDate?: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  message?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetAudience?: 'ALL' | 'USERS' | 'VENDORS' | 'ADMINS';
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// ==================== Refund Types ====================

export interface RefundResponse {
  transactionId: string;
  refundId: string;
  orderId: string;
  refundAmount: number;
  currency: string;
  status: string;
  estimatedArrival: string;
  initiatedAt: string;
}

// ==================== Analytics Types ====================

export interface CityAnalytics {
  city: string;
  orderCount: number;
  revenue: number;
}

export interface CuisineAnalytics {
  cuisine: string;
  orderCount: number;
}

export interface EventTypeAnalytics {
  eventType: string;
  count: number;
}

export interface AnalyticsOverview {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  totalBidRequests: number;
  totalNewUsers: number;
  totalNewVendors: number;
  averageOrderValue: number;
  topCities: CityAnalytics[];
  topCuisines: CuisineAnalytics[];
  topEventTypes: EventTypeAnalytics[];
}
