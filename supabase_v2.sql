-- SCOMS v6.1 COMPLETE UNIFIED SCHEMA
-- This file contains both the base schema (v4.0) and the extended enterprise schema (v6.1).
-- It can be safely run on a fresh database to create all tables and apply all extensions.

-- SCOMS v4.0 / v6.1 Enterprise Schema
-- Complete Supabase PostgreSQL Schema covering all modules, RLS policies, and Audit systems.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TENANT & HIERARCHY SYSTEM
-- ==========================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'corporate' CHECK (type IN ('corporate', 'franchise', 'sub_franchise')),
    parent_tenant_id UUID REFERENCES tenants(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if the table was created previously
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'corporate';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS parent_tenant_id UUID REFERENCES tenants(id);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- ==========================================
-- 2. IDENTITY & ROLES
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'super_admin', 'corporate_admin', 'franchise_admin', 'operations_manager', 
        'scheduler', 'hr_manager', 'finance_admin', 'payroll_admin', 'supervisor', 
        'field_employee', 'sales_manager', 'client_admin', 'client_user', 
        'vendor_manager', 'compliance_officer', 'executive'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if the table was created previously
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Helper Function for RLS
CREATE OR REPLACE FUNCTION auth_tenant_id() RETURNS UUID AS $$
    SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users USING (tenant_id = auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_tenants ON tenants;
CREATE POLICY tenant_isolation_tenants ON tenants USING (id = auth_tenant_id() OR parent_tenant_id = auth_tenant_id());

-- ==========================================
-- 3. AUDIT & EVENT ENGINE
-- ==========================================
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    payload JSONB,
    correlation_id UUID,
    source_module VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_events ON event_logs;
CREATE POLICY tenant_isolation_events ON event_logs USING (tenant_id = auth_tenant_id());

-- ==========================================
-- 4. ENGINE 1: WORKFORCE (HR)
-- ==========================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'suspended', 'terminated')),
    pay_type VARCHAR(50) CHECK (pay_type IN ('hourly', 'job-based', 'salary')),
    pay_rate DECIMAL(10, 2),
    hire_date DATE,
    skills JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if the table was created previously
ALTER TABLE employees ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_employees ON employees;
CREATE POLICY tenant_isolation_employees ON employees USING (tenant_id = auth_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_certs ON certifications;
CREATE POLICY tenant_isolation_certs ON certifications USING (tenant_id = auth_tenant_id());

-- ==========================================
-- 5. ENGINE 2: ATTENDANCE & GPS
-- ==========================================
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    job_id UUID, -- References jobs table
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    gps_in JSONB,
    gps_out JSONB,
    status VARCHAR(50) DEFAULT 'valid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if the table was created previously
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS gps_in JSONB;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS gps_out JSONB;

ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_attendance ON attendance_logs;
CREATE POLICY tenant_isolation_attendance ON attendance_logs USING (tenant_id = auth_tenant_id());

-- ==========================================
-- 6. ENGINE 10: CRM & LEADS
-- ==========================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    stage VARCHAR(50) DEFAULT 'prospect' CHECK (stage IN ('prospect', 'qualified', 'meeting', 'walkthrough', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    estimated_value DECIMAL(15, 2),
    ai_score DECIMAL(5,2),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_leads ON leads;
CREATE POLICY tenant_isolation_leads ON leads USING (tenant_id = auth_tenant_id());

-- ==========================================
-- 7. ENGINE 16-17: DOCUMENT MANAGEMENT
-- ==========================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) CHECK (category IN ('employee', 'client', 'vendor', 'corporate', 'financial', 'operations')),
    entity_id UUID, -- Polymorphic reference
    file_path TEXT NOT NULL,
    version INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending_signature', 'signed', 'archived')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
CREATE POLICY tenant_isolation_documents ON documents USING (tenant_id = auth_tenant_id());

-- ==========================================
-- 8. ENGINE 20: ZOOM COMMUNICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('email', 'call', 'meeting', 'zoom')),
    entity_type VARCHAR(100),
    entity_id UUID,
    title VARCHAR(255),
    notes TEXT,
    zoom_join_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_comms ON communications;
CREATE POLICY tenant_isolation_comms ON communications USING (tenant_id = auth_tenant_id());

-- ==========================================
-- 8. OPERATIONS ENGINES (JOBS, AUDITS, INVOICES, TRAINING)
-- ==========================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client VARCHAR(255),
    service VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Created',
    assigned VARCHAR(255),
    job_date DATE,
    type VARCHAR(50),
    crew_size INTEGER DEFAULT 1,
    time VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_jobs ON jobs;
CREATE POLICY tenant_isolation_jobs ON jobs USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    audit_id VARCHAR(50),
    type VARCHAR(100),
    location VARCHAR(255),
    auditor VARCHAR(255),
    audit_date DATE,
    score INTEGER,
    status VARCHAR(50),
    findings INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_audits ON audits;
CREATE POLICY tenant_isolation_audits ON audits USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id VARCHAR(50),
    client VARCHAR(255),
    amount DECIMAL(12,2),
    issue_date DATE,
    due_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_invoices ON invoices;
CREATE POLICY tenant_isolation_invoices ON invoices USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(255),
    status VARCHAR(50),
    score INTEGER,
    completed_date DATE,
    expiry_date DATE,
    instructor VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_trainings ON trainings;
CREATE POLICY tenant_isolation_trainings ON trainings USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id VARCHAR(50),
    name VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    rating INTEGER,
    type VARCHAR(100),
    properties_count INTEGER,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clients ON clients;
CREATE POLICY tenant_isolation_clients ON clients USING (tenant_id = auth_tenant_id());


-- SCOMS v6.1 Extended Schema — Engines 6.4-6.8 + Document Mgmt + Proposals + Franchise + Quality + Communications
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ENGINE 6.4: GENERAL LEDGER / BOOKKEEPING
-- ==========================================
CREATE TABLE IF NOT EXISTS ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Revenue','Expense','Liability','Asset','Equity')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(100),
    account_code VARCHAR(50),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    period_closed BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ledger ON ledger;
CREATE POLICY tenant_isolation_ledger ON ledger USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    ledger_id UUID REFERENCES ledger(id) ON DELETE CASCADE,
    entry_type VARCHAR(10) CHECK (entry_type IN ('debit','credit')),
    account VARCHAR(100),
    amount DECIMAL(15,2),
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_je ON journal_entries;
CREATE POLICY tenant_isolation_je ON journal_entries USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS period_closes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    period_type VARCHAR(20) CHECK (period_type IN ('daily','monthly','annual')),
    period_start DATE,
    period_end DATE,
    closed_by UUID REFERENCES users(id),
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);
ALTER TABLE period_closes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pc ON period_closes;
CREATE POLICY tenant_isolation_pc ON period_closes USING (tenant_id = auth_tenant_id());

-- ==========================================
-- ENGINE 6.5: ASSET MANAGEMENT
-- ==========================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    asset_code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('vehicle','equipment','machinery','technology','franchise_asset','other')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','maintenance','retired','disposed')),
    purchase_date DATE,
    purchase_cost DECIMAL(15,2),
    current_value DECIMAL(15,2),
    depreciation_method VARCHAR(30) DEFAULT 'straight_line' CHECK (depreciation_method IN ('straight_line','usage_based','time_based')),
    useful_life_years INT,
    salvage_value DECIMAL(15,2) DEFAULT 0,
    location VARCHAR(255),
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_assets ON assets;
CREATE POLICY tenant_isolation_assets ON assets USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS asset_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100),
    scheduled_date DATE,
    completed_date DATE,
    cost DECIMAL(10,2),
    technician VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_am ON asset_maintenance;
CREATE POLICY tenant_isolation_am ON asset_maintenance USING (tenant_id = auth_tenant_id());

-- ==========================================
-- ENGINE 6.6: TAX INTELLIGENCE
-- ==========================================
CREATE TABLE IF NOT EXISTS tax_classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    reference_id UUID NOT NULL,
    reference_type VARCHAR(100),
    classification VARCHAR(50) CHECK (classification IN ('taxable_income','deductible_expense','non_deductible','capital_asset','liability')),
    tax_year INT,
    amount DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE tax_classifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tc ON tax_classifications;
CREATE POLICY tenant_isolation_tc ON tax_classifications USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS tax_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    report_type VARCHAR(50) CHECK (report_type IN ('monthly_summary','quarterly_filing','annual_report','audit_bundle')),
    period_start DATE,
    period_end DATE,
    total_income DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    tax_liability DECIMAL(15,2) DEFAULT 0,
    file_url TEXT,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft','filed','amended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tr ON tax_reports;
CREATE POLICY tenant_isolation_tr ON tax_reports USING (tenant_id = auth_tenant_id());

-- ==========================================
-- ENGINE 6.7: PROFITABILITY AI
-- ==========================================
CREATE TABLE IF NOT EXISTS job_profit_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    estimated_labor_cost DECIMAL(10,2),
    estimated_supply_cost DECIMAL(10,2),
    estimated_fuel_cost DECIMAL(10,2),
    estimated_time_hours DECIMAL(6,2),
    estimated_revenue DECIMAL(10,2),
    estimated_profit DECIMAL(10,2),
    risk_score VARCHAR(10) CHECK (risk_score IN ('low','medium','high')),
    recommendation VARCHAR(20) CHECK (recommendation IN ('accept','review_pricing','reject')),
    actual_labor_cost DECIMAL(10,2),
    actual_supply_cost DECIMAL(10,2),
    actual_revenue DECIMAL(10,2),
    actual_profit DECIMAL(10,2),
    efficiency_score DECIMAL(5,2),
    analysis_stage VARCHAR(20) DEFAULT 'pre_job' CHECK (analysis_stage IN ('pre_job','post_job')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE job_profit_analysis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_jpa ON job_profit_analysis;
CREATE POLICY tenant_isolation_jpa ON job_profit_analysis USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS client_profit_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    profitability_rating DECIMAL(5,2),
    cost_to_serve_index DECIMAL(5,2),
    over_service_risk VARCHAR(10) CHECK (over_service_risk IN ('low','medium','high')),
    renewal_recommendation VARCHAR(20) CHECK (renewal_recommendation IN ('renew','renegotiate','terminate')),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE client_profit_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cps ON client_profit_scores;
CREATE POLICY tenant_isolation_cps ON client_profit_scores USING (tenant_id = auth_tenant_id());

-- ==========================================
-- ENGINE 6.8: CFO SCENARIO MODELING
-- ==========================================
CREATE TABLE IF NOT EXISTS cfo_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scenario_type VARCHAR(100),
    parameters JSONB,
    projected_impact DECIMAL(15,2),
    impact_type VARCHAR(20) CHECK (impact_type IN ('positive','negative','neutral')),
    recommendation TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE cfo_scenarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfo ON cfo_scenarios;
CREATE POLICY tenant_isolation_cfo ON cfo_scenarios USING (tenant_id = auth_tenant_id());

-- ==========================================
-- PROPOSALS SYSTEM (3-TIER)
-- ==========================================
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    proposal_number VARCHAR(50),
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','accepted','rejected','expired')),
    silver_price DECIMAL(12,2),
    gold_price DECIMAL(12,2),
    platinum_price DECIMAL(12,2),
    silver_details JSONB,
    gold_details JSONB,
    platinum_details JSONB,
    selected_tier VARCHAR(10) CHECK (selected_tier IN ('silver','gold','platinum')),
    viewed_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_proposals ON proposals;
CREATE POLICY tenant_isolation_proposals ON proposals USING (tenant_id = auth_tenant_id());

-- ==========================================
-- DOCUMENT MANAGEMENT (EXTENDED)
-- ==========================================
ALTER TABLE documents ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS retention_period_years INT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS retention_expires_at DATE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT TRUE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS has_branded_cover BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ocr_text TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS document_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    signer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    signer_name VARCHAR(255),
    signer_role VARCHAR(100),
    signature_data TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','signed','declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_docsig ON document_signatures;
CREATE POLICY tenant_isolation_docsig ON document_signatures USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    content TEXT,
    fields JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_doctpl ON document_templates;
CREATE POLICY tenant_isolation_doctpl ON document_templates USING (tenant_id = auth_tenant_id());

-- ==========================================
-- FRANCHISE (EXTENDED)
-- ==========================================
CREATE TABLE IF NOT EXISTS franchise_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    franchise_code VARCHAR(50),
    owner_name VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','onboarding','suspended','terminated')),
    revenue_share_pct DECIMAL(5,2) DEFAULT 10.0,
    monthly_revenue DECIMAL(15,2) DEFAULT 0,
    compliance_score INT DEFAULT 100,
    employee_count INT DEFAULT 0,
    opened_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE franchise_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fl ON franchise_locations;
CREATE POLICY tenant_isolation_fl ON franchise_locations USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS franchise_revenue_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    franchise_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    period_month INT,
    period_year INT,
    gross_revenue DECIMAL(15,2),
    share_pct DECIMAL(5,2),
    share_amount DECIMAL(15,2),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
    due_date DATE,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE franchise_revenue_shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_frs ON franchise_revenue_shares;
CREATE POLICY tenant_isolation_frs ON franchise_revenue_shares USING (tenant_id = auth_tenant_id());

-- ==========================================
-- QUALITY & COMPLIANCE (EXTENDED)
-- ==========================================
ALTER TABLE audits ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE audits ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id);
ALTER TABLE audits ADD COLUMN IF NOT EXISTS criteria JSONB DEFAULT '[]';
ALTER TABLE audits ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS qa_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    inspector_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    score INT CHECK (score BETWEEN 0 AND 100),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','passed','failed','needs_action')),
    checklist JSONB DEFAULT '[]',
    photos JSONB DEFAULT '[]',
    notes TEXT,
    inspected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE qa_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_qi ON qa_inspections;
CREATE POLICY tenant_isolation_qi ON qa_inspections USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS capa_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    inspection_id UUID REFERENCES qa_inspections(id) ON DELETE SET NULL,
    title VARCHAR(255),
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
    root_cause TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE capa_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_capa ON capa_actions;
CREATE POLICY tenant_isolation_capa ON capa_actions USING (tenant_id = auth_tenant_id());

-- ==========================================
-- JOBS (EXTENDED)
-- ==========================================
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS estimated_revenue DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS before_photos JSONB DEFAULT '[]';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS after_photos JSONB DEFAULT '[]';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS supervisor_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_signed BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS job_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_by UUID REFERENCES employees(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE job_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_jc ON job_checklists;
CREATE POLICY tenant_isolation_jc ON job_checklists USING (tenant_id = auth_tenant_id());

-- ==========================================
-- COMMUNICATIONS (EXTENDED)
-- ==========================================
ALTER TABLE communications ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','missed'));
ALTER TABLE communications ADD COLUMN IF NOT EXISTS follow_up_tasks JSONB DEFAULT '[]';
ALTER TABLE communications ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]';
ALTER TABLE communications ADD COLUMN IF NOT EXISTS zoom_recording_url TEXT;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS zoom_meeting_id VARCHAR(100);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('sms','email','in_app','push')),
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','read')),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    reference_id UUID,
    reference_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_notif ON notifications;
CREATE POLICY tenant_isolation_notif ON notifications USING (tenant_id = auth_tenant_id());

-- ==========================================
-- CUSTOMER / AI RECEPTIONIST
-- ==========================================
CREATE TABLE IF NOT EXISTS customer_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    source VARCHAR(50) CHECK (source IN ('phone','web','email','chat','missed_call')),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    inquiry_type VARCHAR(100),
    message TEXT,
    ai_response TEXT,
    status VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new','contacted','converted','closed')),
    converted_to_lead UUID REFERENCES leads(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ci ON customer_inquiries;
CREATE POLICY tenant_isolation_ci ON customer_inquiries USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS customer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    platform VARCHAR(50),
    response_text TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cr ON customer_reviews;
CREATE POLICY tenant_isolation_cr ON customer_reviews USING (tenant_id = auth_tenant_id());

-- ==========================================
-- PAYROLL
-- ==========================================
CREATE TABLE IF NOT EXISTS payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','paid')),
    total_gross DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    total_net DECIMAL(15,2) DEFAULT 0,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pr ON payroll_runs;
CREATE POLICY tenant_isolation_pr ON payroll_runs USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS payroll_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    regular_hours DECIMAL(6,2) DEFAULT 0,
    overtime_hours DECIMAL(6,2) DEFAULT 0,
    holiday_hours DECIMAL(6,2) DEFAULT 0,
    gross_pay DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_pay DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    pay_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE payroll_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pli ON payroll_line_items;
CREATE POLICY tenant_isolation_pli ON payroll_line_items USING (tenant_id = auth_tenant_id());

-- ==========================================
-- SCHEDULING
-- ==========================================
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled','dispatched','in_progress','completed','cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sched ON schedules;
CREATE POLICY tenant_isolation_sched ON schedules USING (tenant_id = auth_tenant_id());

-- ==========================================
-- INVOICES (EXTENDED)
-- ==========================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(30) CHECK (invoice_type IN ('commercial','government','residential','industrial'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_received DECIMAL(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;

-- ==========================================
-- EMPLOYEES (EXTENDED)
-- ==========================================
ALTER TABLE employees ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES employees(id);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 0;

-- ==========================================
-- CONTRACTS
-- ==========================================
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    contract_number VARCHAR(50),
    title VARCHAR(255),
    type VARCHAR(50) CHECK (type IN ('master_service','statement_of_work','cleaning_contract','amendment','renewal')),
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft','pending_signature','active','expired','terminated')),
    start_date DATE,
    end_date DATE,
    value DECIMAL(15,2),
    billing_frequency VARCHAR(20) CHECK (billing_frequency IN ('weekly','biweekly','monthly','quarterly','annual')),
    auto_renew BOOLEAN DEFAULT FALSE,
    terms TEXT,
    signed_by_client BOOLEAN DEFAULT FALSE,
    signed_by_company BOOLEAN DEFAULT FALSE,
    document_id UUID REFERENCES documents(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_contracts ON contracts;
CREATE POLICY tenant_isolation_contracts ON contracts USING (tenant_id = auth_tenant_id());

