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

async function inspectProposals() {
  const { data, error } = await supabase.from('proposals').select('*').limit(1);
  if (data && data[0]) {
    console.log('Proposals columns:', Object.keys(data[0]));
    console.log('Sample row:', data[0]);
  } else {
    console.log('Proposals empty or error:', error);
  }
}

inspectProposals();
