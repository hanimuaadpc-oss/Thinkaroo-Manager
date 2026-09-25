export type StockType = 'OWN' | 'COMMISSION';

export type MovementType = 
  | 'OWN_PURCHASE'
  | 'COMMISSION_PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'WASTAGE'
  | 'MANUAL_ADJUSTMENT';

export interface ProductImage {
  id: string;
  url: string;
  isMain?: boolean;
}

export interface ProductChangeLog {
  id: string;
  timestamp: string;
  intern: string;
  action: 'CREATED' | 'RATES_UPDATED' | 'STOCK_ADJUSTED' | 'IMAGES_UPDATED' | 'DETAILS_EDITED';
  details: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  unit: string; // e.g., 'pcs', 'pack', 'set', 'book'
  purchaseRate: number; // Cost to Thinkaroo (or owner base value for commission)
  sellingRate: number;  // Price charged to customer
  discountPercent?: number;
  taxPercent?: number;
  ownStock: number;
  commissionStock: number;
  minStockAlert: number;
  images: ProductImage[];
  mainImage: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  createdAt: string;
  updatedAt: string;
  changeHistory: ProductChangeLog[];
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  stockType: StockType;
  movementType: MovementType;
  quantityDelta: number; // + or -
  quantityAfter: number; // Stock after movement for this stockType
  referenceId?: string; // Bill ID, Purchase ID, Wastage ID
  reason: string;
  internEmail: string;
  internName: string;
  timestamp: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  purchaseRate: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  type: StockType; // 'OWN' or 'COMMISSION'
  supplierOrOwner: string; // Supplier for Own, Owner name for Commission
  commissionRate?: number; // default 10% if commission
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'RECEIVED' | 'PENDING' | 'CANCELLED';
  notes?: string;
  receivedByIntern: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  stockType: StockType; // 'OWN' or 'COMMISSION'
  quantity: number;
  unitPrice: number; // Selling rate
  purchaseRate: number; // Stored historical cost
  discount: number;
  lineTotal: number;
  commissionRate: number; // e.g. 10% for commission, 0 for own
  commissionEarned: number; // LineTotal * 10% (Thinkaroo's share if commission)
  ownerAmount: number; // LineTotal * 90% (if commission)
  profitOrCostShare: number; // For Own: LineTotal - (purchaseRate * qty); For Commission: commissionEarned
}

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'OTHER';

export interface Sale {
  id: string;
  billNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  isWalkIn: boolean;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  
  // Financial breakdown
  ownSalesTotal: number;
  commissionSalesTotal: number;
  commissionEarnedTotal: number;
  ownerAmountTotal: number;
  netThinkarooProfit: number;
  
  internEmail: string;
  internName: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isWalkIn: boolean;
  totalSpent: number;
  ordersCount: number;
  firstVisit: string;
  lastVisit: string;
}

export type ExpenseCategory = 
  | 'Delivery'
  | 'Transport'
  | 'Packaging'
  | 'Printing'
  | 'Marketing'
  | 'Supplies'
  | 'Maintenance'
  | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note: string;
  recordedByIntern: string;
  createdAt: string;
}

export interface Wastage {
  id: string;
  productId: string;
  productName: string;
  stockType: StockType;
  quantity: number;
  unitCost: number;
  totalLoss: number;
  reason: 'Damaged' | 'Expired' | 'Lost' | 'Defective' | 'Sample' | 'Other';
  date: string;
  note: string;
  recordedByIntern: string;
  createdAt: string;
}

export interface Intern {
  id: string;
  email: string;
  name: string;
  role: 'INTERN' | 'COORDINATOR' | 'ADMIN';
  status: 'ENABLED' | 'DISABLED';
  addedDate: string;
  lastLogin?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  internEmail: string;
  internName: string;
  action: string;
  entityType: 'PRODUCT' | 'STOCK' | 'PURCHASE' | 'SALE' | 'EXPENSE' | 'WASTAGE' | 'INTERN' | 'SETTINGS' | 'AUTH';
  entityId?: string;
  details: string;
}

export interface BusinessSettings {
  businessName: string;
  schoolName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  defaultCommissionRate: number; // default 10
  currencySymbol: string; // '₹'
  categories: string[];
  paymentMethods: string[];
  billPrefix: string;
  billFooterMessage: string;
  showSchoolNameOnBill: boolean;
  lowStockThreshold: number;
}
