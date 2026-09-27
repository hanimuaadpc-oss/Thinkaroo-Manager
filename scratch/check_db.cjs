const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)?.[1]?.trim() || env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

async function checkRows() {
  console.log('Target Supabase URL:', url);
  const tables = ['products', 'purchases', 'sales', 'customers', 'expenses', 'wastages', 'interns', 'stock_movements', 'activity_logs', 'business_settings'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.log(table + ' ERROR:', error.message);
    } else {
      console.log(`\n=== Table: '${table}' (${data.length} rows) ===`);
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

checkRows().catch(err => console.error(err));
