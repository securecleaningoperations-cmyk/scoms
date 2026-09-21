const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length > 0) env[k] = v.join('=').replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testTables() {
  const tables = [
    'invoices', 'quotes', 'jobs', 'clients', 'leads', 'notifications',
    'proposals', 'contracts', 'walkthroughs', 'estimates', 'quote'
  ];
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(1);
      if (error) {
        console.log(`Table "${t}": ERROR -> ${error.message} (code: ${error.code})`);
      } else {
        console.log(`Table "${t}": OK (rows: ${data ? data.length : 0})`);
      }
    } catch (e) {
      console.log(`Table "${t}": EXCEPTION ->`, e.message);
    }
  }
}

testTables();
