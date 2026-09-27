import { createClient } from '@supabase/supabase-js';
import {
  Product,
  Purchase,
  Sale,
  Customer,
  Expense,
  Wastage,
  Intern,
  StockMovement,
  ActivityLog,
  BusinessSettings
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-supabase-anon-key';

export const isSupabaseConfigured = 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper Mappers between DB snake_case and UI camelCase

export function mapProductFromDb(db: any): Product {
  return {
    id: db.id,
    sku: db.sku,
    name: db.name,
    category: db.category,
    description: db.description || '',
    unit: db.unit || 'pcs',
    purchaseRate: Number(db.purchase_rate || 0),
    sellingRate: Number(db.selling_rate || 0),
    discountPercent: Number(db.discount_percent || 0),
    taxPercent: Number(db.tax_percent || 0),
    ownStock: Number(db.own_stock || 0),
    commissionStock: Number(db.commission_stock || 0),
    minStockAlert: Number(db.min_stock_alert || 5),
    images: Array.isArray(db.images) ? db.images : [],
    mainImage: db.main_image || '',
    status: db.status || 'ACTIVE',
    createdAt: db.created_at || new Date().toISOString(),
    updatedAt: db.updated_at || new Date().toISOString(),
    changeHistory: Array.isArray(db.change_history) ? db.change_history : []
  };
}

export function mapProductToDb(p: Product) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    description: p.description,
    unit: p.unit,
    purchase_rate: p.purchaseRate,
    selling_rate: p.sellingRate,
    discount_percent: p.discountPercent || 0,
    tax_percent: p.taxPercent || 0,
    own_stock: p.ownStock,
    commission_stock: p.commissionStock,
    min_stock_alert: p.minStockAlert,
    images: p.images || [],
    main_image: p.mainImage,
    status: p.status,
    change_history: p.changeHistory || [],
    updated_at: new Date().toISOString()
  };
}

export function mapPurchaseFromDb(db: any): Purchase {
  return {
    id: db.id,
    purchaseNumber: db.purchase_number,
    type: db.type,
    supplierOrOwner: db.supplier_or_owner,
    commissionRate: Number(db.commission_rate || 10),
    date: db.date || db.created_at,
    items: Array.isArray(db.items) ? db.items : [],
    totalAmount: Number(db.total_amount || 0),
    status: db.status || 'RECEIVED',
    notes: db.notes || '',
    receivedByIntern: db.received_by_intern || '',
    createdAt: db.created_at || new Date().toISOString()
  };
}

export function mapPurchaseToDb(p: Purchase) {
  return {
    id: p.id,
    purchase_number: p.purchaseNumber,
    type: p.type,
    supplier_or_owner: p.supplierOrOwner,
    commission_rate: p.commissionRate || 10,
    date: p.date,
    items: p.items || [],
    total_amount: p.totalAmount,
    status: p.status,
    notes: p.notes,
    received_by_intern: p.receivedByIntern
  };
}

export function mapSaleFromDb(db: any): Sale {
  return {
    id: db.id,
    billNumber: db.bill_number,
    date: db.date || db.created_at,
    customerName: db.customer_name,
    customerPhone: db.customer_phone,
    isWalkIn: Boolean(db.is_walk_in),
    items: Array.isArray(db.items) ? db.items : [],
    subtotal: Number(db.subtotal || 0),
    discount: Number(db.discount || 0),
    total: Number(db.total || 0),
    paymentMethod: db.payment_method || 'CASH',
    paymentStatus: db.payment_status || 'PAID',
    ownSalesTotal: Number(db.own_sales_total || 0),
    commissionSalesTotal: Number(db.commission_sales_total || 0),
    commissionEarnedTotal: Number(db.commission_earned_total || 0),
    ownerAmountTotal: Number(db.owner_amount_total || 0),
    netThinkarooProfit: Number(db.net_thinkaroo_profit || 0),
    internEmail: db.intern_email || '',
    internName: db.intern_name || '',
    notes: db.notes || '',
    createdAt: db.created_at || new Date().toISOString()
  };
}

export function mapSaleToDb(s: Sale) {
  return {
    id: s.id,
    bill_number: s.billNumber,
    date: s.date,
    customer_name: s.customerName,
    customer_phone: s.customerPhone,
    is_walk_in: s.isWalkIn,
    items: s.items || [],
    subtotal: s.subtotal,
    discount: s.discount,
    total: s.total,
    payment_method: s.paymentMethod,
    payment_status: s.paymentStatus,
    own_sales_total: s.ownSalesTotal,
    commission_sales_total: s.commissionSalesTotal,
    commission_earned_total: s.commissionEarnedTotal,
    owner_amount_total: s.ownerAmountTotal,
    net_thinkaroo_profit: s.netThinkarooProfit,
    intern_email: s.internEmail,
    intern_name: s.internName,
    notes: s.notes
  };
}

export function mapCustomerFromDb(db: any): Customer {
  return {
    id: db.id,
    name: db.name,
    phone: db.phone,
    email: db.email,
    isWalkIn: Boolean(db.is_walk_in),
    totalSpent: Number(db.total_spent || 0),
    ordersCount: Number(db.orders_count || 0),
    firstVisit: db.first_visit,
    lastVisit: db.last_visit
  };
}

export function mapCustomerToDb(c: Customer) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    is_walk_in: c.isWalkIn,
    total_spent: c.totalSpent,
    orders_count: c.ordersCount,
    first_visit: c.firstVisit,
    last_visit: c.lastVisit
  };
}

export function mapExpenseFromDb(db: any): Expense {
  return {
    id: db.id,
    category: db.category,
    amount: Number(db.amount || 0),
    date: db.date,
    note: db.note || '',
    recordedByIntern: db.recorded_by_intern || '',
    createdAt: db.created_at || new Date().toISOString()
  };
}

export function mapExpenseToDb(e: Expense) {
  return {
    id: e.id,
    category: e.category,
    amount: e.amount,
    date: e.date,
    note: e.note,
    recorded_by_intern: e.recordedByIntern
  };
}

export function mapWastageFromDb(db: any): Wastage {
  return {
    id: db.id,
    productId: db.product_id,
    productName: db.product_name,
    stockType: db.stock_type,
    quantity: Number(db.quantity || 0),
    unitCost: Number(db.unit_cost || 0),
    totalLoss: Number(db.total_loss || 0),
    reason: db.reason,
    date: db.date,
    note: db.note || '',
    recordedByIntern: db.recorded_by_intern || '',
    createdAt: db.created_at || new Date().toISOString()
  };
}

export function mapWastageToDb(w: Wastage) {
  return {
    id: w.id,
    product_id: w.productId,
    product_name: w.productName,
    stock_type: w.stockType,
    quantity: w.quantity,
    unit_cost: w.unitCost,
    total_loss: w.totalLoss,
    reason: w.reason,
    date: w.date,
    note: w.note,
    recorded_by_intern: w.recordedByIntern
  };
}

export function mapInternFromDb(db: any): Intern {
  return {
    id: db.id,
    email: db.email,
    name: db.name,
    role: db.role || 'INTERN',
    status: db.status || 'ENABLED',
    addedDate: db.added_date,
    lastLogin: db.last_login
  };
}

export function mapInternToDb(i: Intern) {
  return {
    id: i.id,
    email: i.email,
    name: i.name,
    role: i.role,
    status: i.status,
    added_date: i.addedDate,
    last_login: i.lastLogin
  };
}

export function mapStockMovementFromDb(db: any): StockMovement {
  return {
    id: db.id,
    productId: db.product_id,
    productName: db.product_name,
    stockType: db.stock_type,
    movementType: db.movement_type,
    quantityDelta: Number(db.quantity_delta || 0),
    quantityAfter: Number(db.quantity_after || 0),
    referenceId: db.reference_id,
    reason: db.reason || '',
    internEmail: db.intern_email || '',
    internName: db.intern_name || '',
    timestamp: db.timestamp || new Date().toISOString()
  };
}

export function mapStockMovementToDb(m: StockMovement) {
  return {
    id: m.id,
    product_id: m.productId,
    product_name: m.productName,
    stock_type: m.stockType,
    movement_type: m.movementType,
    quantity_delta: m.quantityDelta,
    quantity_after: m.quantityAfter,
    reference_id: m.referenceId,
    reason: m.reason,
    intern_email: m.internEmail,
    intern_name: m.internName,
    timestamp: m.timestamp
  };
}

export function mapActivityLogFromDb(db: any): ActivityLog {
  return {
    id: db.id,
    timestamp: db.timestamp || new Date().toISOString(),
    internEmail: db.intern_email || '',
    internName: db.intern_name || '',
    action: db.action,
    entityType: db.entity_type,
    entityId: db.entity_id,
    details: db.details || ''
  };
}

export function mapActivityLogToDb(a: ActivityLog) {
  return {
    id: a.id,
    timestamp: a.timestamp,
    intern_email: a.internEmail,
    intern_name: a.internName,
    action: a.action,
    entity_type: a.entityType,
    entity_id: a.entityId,
    details: a.details
  };
}

export function mapSettingsFromDb(db: any): BusinessSettings {
  return {
    businessName: db.business_name || 'THINKAROO',
    schoolName: db.school_name || 'Caliph Life School',
    tagline: db.tagline || 'Student Entrepreneurship Enterprise',
    phone: db.phone || '',
    email: db.email || '',
    address: db.address || '',
    defaultCommissionRate: Number(db.default_commission_rate || 10),
    currencySymbol: db.currency_symbol || '₹',
    categories: Array.isArray(db.categories) ? db.categories : [],
    paymentMethods: Array.isArray(db.payment_methods) ? db.payment_methods : ['CASH', 'UPI', 'CARD', 'OTHER'],
    billPrefix: db.bill_prefix || 'TK-INV-',
    billFooterMessage: db.bill_footer_message || '',
    showSchoolNameOnBill: Boolean(db.show_school_name_on_bill),
    lowStockThreshold: Number(db.low_stock_threshold || 5)
  };
}

export function mapSettingsToDb(s: BusinessSettings) {
  return {
    id: 'default',
    business_name: s.businessName,
    school_name: s.schoolName,
    tagline: s.tagline,
    phone: s.phone,
    email: s.email,
    address: s.address,
    default_commission_rate: s.defaultCommissionRate,
    currency_symbol: s.currencySymbol,
    categories: s.categories,
    payment_methods: s.paymentMethods,
    bill_prefix: s.billPrefix,
    bill_footer_message: s.billFooterMessage,
    show_school_name_on_bill: s.showSchoolNameOnBill,
    low_stock_threshold: s.lowStockThreshold,
    updated_at: new Date().toISOString()
  };
}
