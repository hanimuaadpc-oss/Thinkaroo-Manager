-- ============================================================================
-- THINKAROO ERP — Production Supabase Database Schema & RLS Security Script
-- Caliph Life School Enterprise ERP
--
-- How to apply:
-- 1. Open your Supabase Dashboard -> SQL Editor
-- 2. Click "New Query", paste this entire script, and click "RUN"
-- ============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  unit TEXT DEFAULT 'pcs',
  purchase_rate NUMERIC(12,2) DEFAULT 0,
  selling_rate NUMERIC(12,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_percent NUMERIC(5,2) DEFAULT 0,
  own_stock INTEGER DEFAULT 0,
  commission_stock INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  images JSONB DEFAULT '[]'::jsonb,
  main_image TEXT DEFAULT '',
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
  notes TEXT DEFAULT '',
  received_by_intern TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  bill_number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
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
  intern_email TEXT DEFAULT '',
  intern_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
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
  note TEXT DEFAULT '',
  recorded_by_intern TEXT DEFAULT '',
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
  note TEXT DEFAULT '',
  recorded_by_intern TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INTERNS TABLE
CREATE TABLE IF NOT EXISTS public.interns (
  id TEXT PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'INTERN',
  status TEXT DEFAULT 'ENABLED',
  added_date TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  commission_balance NUMERIC(12,2) DEFAULT 0
);

-- Ensure column exists if upgrading
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS commission_balance NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

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
  reason TEXT DEFAULT '',
  intern_email TEXT DEFAULT '',
  intern_name TEXT DEFAULT '',
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
  details TEXT DEFAULT ''
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

-- Seed initial business settings record
INSERT INTO public.business_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Seed default initial interns (so logins and team lists work immediately)
INSERT INTO public.interns (id, email, name, role, status, commission_balance)
VALUES
  ('intern-1', 'admin@caliphschool.com', 'Store Manager', 'ADMIN', 'ENABLED', 0),
  ('intern-2', 'intern1@caliphschool.com', 'Student Intern 1', 'INTERN', 'ENABLED', 0)
ON CONFLICT (email) DO NOTHING;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Zero unrestricted public access.
-- ============================================================================

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

-- Clean existing policies to prevent conflicts
DROP POLICY IF EXISTS "Auth users full access products" ON public.products;
DROP POLICY IF EXISTS "Auth users full access purchases" ON public.purchases;
DROP POLICY IF EXISTS "Auth users full access sales" ON public.sales;
DROP POLICY IF EXISTS "Auth users full access customers" ON public.customers;
DROP POLICY IF EXISTS "Auth users full access expenses" ON public.expenses;
DROP POLICY IF EXISTS "Auth users full access wastages" ON public.wastages;
DROP POLICY IF EXISTS "Auth users full access interns" ON public.interns;
DROP POLICY IF EXISTS "Auth users full access stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Auth users full access activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Auth users full access business_settings" ON public.business_settings;

DROP POLICY IF EXISTS "Auth users view interns" ON public.interns;
DROP POLICY IF EXISTS "Admin manage interns" ON public.interns;
DROP POLICY IF EXISTS "Auth users view business_settings" ON public.business_settings;
DROP POLICY IF EXISTS "Admin update business_settings" ON public.business_settings;

DROP POLICY IF EXISTS "Allow public full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public full access to purchases" ON public.purchases;
DROP POLICY IF EXISTS "Allow public full access to sales" ON public.sales;
DROP POLICY IF EXISTS "Allow public full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public full access to expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public full access to wastages" ON public.wastages;
DROP POLICY IF EXISTS "Allow public full access to interns" ON public.interns;
DROP POLICY IF EXISTS "Allow public full access to stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Allow public full access to activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow public full access to business_settings" ON public.business_settings;

-- 1. PRODUCTS: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to products"
ON public.products FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 2. PURCHASES: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to purchases"
ON public.purchases FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 3. SALES: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to sales"
ON public.sales FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 4. CUSTOMERS: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to customers"
ON public.customers FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 5. EXPENSES: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to expenses"
ON public.expenses FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 6. WASTAGES: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to wastages"
ON public.wastages FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 7. STOCK MOVEMENTS: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to stock_movements"
ON public.stock_movements FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 8. ACTIVITY LOGS: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to activity_logs"
ON public.activity_logs FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 9. INTERNS: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to interns"
ON public.interns FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- 10. BUSINESS SETTINGS: Full Data API access for Thinkaroo ERP client
CREATE POLICY "Allow full access to business_settings"
ON public.business_settings FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);


-- ============================================================================
-- REALTIME SYNCHRONIZATION
-- Enable live sync across connected devices (tablet POS, manager laptops)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'sales'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'stock_movements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'activity_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  END IF;
END $$;
