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
  SaleItem,
  PurchaseItem
} from '../types';
import {
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
import {
  supabase,
  isSupabaseConfigured,
  mapProductFromDb,
  mapProductToDb,
  mapPurchaseFromDb,
  mapPurchaseToDb,
  mapSaleFromDb,
  mapSaleToDb,
  mapCustomerFromDb,
  mapCustomerToDb,
  mapExpenseFromDb,
  mapExpenseToDb,
  mapWastageFromDb,
  mapWastageToDb,
  mapInternFromDb,
  mapInternToDb,
  mapStockMovementFromDb,
  mapStockMovementToDb,
  mapActivityLogFromDb,
  mapActivityLogToDb,
  mapSettingsFromDb,
  mapSettingsToDb
} from '../lib/supabase';

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
  isLoadingProducts: boolean;
  refetchProducts: () => Promise<void>;
  refetchAll: () => Promise<void>;

  purchases: Purchase[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
  wastages: Wastage[];
  interns: Intern[];
  stockMovements: StockMovement[];
  activityLogs: ActivityLog[];
  settings: BusinessSettings;

  // Product Operations (Direct Supabase API)
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>) => Promise<{ success: boolean; data?: Product; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>, reason?: string) => Promise<{ success: boolean; data?: Product; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Stock Operations
  adjustStock: (
    productId: string, 
    stockType: StockType, 
    delta: number, 
    movementType: MovementType, 
    reason: string
  ) => Promise<void>;

  // Purchase Operations
  addPurchase: (purchase: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt'>) => Promise<{ success: boolean; data?: Purchase; error?: string }>;
  updatePurchase: (id: string, updates: Partial<Purchase>) => Promise<{ success: boolean; error?: string }>;
  deletePurchase: (id: string) => Promise<{ success: boolean; error?: string }>;

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
  }) => Promise<Sale>;
  updateSale: (id: string, updates: Partial<Sale>) => Promise<{ success: boolean; error?: string }>;
  deleteSale: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Expense Operations
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'recordedByIntern'>) => Promise<{ success: boolean; data?: Expense; error?: string }>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Wastage Operations
  addWastage: (wastage: Omit<Wastage, 'id' | 'createdAt' | 'recordedByIntern' | 'totalLoss'>) => Promise<{ success: boolean; data?: Wastage; error?: string }>;
  deleteWastage: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Customer Operations
  addCustomer: (customer: Omit<Customer, 'id' | 'firstVisit' | 'lastVisit' | 'totalSpent' | 'ordersCount'>) => Promise<{ success: boolean; data?: Customer; error?: string }>;

  // Intern Access Management
  addIntern: (email: string, name: string, role?: 'INTERN' | 'COORDINATOR' | 'ADMIN') => Promise<{ success: boolean; message: string }>;
  toggleInternStatus: (id: string) => Promise<void>;
  updateInternRole: (id: string, role: 'INTERN' | 'COORDINATOR' | 'ADMIN') => Promise<void>;
  deleteIntern: (id: string) => Promise<void>;

  // Settings, Import & Reset
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<void>;
  resetDatabase: (mode: 'DEMO' | 'SALES' | 'INVENTORY' | 'FULL') => void;
  importFullDatabase: (data: any) => void;

  // Helpers
  logActivity: (action: string, entityType: ActivityLog['entityType'], details: string, entityId?: string) => void;
}

const STORAGE_KEYS = {
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
  // Load helper for fallback when Supabase is not configured
  const loadState = <T,>(key: string, defaultVal: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(`Failed to load ${key}`, e);
    }
    return defaultVal;
  };

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // Other Entities State
  const [purchases, setPurchases] = useState<Purchase[]>(() => isSupabaseConfigured ? [] : loadState(STORAGE_KEYS.PURCHASES, initialPurchases));
  const [sales, setSales] = useState<Sale[]>(() => isSupabaseConfigured ? [] : loadState(STORAGE_KEYS.SALES, initialSales));
  const [customers, setCustomers] = useState<Customer[]>(() => isSupabaseConfigured ? [] : loadState(STORAGE_KEYS.CUSTOMERS, initialCustomers));
  const [expenses, setExpenses] = useState<Expense[]>(() => isSupabaseConfigured ? [] : loadState(STORAGE_KEYS.EXPENSES, initialExpenses));
  const [wastages, setWastages] = useState<Wastage[]>(() => isSupabaseConfigured ? [] : loadState(STORAGE_KEYS.WASTAGES, initialWastages));
  // Interns always start from seed data so login works immediately, even before Supabase loads
  const [interns, setInterns] = useState<Intern[]>(() => loadState(STORAGE_KEYS.INTERNS, initialInterns));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => isSupabaseConfigured ? [] : loadState(STORAGE_KEYS.MOVEMENTS, initialMovements));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => isSupabaseConfigured ? [] : loadState(STORAGE_KEYS.ACTIVITY, initialActivityLogs));
  const [settings, setSettings] = useState<BusinessSettings>(() => loadState(STORAGE_KEYS.SETTINGS, initialSettings));

  // Current intern
  const [currentIntern, setCurrentIntern] = useState<Intern | null>(() => {
    const saved = loadState<Intern | null>(STORAGE_KEYS.CURRENT_INTERN, null);
    return saved;
  });

  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [attemptedEmail, setAttemptedEmail] = useState('');

  // Fetch Products directly from Supabase public.products
  const refetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products from Supabase:', error.message);
      } else if (data) {
        setProducts(data.map(mapProductFromDb));
      }
    } catch (err) {
      console.error('Exception fetching products from Supabase:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch ALL tables directly from Supabase
  const refetchAll = async () => {
    setIsLoadingProducts(true);
    try {
      if (!isSupabaseConfigured) return;

      console.log('Fetching all tables from Supabase Cloud...');

      // 1. Products
      const { data: dbProds, error: prodErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodErr) {
        console.error('Error fetching products:', prodErr.message);
      } else if (dbProds) {
        setProducts(dbProds.map(mapProductFromDb));
      }

      // 2. Purchases
      const { data: dbPurchases, error: purErr } = await supabase.from('purchases').select('*').order('created_at', { ascending: false });
      if (purErr) {
        console.error('Error fetching purchases:', purErr.message);
      } else if (dbPurchases) {
        setPurchases(dbPurchases.map(mapPurchaseFromDb));
      }

      // 3. Sales
      const { data: dbSales, error: salesErr } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (salesErr) {
        console.error('Error fetching sales:', salesErr.message);
      } else if (dbSales) {
        setSales(dbSales.map(mapSaleFromDb));
      }

      // 4. Customers
      const { data: dbCust, error: custErr } = await supabase.from('customers').select('*');
      if (custErr) {
        console.error('Error fetching customers:', custErr.message);
      } else if (dbCust) {
        setCustomers(dbCust.map(mapCustomerFromDb));
      }

      // 5. Expenses
      const { data: dbExpenses, error: expErr } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (expErr) {
        console.error('Error fetching expenses:', expErr.message);
      } else if (dbExpenses) {
        setExpenses(dbExpenses.map(mapExpenseFromDb));
      }

      // 6. Wastages
      const { data: dbWastages, error: wstErr } = await supabase.from('wastages').select('*').order('created_at', { ascending: false });
      if (wstErr) {
        console.error('Error fetching wastages:', wstErr.message);
      } else if (dbWastages) {
        setWastages(dbWastages.map(mapWastageFromDb));
      }

      // 7. Interns — if Supabase table is empty, auto-seed with default interns
      const { data: dbInterns, error: intErr } = await supabase.from('interns').select('*');
      if (intErr) {
        console.error('Error fetching interns:', intErr.message);
        // Keep seed data as fallback
      } else if (dbInterns && dbInterns.length > 0) {
        setInterns(dbInterns.map(mapInternFromDb));
      } else {
        // Supabase interns table is empty — seed it with default interns
        console.log('Interns table empty in Supabase, seeding default interns...');
        const seedPayload = initialInterns.map(mapInternToDb);
        const { error: seedErr } = await supabase.from('interns').insert(seedPayload);
        if (seedErr) {
          console.error('Failed to seed interns to Supabase:', seedErr.message);
        } else {
          console.log('Default interns seeded to Supabase successfully.');
        }
        // Keep using the local seed data in state
        setInterns(initialInterns);
      }

      // 8. Stock Movements
      const { data: dbMovements, error: mvErr } = await supabase.from('stock_movements').select('*').order('timestamp', { ascending: false });
      if (mvErr) {
        console.error('Error fetching stock movements:', mvErr.message);
      } else if (dbMovements) {
        setStockMovements(dbMovements.map(mapStockMovementFromDb));
      }

      // 9. Activity Logs
      const { data: dbLogs, error: logErr } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });
      if (logErr) {
        console.error('Error fetching activity logs:', logErr.message);
      } else if (dbLogs) {
        setActivityLogs(dbLogs.map(mapActivityLogFromDb));
      }

      // 10. Business Settings
      const { data: dbSettings, error: setErr } = await supabase.from('business_settings').select('*').single();
      if (setErr) {
        console.error('Error fetching settings:', setErr.message);
      } else if (dbSettings) {
        setSettings(mapSettingsFromDb(dbSettings));
      }
    } catch (err) {
      console.error('Supabase sync exception:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Initial Supabase Data Fetch on mount
  useEffect(() => {
    refetchAll();
  }, []);

  // Save current intern locally for session persistence
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

    if (isSupabaseConfigured) {
      supabase.from('activity_logs').insert(mapActivityLogToDb(newLog)).then(({ error }) => {
        if (error) console.error('Supabase log error:', error.message, error);
      });
    }
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

    const updatedIntern = { ...approved, lastLogin: new Date().toISOString() };
    setInterns(prev => prev.map(i => i.id === approved.id ? updatedIntern : i));
    setCurrentIntern(updatedIntern);
    setIsAccessDenied(false);
    setAttemptedEmail('');

    if (isSupabaseConfigured) {
      supabase.from('interns').update({ last_login: updatedIntern.lastLogin }).eq('id', approved.id).then(({ error }) => {
        if (error) console.error('Supabase intern login update error:', error.message);
      });
    }

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

  // ==========================================
  // PRODUCTS OPERATIONS (Direct Supabase API)
  // ==========================================

  const addProduct = async (
    prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>
  ): Promise<{ success: boolean; data?: Product; error?: string }> => {
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

    if (isSupabaseConfigured) {
      const dbPayload = mapProductToDb(newProd);
      console.log('Inserting product to Supabase:', dbPayload);
      const { data, error } = await supabase
        .from('products')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Product INSERT Error:', error.message, error);
        alert(`Supabase Product Insert Error: ${error.message}`);
        return { success: false, error: error.message };
      }

      const savedProd = mapProductFromDb(data);
      console.log('Successfully inserted product to Supabase:', savedProd);
      setProducts(prev => [savedProd, ...prev]);

      logActivity('PRODUCT_ADDED', 'PRODUCT', `Added new product: "${savedProd.name}" (${savedProd.sku})`, savedProd.id);

      if (savedProd.ownStock > 0) {
        await addMovementRecord(savedProd.id, savedProd.name, 'OWN', 'MANUAL_ADJUSTMENT', savedProd.ownStock, savedProd.ownStock, 'Initial Own Stock on Creation');
      }
      if (savedProd.commissionStock > 0) {
        await addMovementRecord(savedProd.id, savedProd.name, 'COMMISSION', 'MANUAL_ADJUSTMENT', savedProd.commissionStock, savedProd.commissionStock, 'Initial Commission Stock on Creation');
      }

      return { success: true, data: savedProd };
    } else {
      setProducts(prev => [newProd, ...prev]);
      return { success: true, data: newProd };
    }
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Product>,
    reason?: string
  ): Promise<{ success: boolean; data?: Product; error?: string }> => {
    const existing = products.find(p => p.id === id);
    if (!existing) return { success: false, error: 'Product not found' };

    const now = new Date().toISOString();
    const changeLogs = [...existing.changeHistory];
    const detailsArr: string[] = [];

    if (updates.sellingRate !== undefined && updates.sellingRate !== existing.sellingRate) {
      detailsArr.push(`Rate changed from ₹${existing.sellingRate} to ₹${updates.sellingRate}`);
    }
    if (updates.purchaseRate !== undefined && updates.purchaseRate !== existing.purchaseRate) {
      detailsArr.push(`Purchase rate changed from ₹${existing.purchaseRate} to ₹${updates.purchaseRate}`);
    }
    if (updates.ownStock !== undefined && updates.ownStock !== existing.ownStock) {
      detailsArr.push(`Own stock adjusted from ${existing.ownStock} to ${updates.ownStock}`);
    }
    if (updates.commissionStock !== undefined && updates.commissionStock !== existing.commissionStock) {
      detailsArr.push(`Commission stock adjusted from ${existing.commissionStock} to ${updates.commissionStock}`);
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
      ...existing,
      ...updates,
      updatedAt: now,
      changeHistory: changeLogs,
    };

    const totalStock = (updates.ownStock ?? existing.ownStock) + (updates.commissionStock ?? existing.commissionStock);
    const minAlert = updates.minStockAlert ?? existing.minStockAlert;
    if (totalStock <= 0) {
      updated.status = 'OUT_OF_STOCK';
    } else if (totalStock <= minAlert) {
      updated.status = 'LOW_STOCK';
    } else {
      updated.status = 'ACTIVE';
    }

    if (isSupabaseConfigured) {
      const dbPayload = mapProductToDb(updated);
      const { data, error } = await supabase
        .from('products')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase Product UPDATE Error:', error.message, error);
        alert(`Supabase Product Update Error: ${error.message}`);
        return { success: false, error: error.message };
      }

      const savedProd = mapProductFromDb(data);
      setProducts(prev => prev.map(p => p.id === id ? savedProd : p));
      logActivity('PRODUCT_EDITED', 'PRODUCT', `Edited product ${id}. Reason: ${reason || 'Field updates'}`, id);

      return { success: true, data: savedProd };
    } else {
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return { success: true, data: updated };
    }
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const prod = products.find(p => p.id === id);

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase Product DELETE Error:', error.message, error);
        alert(`Supabase Product Delete Error: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    logActivity('PRODUCT_DELETED', 'PRODUCT', `Deleted product "${prod?.name || id}"`, id);

    return { success: true };
  };

  // Helper to record stock movements
  const addMovementRecord = async (
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

    if (isSupabaseConfigured) {
      const dbPayload = mapStockMovementToDb(newMovement);
      const { data, error } = await supabase
        .from('stock_movements')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Stock Movement INSERT Error:', error.message, error);
      } else if (data) {
        const saved = mapStockMovementFromDb(data);
        setStockMovements(prev => [saved, ...prev]);
        return;
      }
    }

    setStockMovements(prev => [newMovement, ...prev]);
  };

  // Stock Adjustment
  const adjustStock = async (
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

    await updateProduct(productId, {
      [stockType === 'OWN' ? 'ownStock' : 'commissionStock']: newQty
    }, `Manual Adjustment: ${reason}`);

    await addMovementRecord(productId, prod.name, stockType, movementType, delta, newQty, reason);
    logActivity('STOCK_ADJUSTED', 'STOCK', `Adjusted ${stockType} stock for ${prod.name} by ${delta > 0 ? '+' : ''}${delta} (${reason})`, productId);
  };

  // Purchases Intake
  const addPurchase = async (data: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt'>): Promise<{ success: boolean; data?: Purchase; error?: string }> => {
    const nextSeq = purchases.length + 1;
    const purchaseNumber = `PO-2026-${String(nextSeq).padStart(3, '0')}`;
    const now = new Date().toISOString();

    let currentProductsList = [...products];
    const processedItems: PurchaseItem[] = [];

    for (const item of data.items) {
      let existingProd = currentProductsList.find(
        p => (item.productId && p.id === item.productId) || p.name.toLowerCase() === item.productName.trim().toLowerCase()
      );

      if (!existingProd) {
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

        if (isSupabaseConfigured) {
          const { error: prodErr } = await supabase.from('products').insert(mapProductToDb(newProd));
          if (prodErr) console.error('Supabase Product Auto-Creation Error:', prodErr.message, prodErr);
        }
      }

      processedItems.push({
        ...item,
        productId: existingProd.id,
        productName: existingProd.name
      });
    }

    const newPurchase: Purchase = {
      ...data,
      items: processedItems,
      id: 'pur-' + Date.now(),
      purchaseNumber,
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      const dbPayload = mapPurchaseToDb(newPurchase);
      console.log('Inserting purchase to Supabase:', dbPayload);
      const { data: insertedData, error } = await supabase
        .from('purchases')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Purchase INSERT Error:', error.message, error);
        alert(`Supabase Purchase Insert Error: ${error.message}`);
        return { success: false, error: error.message };
      }

      const saved = mapPurchaseFromDb(insertedData);
      console.log('Successfully inserted purchase to Supabase:', saved);
      setPurchases(prev => [saved, ...prev]);

      if (newPurchase.status === 'RECEIVED') {
        for (const prod of currentProductsList) {
          const matchedItem = processedItems.find(it => it.productId === prod.id);
          if (!matchedItem) continue;

          const currentQty = newPurchase.type === 'OWN' ? prod.ownStock : prod.commissionStock;
          const newQty = currentQty + matchedItem.quantity;
          const isOwn = newPurchase.type === 'OWN';

          await updateProduct(prod.id, {
            [isOwn ? 'ownStock' : 'commissionStock']: newQty,
            ...(isOwn ? { purchaseRate: matchedItem.purchaseRate } : {})
          }, `Received in ${purchaseNumber}`);

          await addMovementRecord(
            prod.id,
            prod.name,
            newPurchase.type,
            isOwn ? 'OWN_PURCHASE' : 'COMMISSION_PURCHASE',
            matchedItem.quantity,
            newQty,
            `Received in ${purchaseNumber}`,
            purchaseNumber
          );
        }
      }

      logActivity(
        'PURCHASE_ADDED',
        'PURCHASE',
        `Recorded ${saved.type} purchase ${purchaseNumber} from ${saved.supplierOrOwner} for ₹${saved.totalAmount}`,
        saved.id
      );
      return { success: true, data: saved };
    } else {
      setPurchases(prev => [newPurchase, ...prev]);
      logActivity(
        'PURCHASE_ADDED',
        'PURCHASE',
        `Recorded ${newPurchase.type} purchase ${purchaseNumber} from ${newPurchase.supplierOrOwner} for ₹${newPurchase.totalAmount}`,
        newPurchase.id
      );
      return { success: true, data: newPurchase };
    }
  };

  const updatePurchase = async (id: string, updates: Partial<Purchase>): Promise<{ success: boolean; error?: string }> => {
    const existing = purchases.find(p => p.id === id);
    if (!existing) return { success: false, error: 'Purchase not found' };

    const updated = { ...existing, ...updates };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('purchases').update(mapPurchaseToDb(updated as any)).eq('id', id);
      if (error) {
        console.error('Supabase Purchase UPDATE Error:', error.message, error);
        alert(`Supabase Purchase Update Error: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    setPurchases(prev => prev.map(p => p.id === id ? updated : p));
    logActivity('PURCHASE_UPDATED', 'PURCHASE', `Updated purchase record ${id}`, id);
    return { success: true };
  };

  const deletePurchase = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('purchases').delete().eq('id', id);
      if (error) {
        console.error('Supabase Purchase DELETE Error:', error.message, error);
        alert(`Supabase Purchase Delete Error: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    setPurchases(prev => prev.filter(p => p.id !== id));
    logActivity('PURCHASE_DELETED', 'PURCHASE', `Deleted purchase record ${id}`, id);
    return { success: true };
  };

  // Sales Engine
  const createSale = async (saleData: {
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
  }): Promise<Sale> => {
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
        commissionRate = settings.defaultCommissionRate;
        commissionEarned = (lineTotal * commissionRate) / 100;
        ownerAmount = lineTotal - commissionEarned;
        profitOrCostShare = commissionEarned;

        commissionSalesTotal += lineTotal;
        commissionEarnedTotal += commissionEarned;
        ownerAmountTotal += ownerAmount;
      } else {
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

    let savedSale = newSale;

    if (isSupabaseConfigured) {
      const dbPayload = mapSaleToDb(newSale);
      console.log('Inserting sale to Supabase:', dbPayload);
      const { data, error } = await supabase
        .from('sales')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Sale INSERT Error:', error.message, error);
        alert(`Supabase Sale Insert Error: ${error.message}`);
        throw new Error(`Supabase Sale Insert Error: ${error.message}`);
      }

      savedSale = mapSaleFromDb(data);
      console.log('Successfully inserted sale to Supabase:', savedSale);
    }

    // Deduct stock accurately in Supabase
    for (const item of saleItems) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const currentQty = item.stockType === 'OWN' ? prod.ownStock : prod.commissionStock;
        const newQty = Math.max(0, currentQty - item.quantity);

        await updateProduct(item.productId, {
          [item.stockType === 'OWN' ? 'ownStock' : 'commissionStock']: newQty
        }, `Sale ${billNumber}`);

        await addMovementRecord(
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
    }

    // Customer record
    const cName = savedSale.customerName;
    const cPhone = savedSale.customerPhone;
    const existingCust = customers.find(c =>
      cPhone ? c.phone === cPhone : c.name.toLowerCase() === cName.toLowerCase()
    );

    if (existingCust) {
      const updatedCust = {
        ...existingCust,
        totalSpent: existingCust.totalSpent + finalTotal,
        ordersCount: existingCust.ordersCount + 1,
        lastVisit: now,
      };
      if (isSupabaseConfigured) {
        const { error: custErr } = await supabase
          .from('customers')
          .update(mapCustomerToDb(updatedCust))
          .eq('id', existingCust.id);
        if (custErr) console.error('Supabase Customer UPDATE Error:', custErr.message, custErr);
      }
      setCustomers(prev => prev.map(c => c.id === existingCust.id ? updatedCust : c));
    } else {
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        name: cName,
        phone: cPhone,
        isWalkIn: saleData.isWalkIn,
        totalSpent: finalTotal,
        ordersCount: 1,
        firstVisit: now,
        lastVisit: now,
      };
      if (isSupabaseConfigured) {
        const { error: custErr } = await supabase
          .from('customers')
          .insert(mapCustomerToDb(newCust));
        if (custErr) console.error('Supabase Customer INSERT Error:', custErr.message, custErr);
      }
      setCustomers(prev => [newCust, ...prev]);
    }

    setSales(prev => [savedSale, ...prev]);

    // ── Intern Commission: 10% of total selling price for all items in this bill ──
    // Commission = 10% × (quantity × unitPrice) per item (NOT margin-based)
    const internSellingTotal = saleItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const internCommissionEarned = parseFloat((internSellingTotal * 0.1).toFixed(2));

    if (currentIntern && internCommissionEarned > 0) {
      const updatedBalance = parseFloat(
        ((currentIntern.commissionBalance ?? 0) + internCommissionEarned).toFixed(2)
      );
      const updatedInternLocal = { ...currentIntern, commissionBalance: updatedBalance };

      // Update local state for current intern and interns list
      setCurrentIntern(updatedInternLocal);
      setInterns(prev =>
        prev.map(i => i.id === currentIntern.id ? updatedInternLocal : i)
      );

      // Persist to Supabase
      if (isSupabaseConfigured) {
        supabase
          .from('interns')
          .update({ commission_balance: updatedBalance })
          .eq('id', currentIntern.id)
          .then(({ error }) => {
            if (error) {
              console.error('Supabase Intern Commission Update Error:', error.message, error);
            }
          });
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    logActivity(
      'RECORDED_SALE',
      'SALE',
      `Completed bill ${billNumber} for ₹${finalTotal} (Own: ₹${ownSalesTotal}, Comm: ₹${commissionSalesTotal}, Comm Earned: ₹${commissionEarnedTotal}, Intern Commission: ₹${internCommissionEarned})`,
      savedSale.id
    );

    return savedSale;
  };

  const updateSale = async (id: string, updates: Partial<Sale>): Promise<{ success: boolean; error?: string }> => {
    const existing = sales.find(s => s.id === id);
    if (!existing) return { success: false, error: 'Sale not found' };

    const updated = { ...existing, ...updates };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('sales').update(mapSaleToDb(updated as any)).eq('id', id);
      if (error) {
        console.error('Supabase Sale UPDATE Error:', error.message, error);
        alert(`Supabase Sale Update Error: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    setSales(prev => prev.map(s => s.id === id ? updated : s));
    logActivity('SALE_UPDATED', 'SALE', `Updated sale ${id}`, id);
    return { success: true };
  };

  const deleteSale = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return { success: false, error: 'Sale not found' };

    for (const item of sale.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const currentQty = item.stockType === 'OWN' ? prod.ownStock : prod.commissionStock;
        const newQty = currentQty + item.quantity;
        await updateProduct(item.productId, {
          [item.stockType === 'OWN' ? 'ownStock' : 'commissionStock']: newQty
        }, `Restored from deleted bill ${sale.billNumber}`);

        await addMovementRecord(
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
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) {
        console.error('Supabase Sale DELETE Error:', error.message, error);
        alert(`Supabase Sale Delete Error: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    setSales(prev => prev.filter(s => s.id !== id));
    logActivity('SALE_DELETED', 'SALE', `Deleted sale ${sale.billNumber} and restored inventory`, id);
    return { success: true };
  };

  // Expense Operations
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'recordedByIntern'>): Promise<{ success: boolean; data?: Expense; error?: string }> => {
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
      recordedByIntern: currentIntern?.name || 'Intern',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const dbPayload = mapExpenseToDb(newExpense);
      console.log('Inserting expense to Supabase:', dbPayload);
      const { data, error } = await supabase
        .from('expenses')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Expense INSERT Error:', error.message, error);
        alert(`Supabase Expense Insert Error: ${error.message}`);
        return { success: false, error: error.message };
      }

      const savedExpense = mapExpenseFromDb(data);
      console.log('Successfully inserted expense to Supabase:', savedExpense);
      setExpenses(prev => [savedExpense, ...prev]);
      logActivity('ADDED_EXPENSE', 'EXPENSE', `Logged ${savedExpense.category} expense: ₹${savedExpense.amount} (${savedExpense.note})`, savedExpense.id);
      return { success: true, data: savedExpense };
    } else {
      setExpenses(prev => [newExpense, ...prev]);
      logActivity('ADDED_EXPENSE', 'EXPENSE', `Logged ${newExpense.category} expense: ₹${newExpense.amount} (${newExpense.note})`, newExpense.id);
      return { success: true, data: newExpense };
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>): Promise<{ success: boolean; error?: string }> => {
    const existing = expenses.find(e => e.id === id);
    if (!existing) return { success: false, error: 'Expense not found' };

    const updated = { ...existing, ...updates };

    if (isSupabaseConfigured) {
      const dbPayload = mapExpenseToDb(updated);
      const { data, error } = await supabase
        .from('expenses')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase Expense UPDATE Error:', error.message, error);
        alert(`Supabase Expense Update Error: ${error.message}`);
        return { success: false, error: error.message };
      }

      const saved = mapExpenseFromDb(data);
      setExpenses(prev => prev.map(e => e.id === id ? saved : e));
      logActivity('UPDATED_EXPENSE', 'EXPENSE', `Updated expense ${id}`, id);
      return { success: true };
    } else {
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
      logActivity('UPDATED_EXPENSE', 'EXPENSE', `Updated expense ${id}`, id);
      return { success: true };
    }
  };

  const deleteExpense = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) {
        console.error('Supabase Expense DELETE Error:', error.message, error);
        alert(`Supabase Expense Delete Error: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    setExpenses(prev => prev.filter(e => e.id !== id));
    logActivity('DELETED_EXPENSE', 'EXPENSE', `Deleted expense ${id}`, id);
    return { success: true };
  };

  // Wastage Operations
  const addWastage = async (data: Omit<Wastage, 'id' | 'createdAt' | 'recordedByIntern' | 'totalLoss'>): Promise<{ success: boolean; data?: Wastage; error?: string }> => {
    const totalLoss = data.quantity * data.unitCost;
    const newWastage: Wastage = {
      ...data,
      id: 'wst-' + Date.now(),
      totalLoss,
      recordedByIntern: currentIntern?.name || 'Intern',
      createdAt: new Date().toISOString(),
    };

    const prod = products.find(p => p.id === data.productId);
    if (prod) {
      const currentQty = data.stockType === 'OWN' ? prod.ownStock : prod.commissionStock;
      const newQty = Math.max(0, currentQty - data.quantity);

      await updateProduct(data.productId, {
        [data.stockType === 'OWN' ? 'ownStock' : 'commissionStock']: newQty
      }, `Wastage logged: ${data.reason}`);

      await addMovementRecord(
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

    if (isSupabaseConfigured) {
      const dbPayload = mapWastageToDb(newWastage);
      console.log('Inserting wastage to Supabase:', dbPayload);
      const { data: insertedData, error } = await supabase
        .from('wastages')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Wastage INSERT Error:', error.message, error);
        alert(`Supabase Wastage Insert Error: ${error.message}`);
        return { success: false, error: error.message };
      }

      const saved = mapWastageFromDb(insertedData);
      console.log('Successfully inserted wastage to Supabase:', saved);
      setWastages(prev => [saved, ...prev]);
      logActivity('RECORDED_WASTAGE', 'WASTAGE', `Recorded wastage of ${data.quantity} units for ${data.productName} (₹${totalLoss} loss)`, saved.id);
      return { success: true, data: saved };
    } else {
      setWastages(prev => [newWastage, ...prev]);
      logActivity('RECORDED_WASTAGE', 'WASTAGE', `Recorded wastage of ${data.quantity} units for ${data.productName} (₹${totalLoss} loss)`, newWastage.id);
      return { success: true, data: newWastage };
    }
  };

  const deleteWastage = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('wastages').delete().eq('id', id);
      if (error) {
        console.error('Supabase Wastage DELETE Error:', error.message, error);
        alert(`Supabase Wastage Delete Error: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    setWastages(prev => prev.filter(w => w.id !== id));
    logActivity('DELETED_WASTAGE', 'WASTAGE', `Deleted wastage record ${id}`, id);
    return { success: true };
  };

  // Customer Operations
  const addCustomer = async (custData: Omit<Customer, 'id' | 'firstVisit' | 'lastVisit' | 'totalSpent' | 'ordersCount'>): Promise<{ success: boolean; data?: Customer; error?: string }> => {
    const now = new Date().toISOString();
    const newCust: Customer = {
      ...custData,
      id: 'cust-' + Date.now(),
      totalSpent: 0,
      ordersCount: 0,
      firstVisit: now,
      lastVisit: now,
    };

    if (isSupabaseConfigured) {
      const dbPayload = mapCustomerToDb(newCust);
      console.log('Inserting customer to Supabase:', dbPayload);
      const { data, error } = await supabase
        .from('customers')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Customer INSERT Error:', error.message, error);
        alert(`Supabase Customer Insert Error: ${error.message}`);
        return { success: false, error: error.message };
      }

      const saved = mapCustomerFromDb(data);
      console.log('Successfully inserted customer to Supabase:', saved);
      setCustomers(prev => [saved, ...prev]);
      logActivity('ADDED_CUSTOMER', 'AUTH', `Added new customer: ${saved.name}`, saved.id);
      return { success: true, data: saved };
    } else {
      setCustomers(prev => [newCust, ...prev]);
      logActivity('ADDED_CUSTOMER', 'AUTH', `Added new customer: ${newCust.name}`, newCust.id);
      return { success: true, data: newCust };
    }
  };

  // Intern Management
  const addIntern = async (email: string, name: string, role: 'INTERN' | 'COORDINATOR' | 'ADMIN' = 'INTERN'): Promise<{ success: boolean; message: string }> => {
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
      commissionBalance: 0,
    };

    if (isSupabaseConfigured) {
      const dbPayload = mapInternToDb(newIntern);
      console.log('Inserting intern to Supabase:', dbPayload);
      const { data: insertedData, error } = await supabase
        .from('interns')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Intern INSERT Error:', error.message, error);
        alert(`Supabase Intern Insert Error: ${error.message}`);
        return { success: false, message: `Failed to insert intern in Supabase: ${error.message}` };
      }

      const saved = mapInternFromDb(insertedData);
      console.log('Successfully inserted intern to Supabase:', saved);
      setInterns(prev => [...prev, saved]);
      logActivity('APPROVED_INTERN', 'INTERN', `Approved Gmail account ${cleanEmail} for intern ${saved.name}`, saved.id);
      return { success: true, message: `Approved ${saved.name} successfully!` };
    } else {
      setInterns(prev => [...prev, newIntern]);
      logActivity('APPROVED_INTERN', 'INTERN', `Approved Gmail account ${cleanEmail} for intern ${newIntern.name}`, newIntern.id);
      return { success: true, message: `Approved ${newIntern.name} successfully!` };
    }
  };

  const toggleInternStatus = async (id: string) => {
    const target = interns.find(i => i.id === id);
    if (!target) return;

    const nextStatus = target.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('interns').update({ status: nextStatus }).eq('id', id);
      if (error) console.error('Supabase Intern Status Update Error:', error.message, error);
    }

    setInterns(prev => prev.map(i => i.id === id ? { ...i, status: nextStatus } : i));
    logActivity('INTERN_STATUS_TOGGLED', 'INTERN', `Toggled intern ${target.name} status to ${nextStatus}`, id);
  };

  const updateInternRole = async (id: string, role: 'INTERN' | 'COORDINATOR' | 'ADMIN') => {
    const target = interns.find(i => i.id === id);
    if (!target) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('interns').update({ role }).eq('id', id);
      if (error) console.error('Supabase Intern Role Update Error:', error.message, error);
    }

    setInterns(prev => prev.map(i => i.id === id ? { ...i, role } : i));
    logActivity('INTERN_ROLE_UPDATED', 'INTERN', `Updated role for ${target.name} to ${role}`, id);
  };

  const deleteIntern = async (id: string) => {
    const target = interns.find(i => i.id === id);
    if (target?.role === 'ADMIN') {
      alert('Cannot delete primary faculty mentor admin account.');
      return;
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('interns').delete().eq('id', id);
      if (error) console.error('Supabase Intern Delete Error:', error.message, error);
    }

    setInterns(prev => prev.filter(i => i.id !== id));
    logActivity('DELETED_INTERN', 'INTERN', `Removed intern ${target?.name || id}`, id);
  };

  // Settings
  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (isSupabaseConfigured) {
      const dbPayload = mapSettingsToDb(updated);
      const { error } = await supabase.from('business_settings').upsert(dbPayload);
      if (error) console.error('Supabase Settings Upsert Error:', error.message, error);
    }

    logActivity('SETTINGS_UPDATED', 'SETTINGS', 'Updated business configuration settings');
  };

  // Full Import
  const importFullDatabase = (data: any) => {
    if (data.purchases && Array.isArray(data.purchases)) setPurchases(data.purchases);
    if (data.sales && Array.isArray(data.sales)) setSales(data.sales);
    if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
    if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
    if (data.wastages && Array.isArray(data.wastages)) setWastages(data.wastages);
    if (data.interns && Array.isArray(data.interns)) setInterns(data.interns);
    if (data.stockMovements && Array.isArray(data.stockMovements)) setStockMovements(data.stockMovements);
    if (data.activityLogs && Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
    if (data.settings && typeof data.settings === 'object') setSettings(data.settings);

    logActivity('DATABASE_RESTORED', 'SETTINGS', 'Restored database from external JSON backup file');
  };

  // Data Reset Options
  const resetDatabase = (mode: 'DEMO' | 'SALES' | 'INVENTORY' | 'FULL') => {
    if (mode === 'DEMO') {
      refetchAll();
      logActivity('DATA_RESET_DEMO', 'SETTINGS', 'Reset database to authentic demo data');
    } else if (mode === 'SALES') {
      setSales([]);
      setCustomers([]);
      logActivity('DATA_RESET_SALES', 'SETTINGS', 'Cleared all sales and customer history');
    } else if (mode === 'INVENTORY') {
      setPurchases([]);
      setWastages([]);
      setStockMovements([]);
      logActivity('DATA_RESET_INVENTORY', 'SETTINGS', 'Zeroed inventory and cleared purchases');
    } else if (mode === 'FULL') {
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
      isLoadingProducts,
      refetchProducts,
      refetchAll,

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

      addCustomer,

      addIntern,
      toggleInternStatus,
      updateInternRole,
      deleteIntern,

      updateSettings,
      resetDatabase,
      importFullDatabase,
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
