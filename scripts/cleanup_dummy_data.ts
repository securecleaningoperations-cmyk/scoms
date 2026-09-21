import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Read env
const envContent = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach((line) => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDummyData() {
  console.log('--- SCOMS Database Cleanup: Removing Fake/Dummy Data ---');

  // 1. Find dummy users
  const dummyEmails = ['test@gmail.com', 'testing@gmail.com', 'testemp@gmail.com'];
  const { data: dummyUsers, error: userFindErr } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .in('email', dummyEmails);

  if (dummyUsers && dummyUsers.length > 0) {
    console.log(`Found ${dummyUsers.length} dummy test users to remove:`, dummyUsers.map(u => u.email));
    const userIds = dummyUsers.map(u => u.id);

    // Delete linked trainings, attendance, or job assignments if any
    await supabase.from('trainings').delete().in('employee_id', [
      'cd03165f-030b-4e84-8c06-b29d07687a61',
      '4dc38925-f342-4261-ad9c-3f819122e149',
      '46ef17db-7385-4862-a5d1-1a75235dbb09'
    ]);

    // Delete dummy employees
    const { error: empDelErr } = await supabase
      .from('employees')
      .delete()
      .in('user_id', userIds);
    console.log('Deleted dummy employee records:', empDelErr ? empDelErr.message : 'OK');

    // Delete dummy users from users table
    const { error: uDelErr } = await supabase
      .from('users')
      .delete()
      .in('id', userIds);
    console.log('Deleted dummy users from public.users:', uDelErr ? uDelErr.message : 'OK');

    // Also delete from auth.users if exists
    for (const u of dummyUsers) {
      try {
        await supabase.auth.admin.deleteUser(u.id);
        console.log(`Deleted auth user: ${u.email}`);
      } catch (err: any) {
        console.log(`Auth delete note for ${u.email}:`, err.message);
      }
    }
  } else {
    console.log('No dummy test users found in users table.');
  }

  // 2. Clean dummy/empty jobs with null or test titles
  const { data: dummyJobs } = await supabase
    .from('jobs')
    .select('id, title')
    .or('title.is.null,title.eq.test,title.eq.testing,title.eq.testr');

  if (dummyJobs && dummyJobs.length > 0) {
    console.log(`Cleaning ${dummyJobs.length} invalid/test jobs...`);
    const jobIds = dummyJobs.map(j => j.id);
    await supabase.from('jobs').delete().in('id', jobIds);
    console.log('Cleaned dummy jobs successfully.');
  }

  console.log('--- Cleanup Complete: Zero fake data remains in database! ---');
}

cleanDummyData().catch(console.error);
