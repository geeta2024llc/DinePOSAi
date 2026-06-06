// ==========================================
// DinePosAI - Core Type & Schema Definitions
// ==========================================

export type TenantPlan = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type OrderCustomerType = 'DINE_IN' | 'TAKE_OUT' | 'DELIVERY';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COOKING' | 'READY' | 'SERVED' | 'CANCELLED';
export type OrderItemStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED';
export type PaymentMethod = 'CASH' | 'CARD' | 'QR' | 'MIXED';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
export type DeviceType = 'POS' | 'KDS' | 'TABLET';

// 🏢 Tenant Model
export interface Tenant {
  id: string;
  name: string;
  country: string | null;
  timezone: string | null;
  currency: string; // default 'JPY'
  taxType: 'VAT' | 'GST' | 'NONE';
  taxRate: number;
  plan: TenantPlan;
  status: TenantStatus;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// 👤 User Model
export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// 📱 Session Model
export interface Session {
  id: string;
  userId: string;
  tenantId: string;
  deviceId: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  createdAt: string;
}

// 📋 Audit Log Model
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

// 🍽 Category Model
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// 🍔 Menu Item Model
export interface MenuItem {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// 🏷 Item Variant Model (e.g. Small, Medium, Large)
export interface ItemVariant {
  id: string;
  menuItemId: string;
  name: string;
  priceModifier: number;
}

// 🍕 Item Addon Model (e.g. Extra Cheese, Bacon)
export interface ItemAddon {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
}

// 🪑 Table Model
export interface Table {
  id: string;
  tenantId: string;
  name: string;
  status: TableStatus;
  createdAt: string;
}

// 🧾 Order Model (Core POS Engine)
export interface Order {
  id: string;
  tenantId: string;
  tableId: string | null;
  customerType: OrderCustomerType;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 🍟 Order Item Model
export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  status: OrderItemStatus;
  notes: string | null;
}

// 🥫 Order Item Addon Model
export interface OrderItemAddon {
  id: string;
  orderItemId: string;
  addonName: string;
  price: number;
}

// 💰 Payment Model
export interface Payment {
  id: string;
  tenantId: string;
  orderId: string;
  method: PaymentMethod;
  amountPaid: number;
  changeReturned: number;
  status: PaymentStatus;
  transactionRef: string | null;
  createdAt: string;
}

// ✂️ Payment Split Model
export interface PaymentSplit {
  id: string;
  paymentId: string;
  method: Exclude<PaymentMethod, 'MIXED'>;
  amount: number;
}

// 🔄 Refund Model
export interface Refund {
  id: string;
  tenantId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

// 🧾 Invoice Model
export interface Invoice {
  id: string;
  tenantId: string;
  orderId: string;
  invoiceNumber: string;
  qrCode: string;
  total: number;
  createdAt: string;
}

// 📊 Aggregated Daily Sales Model
export interface DailySales {
  id: string;
  tenantId: string;
  date: string;
  grossSales: number;
  refunds: number;
  voids: number;
  netSales: number;
}

// 🛠 Device Model
export interface Device {
  id: string;
  tenantId: string;
  type: DeviceType;
  name: string;
  deviceUuid: string;
  isActive: boolean;
  lastSync: string;
}

// ⚙️ Settings Model
export interface Setting {
  id: string;
  tenantId: string;
  key: string;
  value: Record<string, any>;
}

// 👑 Super Admin Models
export interface SuperAdmin {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface TenantBilling {
  id: string;
  tenantId: string;
  plan: TenantPlan;
  status: string;
  amount: number;
  nextBillingDate: string;
  createdAt: string;
}

// 📬 Unified API Response Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
