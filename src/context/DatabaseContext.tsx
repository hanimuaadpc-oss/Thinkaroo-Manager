import React, { createContext, useContext, useState, useEffect } from 'react';
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
  BusinessSettings,
  StockType,
  MovementType,
  SaleItem
} from '../types';
import {
  initialProducts,
  initialPurchases,
  initialSales,
  initialCustomers,
  initialExpenses,
  initialWastages,
  initialInterns,
  initialMovements,
  initialActivityLogs,
  initialSettings
} from '../data/seedData';

interface DatabaseContextType {
  // Current Auth / Intern state
  currentIntern: Intern | null;
  isAuthenticated: boolean;
  isAccessDenied: boolean;
  attemptedEmail: string;
  loginWithGmail: (email: string) => { success: boolean; message: string };
  logout: () => void;
  switchIntern: (internId: string) => void;
  clearAccessDenied: () => void;

  // Entities
  products: Product[];
  purchases: Purchase[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
  wastages: Wastage[];
  interns: Intern[];
  stockMovements: StockMovement[];
  activityLogs: ActivityLog[];
  settings: BusinessSettings;

  // Product Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>) => void;
  updateProduct: (id: string, updates: Partial<Product>, reason?: string) => void;
  deleteProduct: (id: string) => void;

  // Stock Operations
  adjustStock: (
    productId: string, 
    stockType: StockType, 
    delta: number, 
    movementType: MovementType, 
    reason: string
  ) => void;

  // Purchase Operations
  addPurchase: (purchase: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt'>) => void;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;

  // Sales Operations
  createSale: (saleData: {
    customerName: string;
    customerPhone?: string;
    isWalkIn: boolean;
    items: {
      productId: string;
      stockType: StockType;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }[];
    discount?: number;
    paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'OTHER';
    notes?: string;
  }) => Sale;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  // Expense Operations
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'recordedByIntern'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Wastage Operations
  addWastage: (wastage: Omit<Wastage, 'id' | 'createdAt' | 'recordedByIntern' | 'totalLoss'>) => void;
  deleteWastage: (id: string) => void;

  // Intern Access Management
  addIntern: (email: string, name: string, role?: 'INTERN' | 'COORDINATOR' | 'ADMIN') => { success: boolean; message: string };
  toggleInternStatus: (id: string) => void;
  deleteIntern: (id: string) => void;

  // Settings & Reset
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetDatabase: (mode: 'DEMO' | 'SALES' | 'INVENTORY' | 'FULL') => void;

  // Helpers
  logActivity: (action: string, entityType: ActivityLog['entityType'], details: string, entityId?: string) => void;
}

const STORAGE_KEYS = {
  PRODUCTS: 'thinkaroo_products_v2',
  PURCHASES: 'thinkaroo_purchases_v2',
  SALES: 'thinkaroo_sales_v2',
  CUSTOMERS: 'thinkaroo_customers_v2',
  EXPENSES: 'thinkaroo_expenses_v2',
  WASTAGES: 'thinkaroo_wastages_v2',
  INTERNS: 'thinkaroo_interns_v2',
  MOVEMENTS: 'thinkaroo_movements_v2',
  ACTIVITY: 'thinkaroo_activity_v2',
  SETTINGS: 'thinkaroo_settings_v2',
  CURRENT_INTERN: 'thinkaroo_current_intern_v2',
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load helper
  const loadState = <T,>(key: string, defaultVal: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(`Failed to load ${key}`, e);
    }
    return defaultVal;
  };

  // State initialization
  const [products, setProducts] = useState<Product[]>(() => loadState(STORAGE_KEYS.PRODUCTS, initialProducts));
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadState(STORAGE_KEYS.PURCHASES, initialPurchases));
  const [sales, setSales] = useState<Sale[]>(() => loadState(STORAGE_KEYS.SALES, initialSales));
  const [customers, setCustomers] = useState<Customer[]>(() => loadState(STORAGE_KEYS.CUSTOMERS, initialCustomers));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadState(STORAGE_KEYS.EXPENSES, initialExpenses));
  const [wastages, setWastages] = useState<Wastage[]>(() => loadState(STORAGE_KEYS.WASTAGES, initialWastages));
  const [interns, setInterns] = useState<Intern[]>(() => loadState(STORAGE_KEYS.INTERNS, initialInterns));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => loadState(STORAGE_KEYS.MOVEMENTS, initialMovements));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadState(STORAGE_KEYS.ACTIVITY, initialActivityLogs));
  const [settings, setSettings] = useState<BusinessSettings>(() => loadState(STORAGE_KEYS.SETTINGS, initialSettings));

  // Current intern (defaults to Aarav Patel for convenience if none selected, but verified against approved interns)
  const [currentIntern, setCurrentIntern] = useState<Intern | null>(() => {
    const saved = loadState<Intern | null>(STORAGE_KEYS.CURRENT_INTERN, null);
    if (saved && initialInterns.some(i => i.email.toLowerCase() === saved.email.toLowerCase() && i.status === 'ENABLED')) {
      return saved;
    }
    return initialInterns[1]; // Aarav Patel
  });

  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [attemptedEmail, setAttemptedEmail] = useState('');

  // Persist state updates
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WASTAGES, JSON.stringify(wastages)); }, [wastages]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INTERNS, JSON.stringify(interns)); }, [interns]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements)); }, [stockMovements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => {
    if (currentIntern) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_INTERN, JSON.stringify(currentIntern));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_INTERN);
    }
  }, [currentIntern]);

  // Log activity helper
  const logActivity = (action: string, entityType: ActivityLog['entityType'], details: string, entityId?: string) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      internEmail: currentIntern?.email || 'system@thinkaroo',
      internName: currentIntern?.name || 'System / Auto',
      action,
      entityType,
      entityId,
      details,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Intern Authentication & Access Control
  const loginWithGmail = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const approved = interns.find(i => i.email.toLowerCase() === cleanEmail);

    if (!approved || approved.status !== 'ENABLED') {
      setIsAccessDenied(true);
      setAttemptedEmail(cleanEmail);
      logActivity('FAILED_LOGIN_ATTEMPT', 'AUTH', `Access denied for unapproved account: ${cleanEmail}`);
      return { success: false, message: 'Access denied. This Gmail is not approved for Thinkaroo intern access.' };
    }

    // Success: Update last login
    const updatedIntern = { ...approved, lastLogin: new Date().toISOString() };
    setInterns(prev => prev.map(i => i.id === approved.id ? updatedIntern : i));
    setCurrentIntern(updatedIntern);
    setIsAccessDenied(false);
    setAttemptedEmail('');
    logActivity('INTERN_LOGIN', 'AUTH', `Intern ${approved.name} (${approved.email}) signed in.`);
    return { success: true, message: `Welcome back, ${approved.name}!` };
  };

  const logout = () => {
    if (currentIntern) {
      logActivity('INTERN_LOGOUT', 'AUTH', `Intern ${currentIntern.name} signed out.`);
    }
    setCurrentIntern(null);
  };

  const switchIntern = (internId: string) => {
    const target = interns.find(i => i.id === internId && i.status === 'ENABLED');
    if (target) {
      setCurrentIntern(target);
      setIsAccessDenied(false);
      logActivity('SWITCHED_ACTIVE_INTERN', 'AUTH', `Active intern switched to ${target.name}`);
    }
  };

  const clearAccessDenied = () => {
    setIsAccessDenied(false);
    setAttemptedEmail('');
  };

  // Products Operations
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>) => {
    const newId = 'prod-' + Date.now();
    const now = new Date().toISOString();
    const newProd: Product = {
      ...prodData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      changeHistory: [
        {
          id: 'ch-' + Date.now(),
          timestamp: now,
          intern: currentIntern?.name || 'Intern',
          action: 'CREATED',
          details: `Created product with selling rate ₹${prodData.sellingRate}`,
        }
      ]
    };

    setProducts(prev => [newProd, ...prev]);
    logActivity('PRODUCT_ADDED', 'PRODUCT', `Added new product: "${newProd.name}" (${newProd.sku})`, newId);

    // If initial stock was provided, create stock movement
    if (newProd.ownStock > 0) {
      addMovementRecord(newProd.id, newProd.name, 'OWN', 'MANUAL_ADJUSTMENT', newProd.ownStock, newProd.ownStock, 'Initial Own Stock on Creation');
    }
    if (newProd.commissionStock > 0) {
      addMovementRecord(newProd.id, newProd.name, 'COMMISSION', 'MANUAL_ADJUSTMENT', newProd.commissionStock, newProd.commissionStock, 'Initial Commission Stock on Creation');
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>, reason?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;

      const now = new Date().toISOString();
      const changeLogs = [...p.changeHistory];
      const detailsArr: string[] = [];

      if (updates.sellingRate !== undefined && updates.sellingRate !== p.sellingRate) {
        detailsArr.push(`Rate changed from ₹${p.sellingRate} to ₹${updates.sellingRate}`);
      }
      if (updates.purchaseRate !== undefined && updates.purchaseRate !== p.purchaseRate) {
        detailsArr.push(`Purchase rate changed from ₹${p.purchaseRate} to ₹${updates.purchaseRate}`);
      }
      if (updates.ownStock !== undefined && updates.ownStock !== p.ownStock) {
        detailsArr.push(`Own stock adjusted from ${p.ownStock} to ${updates.ownStock}`);
      }
      if (updates.commissionStock !== undefined && updates.commissionStock !== p.commissionStock) {
        detailsArr.push(`Commission stock adjusted from ${p.commissionStock} to ${updates.commissionStock}`);
      }
      if (updates.mainImage !== undefined && updates.mainImage !== p.mainImage) {
        detailsArr.push(`Product main image updated`);
      }

      if (detailsArr.length > 0 || reason) {
        changeLogs.unshift({
          id: 'ch-' + Date.now(),
          timestamp: now,
          intern: currentIntern?.name || 'Intern',
          action: 'DETAILS_EDITED',
          details: reason ? `${reason}: ${detailsArr.join(', ')}` : detailsArr.join(', ') || 'Updated product details',
        });
      }

      const updated: Product = {
        ...p,
        ...updates,
        updatedAt: now,
        changeHistory: changeLogs,
      };

      // Auto update status based on stock
      const totalStock = (updates.ownStock ?? p.ownStock) + (updates.commissionStock ?? p.commissionStock);
      const minAlert = updates.minStockAlert ?? p.minStockAlert;
      if (totalStock <= 0) {
        updated.status = 'OUT_OF_STOCK';
      } else if (totalStock <= minAlert) {
        updated.status = 'LOW_STOCK';
      } else {
        updated.status = 'ACTIVE';
      }

      return updated;
    }));

    logActivity('PRODUCT_EDITED', 'PRODUCT', `Edited product ${id}. Reason: ${reason || 'Field updates'}`, id);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    logActivity('PRODUCT_DELETED', 'PRODUCT', `Deleted product "${prod?.name || id}"`, id);
  };

  // Helper to record stock movements
  const addMovementRecord = (
    productId: string,
    productName: string,
    stockType: StockType,
    movementType: MovementType,
    delta: number,
    quantityAfter: number,
    reason: string,
    referenceId?: string
  ) => {
    const newMovement: StockMovement = {
      id: 'mv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      productId,
      productName,
      stockType,
      movementType,
      quantityDelta: delta,
      quantityAfter,
      reason,
      referenceId,
      internEmail: currentIntern?.email || 'intern@caliphschool.com',
      internName: currentIntern?.name || 'Intern',
      timestamp: new Date().toISOString(),
    };
    setStockMovements(prev => [newMovement, ...prev]);
  };

  // Stock Adjustment
  const adjustStock = (
    productId: string,
    stockType: StockType,
    delta: number,
    movementType: MovementType,
    reason: string
  ) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const currentQty = stockType === 'OWN' ? prod.ownStock : prod.commissionStock;
    const newQty = Math.max(0, currentQty + delta);

    updateProduct(productId, {
      [stockType === 'OWN' ? 'ownStock' : 'commissionStock']: newQty
    }, `Manual Adjustment: ${reason}`);

    addMovementRecord(productId, prod.name, stockType, movementType, delta, newQty, reason);
    logActivity('STOCK_ADJUSTED', 'STOCK', `Adjusted ${stockType} stock for ${prod.name} by ${delta > 0 ? '+' : ''}${delta} (${reason})`, productId);
  };

  // Purchases Intake (OWN vs COMMISSION)
  const addPurchase = (data: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt'>) => {
    const nextSeq = purchases.length + 1;
    const purchaseNumber = `PO-2026-${String(nextSeq).padStart(3, '0')}`;
    const now = new Date().toISOString();

    let currentProductsList = [...products];

    const processedItems = data.items.map(item => {
      let existingProd = currentProductsList.find(
        p => (item.productId && p.id === item.productId) || p.name.toLowerCase() === item.productName.trim().toLowerCase()
      );

      if (!existingProd) {
        // Automatically create new product in products catalog if typed name does not exist
        const newProdId = 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        const newProd: Product = {
          id: newProdId,
          sku: 'SKU-' + Math.floor(100000 + Math.random() * 900000),
          name: item.productName.trim(),
          category: 'General',
          unit: 'pcs',
          purchaseRate: item.purchaseRate,
          sellingRate: Math.round(item.purchaseRate * 1.3) || item.purchaseRate,
          ownStock: 0,
          commissionStock: 0,
          minStockAlert: 5,
          images: [],
          mainImage: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60',
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
          changeHistory: [
            {
              id: 'ch-' + Date.now(),
              timestamp: now,
              intern: currentIntern?.name || 'Intern',
              action: 'CREATED',
              details: `Created automatically via Purchase intake (${purchaseNumber})`,
            }
          ]
        };
        currentProductsList = [newProd, ...currentProductsList];
        existingProd = newProd;
      }

      return {
        ...item,
        productId: existingProd.id,
        productName: existingProd.name
      };
    });

    const newPurchase: Purchase = {
      ...data,
      items: processedItems,
      id: 'pur-' + Date.now(),
      purchaseNumber,
      createdAt: now,
    };

    setPurchases(prev => [newPurchase, ...prev]);

    // Update stock for each item if received
    if (newPurchase.status === 'RECEIVED') {
      const updatedProducts = currentProductsList.map(prod => {
        const matchedItem = processedItems.find(it => it.productId === prod.id);
        if (!matchedItem) return prod;

        const currentQty = newPurchase.type === 'OWN' ? prod.ownStock : prod.commissionStock;
        const newQty = currentQty + matchedItem.quantity;
        const isOwn = newPurchase.type === 'OWN';

        const updatedProd: Product = {
          ...prod,
          [isOwn ? 'ownStock' : 'commissionStock']: newQty,
          ...(isOwn ? { purchaseRate: matchedItem.purchaseRate } : {}),
          updatedAt: now,
          status: (newQty + (isOwn ? prod.commissionStock : prod.ownStock)) > 0 ? 'ACTIVE' : prod.status
        };

        addMovementRecord(
          prod.id,
          prod.name,
          newPurchase.type,
          isOwn ? 'OWN_PURCHASE' : 'COMMISSION_PURCHASE',
          matchedItem.quantity,
          newQty,
          `Received in ${purchaseNumber}`,
          purchaseNumber
        );

        return updatedProd;
      });

      setProducts(updatedProducts);
    } else {
      setProducts(currentProductsList);
    }

    logActivity(
      'PURCHASE_ADDED',
      'PURCHASE',
      `Recorded ${newPurchase.type} purchase ${purchaseNumber} from ${newPurchase.supplierOrOwner} for ₹${newPurchase.totalAmount}`,
      newPurchase.id
    );
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logActivity('PURCHASE_UPDATED', 'PURCHASE', `Updated purchase record ${id}`, id);
  };

  const deletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    logActivity('PURCHASE_DELETED', 'PURCHASE', `Deleted purchase record ${id}`, id);
  };

  // Sales Engine (Accurate Commission 10% on Sale Value, Mixed Bills)
  const createSale = (saleData: {
    customerName: string;
    customerPhone?: string;
    isWalkIn: boolean;
    items: {
      productId: string;
      stockType: StockType;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }[];
    discount?: number;
    paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'OTHER';
    notes?: string;
  }): Sale => {
    const nextSeq = sales.length + 1;
    const billNumber = `${settings.billPrefix}${String(nextSeq).padStart(3, '0')}`;
    const now = new Date().toISOString();

    let ownSalesTotal = 0;
    let commissionSalesTotal = 0;
    let commissionEarnedTotal = 0;
    let ownerAmountTotal = 0;
    let totalOwnProfit = 0;

    const saleItems: SaleItem[] = saleData.items.map((it, idx) => {
      const prod = products.find(p => p.id === it.productId);
      const purchaseRate = prod?.purchaseRate || 0;
      const lineTotal = it.quantity * it.unitPrice - (it.discount || 0);

      let commissionRate = 0;
      let commissionEarned = 0;
      let ownerAmount = 0;
      let profitOrCostShare = 0;

      if (it.stockType === 'COMMISSION') {
        // Commission logic: 10% of total sales value
        commissionRate = settings.defaultCommissionRate; // e.g. 10%
        commissionEarned = (lineTotal * commissionRate) / 100;
        ownerAmount = lineTotal - commissionEarned;
        profitOrCostShare = commissionEarned; // Thinkaroo earning is strictly the commission

        commissionSalesTotal += lineTotal;
        commissionEarnedTotal += commissionEarned;
        ownerAmountTotal += ownerAmount;
      } else {
        // Own product logic: normal product profit
        profitOrCostShare = lineTotal - (purchaseRate * it.quantity);
        ownSalesTotal += lineTotal;
        totalOwnProfit += profitOrCostShare;
      }

      return {
        id: `si-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: prod?.name || 'Product',
        sku: prod?.sku || '',
        unit: prod?.unit || 'pcs',
        stockType: it.stockType,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        purchaseRate,
        discount: it.discount || 0,
        lineTotal,
        commissionRate,
        commissionEarned,
        ownerAmount,
        profitOrCostShare,
      };
    });

    const subtotal = saleItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const overallDiscount = saleData.discount || 0;
    const finalTotal = Math.max(0, subtotal - overallDiscount);
    const netThinkarooProfit = totalOwnProfit + commissionEarnedTotal - overallDiscount;

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      billNumber,
      date: now.slice(0, 10),
      customerName: saleData.customerName.trim() || 'Walk-in Customer',
      customerPhone: saleData.customerPhone?.trim(),
      isWalkIn: saleData.isWalkIn,
      items: saleItems,
      subtotal,
      discount: overallDiscount,
      total: finalTotal,
      paymentMethod: saleData.paymentMethod,
      paymentStatus: 'PAID',
      ownSalesTotal,
      commissionSalesTotal,
      commissionEarnedTotal,
      ownerAmountTotal,
      netThinkarooProfit,
      internEmail: currentIntern?.email || 'intern@caliphschool.com',
      internName: currentIntern?.name || 'Intern',
      notes: saleData.notes,
      createdAt: now,
    };

    // Deduct stock accurately from correct source
    saleItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const currentQty = item.stockType === 'OWN' ? prod.ownStock : prod.commissionStock;
        const newQty = Math.max(0, currentQty - item.quantity);

        updateProduct(item.productId, {
          [item.stockType === 'OWN' ? 'ownStock' : 'commissionStock']: newQty
        }, `Sale ${billNumber}`);

        addMovementRecord(
          item.productId,
          item.productName,
          item.stockType,
          'SALE',
          -item.quantity,
          newQty,
          `Sold in Bill #${billNumber}`,
          billNumber
        );
      }
    });

    // Update or create customer
    const cName = newSale.customerName;
    const cPhone = newSale.customerPhone;
    setCustomers(prev => {
      const existing = prev.find(c => 
        cPhone ? c.phone === cPhone : c.name.toLowerCase() === cName.toLowerCase()
      );
      if (existing) {
        return prev.map(c => c.id === existing.id ? {
          ...c,
          totalSpent: c.totalSpent + finalTotal,
          ordersCount: c.ordersCount + 1,
          lastVisit: now,
        } : c);
      } else {
        return [{
          id: 'cust-' + Date.now(),
          name: cName,
          phone: cPhone,
          isWalkIn: saleData.isWalkIn,
          totalSpent: finalTotal,
          ordersCount: 1,
          firstVisit: now,
          lastVisit: now,
        }, ...prev];
      }
    });

    setSales(prev => [newSale, ...prev]);
    logActivity(
      'RECORDED_SALE',
      'SALE',
      `Completed bill ${billNumber} for ₹${finalTotal} (Own: ₹${ownSalesTotal}, Comm: ₹${commissionSalesTotal}, Comm Earned: ₹${commissionEarnedTotal})`,
      newSale.id
    );

    return newSale;
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    logActivity('SALE_UPDATED', 'SALE', `Updated sale ${id}`, id);
  };

  const deleteSale = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;

    // Restore stock
    sale.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const currentQty = item.stockType === 'OWN' ? prod.ownStock : prod.commissionStock;
        const newQty = currentQty + item.quantity;
        updateProduct(item.productId, {
          [item.stockType === 'OWN' ? 'ownStock' : 'commissionStock']: newQty
        }, `Restored from deleted bill ${sale.billNumber}`);

        addMovementRecord(
          item.productId,
          item.productName,
          item.stockType,
          'RETURN',
          item.quantity,
          newQty,
          `Cancelled/Deleted Bill ${sale.billNumber}`,
          sale.billNumber
        );
      }
    });

    setSales(prev => prev.filter(s => s.id !== id));
    logActivity('SALE_DELETED', 'SALE', `Deleted sale ${sale.billNumber} and restored inventory`, id);
  };

  // Expenses
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'recordedByIntern'>) => {
    const newExpense: Expense = {
      ...expense,
      id: 'exp-' + Date.now(),
      recordedByIntern: currentIntern?.name || 'Intern',
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    logActivity('ADDED_EXPENSE', 'EXPENSE', `Logged ${newExpense.category} expense: ₹${newExpense.amount} (${newExpense.note})`, newExpense.id);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    logActivity('UPDATED_EXPENSE', 'EXPENSE', `Updated expense ${id}`, id);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    logActivity('DELETED_EXPENSE', 'EXPENSE', `Deleted expense ${id}`, id);
  };

  // Wastage (Damaged / Expired / Lost)
  const addWastage = (data: Omit<Wastage, 'id' | 'createdAt' | 'recordedByIntern' | 'totalLoss'>) => {
    const totalLoss = data.quantity * data.unitCost;
    const newWastage: Wastage = {
      ...data,
      id: 'wst-' + Date.now(),
      totalLoss,
      recordedByIntern: currentIntern?.name || 'Intern',
      createdAt: new Date().toISOString(),
    };

    // Deduct stock from product
    const prod = products.find(p => p.id === data.productId);
    if (prod) {
      const currentQty = data.stockType === 'OWN' ? prod.ownStock : prod.commissionStock;
      const newQty = Math.max(0, currentQty - data.quantity);

      updateProduct(data.productId, {
        [data.stockType === 'OWN' ? 'ownStock' : 'commissionStock']: newQty
      }, `Wastage logged: ${data.reason}`);

      addMovementRecord(
        data.productId,
        data.productName,
        data.stockType,
        'WASTAGE',
        -data.quantity,
        newQty,
        `Wastage: ${data.reason} (${data.note || 'No note'})`,
        newWastage.id
      );
    }

    setWastages(prev => [newWastage, ...prev]);
    logActivity('RECORDED_WASTAGE', 'WASTAGE', `Recorded wastage of ${data.quantity} units for ${data.productName} (₹${totalLoss} loss)`, newWastage.id);
  };

  const deleteWastage = (id: string) => {
    setWastages(prev => prev.filter(w => w.id !== id));
    logActivity('DELETED_WASTAGE', 'WASTAGE', `Deleted wastage record ${id}`, id);
  };

  // Intern Whitelist Management
  const addIntern = (email: string, name: string, role: 'INTERN' | 'COORDINATOR' | 'ADMIN' = 'INTERN') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@caliphschool.com')) {
      return { success: false, message: 'Please enter a valid Gmail address (@gmail.com or @caliphschool.com).' };
    }
    if (interns.some(i => i.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'This Gmail is already registered in the approved list.' };
    }

    const newIntern: Intern = {
      id: 'intern-' + Date.now(),
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      role,
      status: 'ENABLED',
      addedDate: new Date().toISOString(),
    };

    setInterns(prev => [...prev, newIntern]);
    logActivity('APPROVED_INTERN', 'INTERN', `Approved Gmail account ${cleanEmail} for intern ${newIntern.name}`, newIntern.id);
    return { success: true, message: `Approved ${newIntern.name} successfully!` };
  };

  const toggleInternStatus = (id: string) => {
    setInterns(prev => prev.map(i => {
      if (i.id === id) {
        const nextStatus = i.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
        logActivity('INTERN_STATUS_TOGGLED', 'INTERN', `Toggled intern ${i.name} status to ${nextStatus}`, id);
        return { ...i, status: nextStatus };
      }
      return i;
    }));
  };

  const deleteIntern = (id: string) => {
    const target = interns.find(i => i.id === id);
    if (target?.role === 'ADMIN') {
      alert('Cannot delete primary faculty mentor admin account.');
      return;
    }
    setInterns(prev => prev.filter(i => i.id !== id));
    logActivity('DELETED_INTERN', 'INTERN', `Removed intern ${target?.name || id}`, id);
  };

  // Settings
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logActivity('SETTINGS_UPDATED', 'SETTINGS', 'Updated business configuration settings');
  };

  // Data Reset Options
  const resetDatabase = (mode: 'DEMO' | 'SALES' | 'INVENTORY' | 'FULL') => {
    if (mode === 'DEMO') {
      setProducts(initialProducts);
      setPurchases(initialPurchases);
      setSales(initialSales);
      setCustomers(initialCustomers);
      setExpenses(initialExpenses);
      setWastages(initialWastages);
      setInterns(initialInterns);
      setStockMovements(initialMovements);
      setActivityLogs(initialActivityLogs);
      setSettings(initialSettings);
      logActivity('DATA_RESET_DEMO', 'SETTINGS', 'Reset database to authentic demo data');
    } else if (mode === 'SALES') {
      setSales([]);
      setCustomers([]);
      logActivity('DATA_RESET_SALES', 'SETTINGS', 'Cleared all sales and customer history');
    } else if (mode === 'INVENTORY') {
      setProducts(prev => prev.map(p => ({ ...p, ownStock: 0, commissionStock: 0, status: 'OUT_OF_STOCK' })));
      setPurchases([]);
      setWastages([]);
      setStockMovements([]);
      logActivity('DATA_RESET_INVENTORY', 'SETTINGS', 'Zeroed inventory and cleared purchases');
    } else if (mode === 'FULL') {
      setProducts([]);
      setPurchases([]);
      setSales([]);
      setCustomers([]);
      setExpenses([]);
      setWastages([]);
      setStockMovements([]);
      setActivityLogs([]);
      logActivity('DATA_RESET_FULL', 'SETTINGS', 'Performed full data reset');
    }
  };

  return (
    <DatabaseContext.Provider value={{
      currentIntern,
      isAuthenticated: !!currentIntern,
      isAccessDenied,
      attemptedEmail,
      loginWithGmail,
      logout,
      switchIntern,
      clearAccessDenied,

      products,
      purchases,
      sales,
      customers,
      expenses,
      wastages,
      interns,
      stockMovements,
      activityLogs,
      settings,

      addProduct,
      updateProduct,
      deleteProduct,

      adjustStock,

      addPurchase,
      updatePurchase,
      deletePurchase,

      createSale,
      updateSale,
      deleteSale,

      addExpense,
      updateExpense,
      deleteExpense,

      addWastage,
      deleteWastage,

      addIntern,
      toggleInternStatus,
      deleteIntern,

      updateSettings,
      resetDatabase,
      logActivity,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
