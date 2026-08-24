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
