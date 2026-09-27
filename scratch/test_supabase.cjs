const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)?.[1]?.trim() || env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

console.log('Supabase URL:', url);
console.log('Supabase Key:', key ? key.substring(0, 15) + '...' : 'Missing');

const supabase = createClient(url, key);

async function testAll() {
  console.log('\n--- 1. Testing SELECT on all tables ---');
  const tables = [
    'products', 'purchases', 'sales', 'customers',
    'expenses', 'wastages', 'interns', 'stock_movements',
    'activity_logs', 'business_settings'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`SELECT ${table} ERROR:`, error.message, error.code, error.details);
    } else {
      console.log(`SELECT ${table}: ${data ? data.length : 0} rows`);
    }
  }

  console.log('\n--- 2. Testing INSERT into expenses ---');
  const testExp = {
    id: 'exp-test-' + Date.now(),
    category: 'Packaging',
    amount: 250,
    date: new Date().toISOString(),
    note: 'Diagnostic test expense',
    recorded_by_intern: 'Diagnostic Tool'
  };
  const expInsert = await supabase.from('expenses').insert(testExp).select().single();
  console.log('Expense Insert Result:', JSON.stringify(expInsert, null, 2));

  console.log('\n--- 3. Testing INSERT into products ---');
  const testProd = {
    id: 'prod-test-' + Date.now(),
    sku: 'SKU-TEST-' + Date.now(),
    name: 'Diagnostic Test Product',
    category: 'General',
    purchase_rate: 15,
    selling_rate: 30,
    own_stock: 10,
    commission_stock: 0
  };
  const prodInsert = await supabase.from('products').insert(testProd).select().single();
  console.log('Product Insert Result:', JSON.stringify(prodInsert, null, 2));

  console.log('\n--- 4. Testing INSERT into customers ---');
  const testCust = {
    id: 'cust-test-' + Date.now(),
    name: 'Diagnostic Customer',
    phone: '9998887776',
    email: 'test@example.com'
  };
  const custInsert = await supabase.from('customers').insert(testCust).select().single();
  console.log('Customer Insert Result:', JSON.stringify(custInsert, null, 2));
}

testAll().catch(err => console.error('Unhandled script error:', err));
