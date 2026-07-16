// ==========================================
// DinePosAI - Core Type & Schema Definitions
// ==========================================

export type TenantPlan = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN';
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
  onboarded: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// 🏢 Branch Model
export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string | null;
  timezone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 👤 User Model
export interface User {
  id: string;
  tenantId: string;
  branchId: string | null;
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
  branchId: string | null;
  deviceId: string;
  refreshToken: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  loginTime: string;
  lastActivity: string;
  logoutTime: string | null;
  isCurrent: boolean;
  expiresAt: string;
  createdAt: string;
}

// 📋 Login History Entry
export interface LoginHistoryEntry {
  id: string;
  userId: string | null;
  tenantId: string | null;
  ipAddress: string | null;
  browser: string | null;
  device: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  failureReason: string | null;
  createdAt: string;
}

// 📋 User Permission Model
export interface UserPermission {
  id: string;
  role: UserRole;
  permission: string;
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
  ipAddress?: string | null;
  device?: string | null;
  branchId?: string | null;
  createdAt: string;
}

// 🔒 Permission Constants
export const PERMISSIONS = {
  ORDERS_CREATE: 'orders.create',
  ORDERS_EDIT: 'orders.edit',
  ORDERS_REFUND: 'orders.refund',
  ORDERS_CANCEL: 'orders.cancel',
  INVOICE_PRINT: 'invoice.print',
  TABLES_VIEW: 'tables.view',
  TABLES_MANAGE: 'tables.manage',
  MENU_VIEW: 'menu.view',
  MENU_MANAGE: 'menu.manage',
  KDS_VIEW: 'kds.view',
  KDS_UPDATE: 'kds.update',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_MANAGE: 'inventory.manage',
  STAFF_VIEW: 'staff.view',
  STAFF_INVITE: 'staff.invite',
  STAFF_MANAGE: 'staff.manage',
  BILLING_VIEW: 'billing.view',
  BILLING_MANAGE: 'billing.manage',
  REPORTS_VIEW: 'reports.view',
  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_VIEW: 'audit.view',
  SYSTEM_MANAGE: 'system.manage',
  CASH_DRAWER_OPEN: 'cash_drawer.open',
  CASH_DRAWER_CASH_IN: 'cash_drawer.cash_in',
  CASH_DRAWER_CASH_OUT: 'cash_drawer.cash_out',
  CASH_DRAWER_NO_SALE: 'cash_drawer.no_sale',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to default permissions mapping
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  OWNER: Object.values(PERMISSIONS).filter(p => p !== 'system.manage'),
  MANAGER: [
    'orders.create', 'orders.edit', 'orders.refund', 'orders.cancel',
    'invoice.print', 'tables.view', 'tables.manage', 'menu.view',
    'menu.manage', 'kds.view', 'kds.update', 'inventory.view',
    'inventory.manage', 'staff.view', 'billing.view', 'reports.view',
    'audit.view', 'cash_drawer.open', 'cash_drawer.cash_in',
    'cash_drawer.cash_out', 'cash_drawer.no_sale'
  ],
  CASHIER: [
    'orders.create', 'orders.edit', 'orders.refund', 'orders.cancel',
    'invoice.print', 'tables.view', 'menu.view', 'cash_drawer.open',
    'cash_drawer.cash_in', 'cash_drawer.cash_out', 'cash_drawer.no_sale'
  ],
  WAITER: [
    'orders.create', 'orders.edit', 'tables.view', 'menu.view'
  ],
  KITCHEN: [
    'menu.view', 'kds.view', 'kds.update'
  ]
};

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

// 📦 Inventory Item Model
export interface InventoryItem {
  id: string;
  tenantId: string;
  name: string;
  sku: string | null;
  unit: string;
  costPerUnit: number;
  stockLevel: number;
  minStockLevel: number;
  createdAt: string;
  updatedAt: string;
}

// 🍳 MenuItem Recipe Model
export interface MenuItemRecipe {
  id: string;
  tenantId: string;
  menuItemId: string;
  itemVariantId: string | null;
  ingredientId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// 🚚 Supplier Model
export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

// 📝 Purchase Order Model
export type PurchaseOrderStatus = 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  supplierId: string | null;
  status: PurchaseOrderStatus;
  totalCost: number;
  orderedAt: string | null;
  receivedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// 📦 Purchase Order Item Model
export interface PurchaseOrderItem {
  id: string;
  tenantId: string;
  purchaseOrderId: string;
  ingredientId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

// 🗑️ Waste Log Model
export type WasteReason = 'SPOILAGE' | 'ACCIDENT' | 'EXPIRED' | 'QUALITY_CONTROL';

export interface WasteLog {
  id: string;
  tenantId: string;
  ingredientId: string;
  quantity: number;
  reason: WasteReason;
  notes: string | null;
  reportedBy: string | null;
  createdAt: string;
}

// 📊 Inventory Transaction Model (Ledger)
export type InventoryTransactionType = 'PURCHASE' | 'SALE_DEDUCTION' | 'WASTE' | 'MANUAL_ADJUSTMENT' | 'REFUND_RESTOCK';

export interface InventoryTransaction {
  id: string;
  tenantId: string;
  ingredientId: string;
  type: InventoryTransactionType;
  quantity: number;
  referenceId: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

// 📬 Unified API Response Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
