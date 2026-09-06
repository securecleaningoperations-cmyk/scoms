-- SCOMS Enterprise Schema v6 — Assets, Subcontractors, and Advanced Procurement
-- Extension migration to handle missing enterprise modules.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ASSET MANAGEMENT & CHAIN OF CUSTODY
-- ==========================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    asset_number VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) CHECK (category IN ('vehicle', 'equipment', 'electronics', 'machinery', 'other')),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    cost DECIMAL(12,2),
    current_value DECIMAL(12,2),
    location_id UUID, -- References physical locations if we have them
    custodian_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    condition VARCHAR(50) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'broken')),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'in_maintenance', 'retired', 'lost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_assets ON assets;
CREATE POLICY tenant_isolation_assets ON assets USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS asset_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    transfer_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- if transferred to a vehicle
    notes TEXT,
    condition_at_transfer VARCHAR(50),
    status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE asset_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_asset_transfers ON asset_transfers;
CREATE POLICY tenant_isolation_asset_transfers ON asset_transfers USING (tenant_id = auth_tenant_id());

-- ==========================================
-- SUBCONTRACTOR MANAGEMENT
-- ==========================================
CREATE TABLE IF NOT EXISTS subcontractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    tax_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'terminated')),
    insurance_expiry DATE,
    wcb_expiry DATE, -- Workers compensation board expiry
    service_types JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_subcontractors ON subcontractors;
CREATE POLICY tenant_isolation_subcontractors ON subcontractors USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS subcontractor_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subcontractor_id UUID REFERENCES subcontractors(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'arrived', 'started', 'completed', 'inspected', 'approved', 'rejected')),
    rate DECIMAL(10,2),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    inspected_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE subcontractor_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_subcontractor_assignments ON subcontractor_assignments;
CREATE POLICY tenant_isolation_subcontractor_assignments ON subcontractor_assignments USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS subcontractor_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subcontractor_id UUID REFERENCES subcontractors(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    assignment_id UUID REFERENCES subcontractor_assignments(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'paid', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE subcontractor_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_subcontractor_invoices ON subcontractor_invoices;
CREATE POLICY tenant_isolation_subcontractor_invoices ON subcontractor_invoices USING (tenant_id = auth_tenant_id());

-- ==========================================
-- VENDORS & PROCUREMENT (Extending existing inventory)
-- ==========================================
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vendors ON vendors;
CREATE POLICY tenant_isolation_vendors ON vendors USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    po_number VARCHAR(100) UNIQUE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'ordered', 'received', 'cancelled')),
    requested_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    expected_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_po ON purchase_orders;
CREATE POLICY tenant_isolation_po ON purchase_orders USING (tenant_id = auth_tenant_id());

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_assets_tenant ON assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subcontractors_tenant ON subcontractors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_po_tenant ON purchase_orders(tenant_id);
