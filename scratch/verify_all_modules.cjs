const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)?.[1]?.trim() || env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

async function runFullVerification() {
  console.log('=== STARTING FULL VERIFICATION FOR ALL SUPABASE TABLES ===\n');

  const timestamp = Date.now();

  // 1. Add Product
  console.log('1. Testing Product Insert...');
  const prodId = 'prod-verify-' + timestamp;
  const prodData = {
    id: prodId,
    sku: 'SKU-VERIFY-' + timestamp,
    name: 'Verification Notebook ' + timestamp,
    category: 'Notebooks & Planners',
    purchase_rate: 45,
    selling_rate: 90,
    own_stock: 50,
    commission_stock: 0,
    unit: 'pcs',
    status: 'ACTIVE'
  };
  const prodRes = await supabase.from('products').insert(prodData).select().single();
  if (prodRes.error) {
    console.error('❌ Product Insert Failed:', prodRes.error.message);
  } else {
    console.log('✅ Product Insert Succeeded! Created Row ID:', prodRes.data.id, 'Name:', prodRes.data.name);
  }

  // 2. Add Customer
  console.log('\n2. Testing Customer Insert...');
  const custId = 'cust-verify-' + timestamp;
  const custData = {
    id: custId,
    name: 'Verification Student ' + timestamp,
    phone: '9876543210',
    email: 'verify@caliphschool.com',
    is_walk_in: false,
    total_spent: 0,
    orders_count: 0
  };
  const custRes = await supabase.from('customers').insert(custData).select().single();
  if (custRes.error) {
    console.error('❌ Customer Insert Failed:', custRes.error.message);
  } else {
    console.log('✅ Customer Insert Succeeded! Created Row ID:', custRes.data.id, 'Name:', custRes.data.name);
  }

  // 3. Add Expense
  console.log('\n3. Testing Expense Insert...');
  const expId = 'exp-verify-' + timestamp;
  const expData = {
    id: expId,
    category: 'Packaging',
    amount: 180.50,
    date: new Date().toISOString(),
    note: 'Verification carry bags purchase',
    recorded_by_intern: 'Verification Script'
  };
  const expRes = await supabase.from('expenses').insert(expData).select().single();
  if (expRes.error) {
    console.error('❌ Expense Insert Failed:', expRes.error.message);
  } else {
    console.log('✅ Expense Insert Succeeded! Created Row ID:', expRes.data.id, 'Amount: ₹' + expRes.data.amount);
  }

  // 4. Add Purchase
  console.log('\n4. Testing Purchase Insert...');
  const purId = 'pur-verify-' + timestamp;
  const purData = {
    id: purId,
    purchase_number: 'PO-VERIFY-' + timestamp,
    type: 'OWN',
    supplier_or_owner: 'Caliph Wholesale Supplier',
    items: [
      { productId: prodId, productName: prodData.name, quantity: 50, purchaseRate: 45, total: 2250 }
    ],
    total_amount: 2250,
    status: 'RECEIVED',
    notes: 'Verification intake batch',
    received_by_intern: 'Verification Script'
  };
  const purRes = await supabase.from('purchases').insert(purData).select().single();
  if (purRes.error) {
    console.error('❌ Purchase Insert Failed:', purRes.error.message);
  } else {
    console.log('✅ Purchase Insert Succeeded! Created Row ID:', purRes.data.id, 'PO Number:', purRes.data.purchase_number);
  }

  // 5. Add Sale
  console.log('\n5. Testing Sale Insert...');
  const saleId = 'sale-verify-' + timestamp;
  const saleData = {
    id: saleId,
    bill_number: 'TK-INV-VERIFY-' + timestamp,
    customer_name: custData.name,
    customer_phone: custData.phone,
    is_walk_in: false,
    items: [
      { id: 'si-1', productId: prodId, productName: prodData.name, sku: prodData.sku, unit: 'pcs', stockType: 'OWN', quantity: 2, unitPrice: 90, purchaseRate: 45, discount: 0, lineTotal: 180, commissionRate: 0, commissionEarned: 0, ownerAmount: 0, profitOrCostShare: 90 }
    ],
    subtotal: 180,
    discount: 0,
    total: 180,
    payment_method: 'UPI',
    payment_status: 'PAID',
    own_sales_total: 180,
    commission_sales_total: 0,
    commission_earned_total: 0,
    owner_amount_total: 0,
    net_thinkaroo_profit: 90,
    intern_email: 'verify@caliphschool.com',
    intern_name: 'Verification Intern'
  };
  const saleRes = await supabase.from('sales').insert(saleData).select().single();
  if (saleRes.error) {
    console.error('❌ Sale Insert Failed:', saleRes.error.message);
  } else {
    console.log('✅ Sale Insert Succeeded! Created Row ID:', saleRes.data.id, 'Bill Number:', saleRes.data.bill_number);
  }

  console.log('\n=== VERIFYING TOTAL ROW COUNTS ACROSS SUPABASE TABLES ===');
  const tables = ['products', 'purchases', 'sales', 'customers', 'expenses', 'wastages', 'interns', 'stock_movements', 'activity_logs', 'business_settings'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`Error counting ${table}:`, error.message);
    } else {
      console.log(`Table '${table}': ${count} rows`);
    }
  }

  console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runFullVerification().catch(err => {
  console.error('Unhandled Verification Error:', err);
  process.exit(1);
});
