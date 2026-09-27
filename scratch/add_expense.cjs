const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/)?.[1]?.trim() || env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

async function addTestExpense() {
  console.log('Inserting row into public.expenses at URL:', url);
  const { data, error } = await supabase.from('expenses').insert({
    id: 'exp-' + Date.now(),
    category: 'Packaging',
    amount: 350.00,
    date: new Date().toISOString(),
    note: 'Office Packaging Carry Bags',
    recorded_by_intern: 'Hani'
  }).select().single();

  if (error) {
    console.error('Error inserting expense:', error);
  } else {
    console.log('✅ Expense inserted successfully:', data);
  }

  const { data: allExp } = await supabase.from('expenses').select('*');
  console.log('Current rows in public.expenses:', allExp ? allExp.length : 0);
  console.log(JSON.stringify(allExp, null, 2));
}

addTestExpense().catch(err => console.error(err));
