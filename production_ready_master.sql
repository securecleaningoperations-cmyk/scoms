-- SCOMS Enterprise Production Master SQL File
-- Replaces Zoom with Jitsi (meet_url) and provisions missing tables for all 16 sidebar modules

-- 1. Rename zoom_join_url to meet_url in existing tables if it exists
DO $$ 
BEGIN
  -- Check and rename in meetings table
  IF EXISTS(SELECT * FROM information_schema.columns 
            WHERE table_name='meetings' AND column_name='zoom_join_url') THEN
      ALTER TABLE "public"."meetings" RENAME COLUMN "zoom_join_url" TO "meet_url";
  END IF;

  -- Check and rename in communications table
  IF EXISTS(SELECT * FROM information_schema.columns 
            WHERE table_name='communications' AND column_name='zoom_join_url') THEN
      ALTER TABLE "public"."communications" RENAME COLUMN "zoom_join_url" TO "meet_url";
  END IF;
  
  -- Check and rename in walkthroughs table (just in case they have remote walkthroughs)
  IF EXISTS(SELECT * FROM information_schema.columns 
            WHERE table_name='walkthroughs' AND column_name='zoom_join_url') THEN
      ALTER TABLE "public"."walkthroughs" RENAME COLUMN "zoom_join_url" TO "meet_url";
  END IF;
END $$;


-- 2. Ensure basic schema is robust for all modules

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'repository', 'template', etc
    "url" TEXT,
    "folder" TEXT DEFAULT '/',
    "uploaded_by" UUID REFERENCES auth.users(id),
    "size_bytes" BIGINT,
    "status" TEXT DEFAULT 'active'
);

-- WORKFORCE (HR)
CREATE TABLE IF NOT EXISTS "public"."hr_payroll" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "employee_id" UUID, -- reference to employee table if exists
    "period_start" DATE,
    "period_end" DATE,
    "hours_worked" DECIMAL(10,2),
    "gross_pay" DECIMAL(12,2),
    "net_pay" DECIMAL(12,2),
    "status" TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS "public"."hr_training" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "title" TEXT NOT NULL,
    "module_type" TEXT,
    "required_for_role" TEXT[],
    "status" TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS "public"."hr_certifications" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "employee_id" UUID,
    "certification_name" TEXT,
    "issue_date" DATE,
    "expiry_date" DATE,
    "status" TEXT DEFAULT 'valid',
    "document_url" TEXT
);

CREATE TABLE IF NOT EXISTS "public"."hr_performance" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "employee_id" UUID,
    "review_date" DATE,
    "reviewer_id" UUID,
    "score" INTEGER,
    "comments" TEXT
);

-- SCHEDULING (Routes, Dispatch)
CREATE TABLE IF NOT EXISTS "public"."dispatch_routes" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "date" DATE,
    "team_id" UUID,
    "client_id" UUID,
    "status" TEXT DEFAULT 'scheduled', -- scheduled, in-progress, completed
    "estimated_duration_mins" INTEGER,
    "actual_duration_mins" INTEGER
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS "public"."client_contracts" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "client_id" UUID NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "value" DECIMAL(12,2),
    "status" TEXT DEFAULT 'active',
    "document_url" TEXT
);

CREATE TABLE IF NOT EXISTS "public"."client_proposals" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "client_id" UUID NOT NULL,
    "amount" DECIMAL(12,2),
    "status" TEXT DEFAULT 'draft',
    "sent_date" TIMESTAMP WITH TIME ZONE,
    "document_url" TEXT
);

-- JOBS
CREATE TABLE IF NOT EXISTS "public"."job_checklists" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "job_id" UUID,
    "task_name" TEXT NOT NULL,
    "is_completed" BOOLEAN DEFAULT false,
    "completed_by" UUID,
    "completed_at" TIMESTAMP WITH TIME ZONE
);

-- QUALITY
CREATE TABLE IF NOT EXISTS "public"."quality_capa" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL, -- corrective, preventive
    "status" TEXT DEFAULT 'open',
    "assigned_to" UUID,
    "due_date" DATE
);

CREATE TABLE IF NOT EXISTS "public"."quality_compliance" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "regulation_name" TEXT NOT NULL,
    "status" TEXT DEFAULT 'compliant',
    "last_audit_date" DATE,
    "next_audit_date" DATE,
    "notes" TEXT
);

-- FINANCE
CREATE TABLE IF NOT EXISTS "public"."finance_gl" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "transaction_date" DATE NOT NULL,
    "account_code" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" TEXT NOT NULL -- debit, credit
);

CREATE TABLE IF NOT EXISTS "public"."finance_assets" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "asset_name" TEXT NOT NULL,
    "purchase_date" DATE,
    "purchase_value" DECIMAL(12,2),
    "current_value" DECIMAL(12,2),
    "status" TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS "public"."finance_tax" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "period_year" INTEGER NOT NULL,
    "period_quarter" INTEGER,
    "tax_type" TEXT NOT NULL,
    "amount_due" DECIMAL(12,2),
    "amount_paid" DECIMAL(12,2),
    "status" TEXT DEFAULT 'pending'
);

-- SECURITY
CREATE TABLE IF NOT EXISTS "public"."security_audit_logs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "ip_address" TEXT,
    "details" JSONB
);

CREATE TABLE IF NOT EXISTS "public"."security_incidents" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL, -- low, medium, high, critical
    "status" TEXT DEFAULT 'investigating',
    "reported_by" UUID,
    "description" TEXT
);

-- IMPROVEMENT
CREATE TABLE IF NOT EXISTS "public"."improvement_audits" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "audit_name" TEXT NOT NULL,
    "auditor_id" UUID,
    "date_conducted" DATE,
    "score" DECIMAL(5,2),
    "findings" TEXT,
    "status" TEXT DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS "public"."improvement_nonconformance" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "identified_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT,
    "severity" TEXT,
    "status" TEXT DEFAULT 'open',
    "resolution_plan" TEXT
);

-- EXECUTIVE
CREATE TABLE IF NOT EXISTS "public"."executive_governance" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "policy_name" TEXT NOT NULL,
    "version" TEXT,
    "approved_by" UUID,
    "approval_date" DATE,
    "status" TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS "public"."executive_mrb" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "meeting_date" DATE NOT NULL,
    "attendees" TEXT[],
    "minutes" TEXT,
    "action_items" JSONB,
    "status" TEXT DEFAULT 'draft'
);

-- FRANCHISE
CREATE TABLE IF NOT EXISTS "public"."franchise_locations" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "name" TEXT NOT NULL,
    "owner_id" UUID,
    "status" TEXT DEFAULT 'active',
    "address" TEXT,
    "royalty_rate" DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS "public"."franchise_compliance" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "franchise_id" UUID REFERENCES public.franchise_locations(id),
    "audit_date" DATE,
    "score" INTEGER,
    "status" TEXT DEFAULT 'compliant',
    "notes" TEXT
);

-- Disable RLS across all new tables for smooth dev experience (per user's previous preference)
ALTER TABLE "public"."documents" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hr_payroll" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hr_training" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hr_certifications" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hr_performance" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dispatch_routes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."client_contracts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."client_proposals" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."job_checklists" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quality_capa" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quality_compliance" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."finance_gl" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."finance_assets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."finance_tax" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."security_audit_logs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."security_incidents" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."improvement_audits" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."improvement_nonconformance" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."executive_governance" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."executive_mrb" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."franchise_locations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."franchise_compliance" DISABLE ROW LEVEL SECURITY;

-- If 'meetings' and 'communications' don't have meet_url columns (because zoom_join_url didn't exist to rename), let's ensure it exists
DO $$ 
BEGIN
  IF EXISTS(SELECT * FROM information_schema.tables WHERE table_schema='public' AND table_name='meetings') AND 
     NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_schema='public' AND table_name='meetings' AND column_name='meet_url') THEN
      ALTER TABLE "public"."meetings" ADD COLUMN "meet_url" TEXT;
  END IF;

  IF EXISTS(SELECT * FROM information_schema.tables WHERE table_schema='public' AND table_name='communications') AND 
     NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_schema='public' AND table_name='communications' AND column_name='meet_url') THEN
      ALTER TABLE "public"."communications" ADD COLUMN "meet_url" TEXT;
  END IF;
END $$;
