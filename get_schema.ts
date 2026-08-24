import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing credentials. Make sure to run this with dotenv.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Query a single employee to see its shape
  const { data: emp, error: empErr } = await supabase.from('employees').select('*').limit(1);
  console.log("EMPLOYEES TABLE COLUMNS (from 1 row):");
  if (emp && emp.length > 0) {
    console.log(Object.keys(emp[0]));
  } else {
    console.log("No employees found, but query succeeded.");
  }
  
  if (empErr) console.error("Employee fetch error:", empErr);

  // Query a single user to see its shape
  const { data: user, error: userErr } = await supabase.from('users').select('*').limit(1);
  console.log("\nUSERS TABLE COLUMNS (from 1 row):");
  if (user && user.length > 0) {
    console.log(Object.keys(user[0]));
  } else {
    console.log("No users found, but query succeeded.");
  }

  if (userErr) console.error("User fetch error:", userErr);
}

main();
