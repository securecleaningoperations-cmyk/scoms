const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length > 0) env[k] = v.join('=').replace(/^["']|["']$/g, '');
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

async function initBuckets() {
  const desiredBuckets = ['documents', 'attachments', 'receipts', 'avatars', 'inspections'];
  
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  const existingNames = (existingBuckets || []).map(b => b.name);
  console.log('Existing buckets in Supabase:', existingNames);

  for (const name of desiredBuckets) {
    if (!existingNames.includes(name)) {
      console.log(`Creating bucket: ${name}...`);
      const { data, error } = await supabase.storage.createBucket(name, {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      });
      if (error) {
        console.error(`Failed to create bucket ${name}:`, error);
      } else {
        console.log(`Bucket ${name} created successfully!`);
      }
    } else {
      console.log(`Bucket ${name} already exists.`);
    }
  }
}

initBuckets().catch(console.error);
