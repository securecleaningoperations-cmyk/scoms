-- ====================================================================================
-- SCOMS DEMO MODE BYPASS + STORAGE SETUP SCRIPT
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ====================================================================================

-- 1. Disable RLS on all tables
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE audits DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE communications DISABLE ROW LEVEL SECURITY;
ALTER TABLE certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_revenue_shares DISABLE ROW LEVEL SECURITY;
ALTER TABLE qa_inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE capa_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_checklists DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE ledger DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE period_closes DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance DISABLE ROW LEVEL SECURITY;
ALTER TABLE tax_classifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_profit_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_profit_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE cfo_scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE trainings DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_receptionist_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE communication_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_followups DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE operational_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE integrations_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_call_transcripts DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_base DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE walkthrough_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE walkthrough_rooms DISABLE ROW LEVEL SECURITY;

-- 2. Drop the restrictive foreign key on the users table (demo mode)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Add a default UUID generator so we can insert users easily
ALTER TABLE users ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 4. Add optional columns that may be missing in users
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- Safely drop NOT NULL on users columns if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='first_name') THEN
    ALTER TABLE users ALTER COLUMN first_name DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_name') THEN
    ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL;
  END IF;
END $$;

-- 5. Fix employees table: Safely drop NOT NULL constraint on ghost columns ONLY IF they exist
ALTER TABLE employees ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'active';

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='first_name') THEN
    ALTER TABLE employees ALTER COLUMN first_name DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='last_name') THEN
    ALTER TABLE employees ALTER COLUMN last_name DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='email') THEN
    ALTER TABLE employees ALTER COLUMN email DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='role') THEN
    ALTER TABLE employees ALTER COLUMN role DROP NOT NULL;
  END IF;
END $$;

-- 6. Add optional columns to jobs table for scheduling
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS start_time VARCHAR(20);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_date DATE;

-- 7. Add video_url to trainings for Supabase Storage video support
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 8. Create Supabase Storage bucket "documents" (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Allow all operations on the documents bucket (demo mode)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents');

