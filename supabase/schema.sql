-- THINKAROO ERP — Supabase Database Schema & RLS Policies Script
-- Run this script in your Supabase SQL Editor to create all required tables and permissions.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'pcs',
  purchase_rate NUMERIC(12,2) DEFAULT 0,
  selling_rate NUMERIC(12,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_percent NUMERIC(5,2) DEFAULT 0,
  own_stock INTEGER DEFAULT 0,
  commission_stock INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  images JSONB DEFAULT '[]'::jsonb,
  main_image TEXT,
  status TEXT DEFAULT 'ACTIVE',
  change_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
  id TEXT PRIMARY KEY,
  purchase_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  supplier_or_owner TEXT NOT NULL,
  commission_rate NUMERIC(5,2) DEFAULT 10,
  date TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'RECEIVED',
  notes TEXT,
  received_by_intern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  bill_number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  is_walk_in BOOLEAN DEFAULT TRUE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'CASH',
  payment_status TEXT DEFAULT 'PAID',
  own_sales_total NUMERIC(12,2) DEFAULT 0,
  commission_sales_total NUMERIC(12,2) DEFAULT 0,
  commission_earned_total NUMERIC(12,2) DEFAULT 0,
  owner_amount_total NUMERIC(12,2) DEFAULT 0,
  net_thinkaroo_profit NUMERIC(12,2) DEFAULT 0,
  intern_email TEXT,
  intern_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_walk_in BOOLEAN DEFAULT FALSE,
  total_spent NUMERIC(12,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  recorded_by_intern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WASTAGES TABLE
CREATE TABLE IF NOT EXISTS public.wastages (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_name TEXT NOT NULL,
  stock_type TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  total_loss NUMERIC(12,2) DEFAULT 0,
  reason TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  recorded_by_intern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INTERNS TABLE
CREATE TABLE IF NOT EXISTS public.interns (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'INTERN',
  status TEXT DEFAULT 'ENABLED',
  added_date TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  commission_balance NUMERIC(12,2) DEFAULT 0
);

-- Add commission_balance column if it doesn't already exist (for existing installs)
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS commission_balance NUMERIC(12,2) DEFAULT 0;

-- 8. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_name TEXT NOT NULL,
  stock_type TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  quantity_delta NUMERIC(10,2) NOT NULL,
  quantity_after NUMERIC(10,2) NOT NULL,
  reference_id TEXT,
  reason TEXT,
  intern_email TEXT,
  intern_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  intern_email TEXT NOT NULL,
  intern_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT
);

-- 10. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.business_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  business_name TEXT DEFAULT 'THINKAROO',
  school_name TEXT DEFAULT 'Caliph Life School',
  tagline TEXT DEFAULT 'Student Entrepreneurship Enterprise',
  phone TEXT DEFAULT '+91 98765 43210',
  email TEXT DEFAULT 'thinkaroo@caliphschool.com',
  address TEXT DEFAULT 'Caliph Life School Campus, Kerala',
  default_commission_rate NUMERIC(5,2) DEFAULT 10,
  currency_symbol TEXT DEFAULT '₹',
  categories JSONB DEFAULT '["Notebooks & Planners","Writing Instruments","Art & Craft Supplies","Caliph School Merchandise","Books & Educational Kits","Desk Accessories"]'::jsonb,
  payment_methods JSONB DEFAULT '["CASH","UPI","CARD","OTHER"]'::jsonb,
  bill_prefix TEXT DEFAULT 'TK-INV-',
  bill_footer_message TEXT DEFAULT 'Thank you for supporting student entrepreneurship at Caliph Life School!',
  show_school_name_on_bill BOOLEAN DEFAULT TRUE,
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wastages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Allow public & authenticated users full Data API access for Thinkaroo ERP Operations
DROP POLICY IF EXISTS "Allow public full access to products" ON public.products;
CREATE POLICY "Allow public full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to purchases" ON public.purchases;
CREATE POLICY "Allow public full access to purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to sales" ON public.sales;
CREATE POLICY "Allow public full access to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to customers" ON public.customers;
CREATE POLICY "Allow public full access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to expenses" ON public.expenses;
CREATE POLICY "Allow public full access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to wastages" ON public.wastages;
CREATE POLICY "Allow public full access to wastages" ON public.wastages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to interns" ON public.interns;
CREATE POLICY "Allow public full access to interns" ON public.interns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to stock_movements" ON public.stock_movements;
CREATE POLICY "Allow public full access to stock_movements" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to activity_logs" ON public.activity_logs;
CREATE POLICY "Allow public full access to activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to business_settings" ON public.business_settings;
CREATE POLICY "Allow public full access to business_settings" ON public.business_settings FOR ALL USING (true) WITH CHECK (true);
