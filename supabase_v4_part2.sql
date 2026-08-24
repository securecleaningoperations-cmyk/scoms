-- ============================================================
-- SCOMS v4 MIGRATION — PART 2
-- Billing, Contracts, Proposals, Bid Calculator
-- ============================================================

-- ============================================================
-- BILLING ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  billing_contact_name VARCHAR(255),
  billing_contact_email VARCHAR(255),
  billing_contact_phone VARCHAR(50),
  billing_address TEXT,
  payment_terms VARCHAR(50) DEFAULT 'net_30' CHECK (payment_terms IN (
    'net_15','net_30','net_45','net_60','due_on_receipt','custom'
  )),
  auto_invoice BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id)
);
CREATE INDEX IF NOT EXISTS idx_ba_client ON billing_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_ba_tenant ON billing_accounts(tenant_id);
ALTER TABLE billing_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ba ON billing_accounts;
CREATE POLICY tenant_isolation_ba ON billing_accounts USING (tenant_id = auth_tenant_id());

-- Patch invoices: link to billing_account + contract
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billing_account_id UUID REFERENCES billing_accounts(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS contract_id UUID; -- FK added below
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================
-- INVOICE LINE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  service_date DATE,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ili_invoice ON invoice_line_items(invoice_id);
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ili ON invoice_line_items;
CREATE POLICY tenant_isolation_ili ON invoice_line_items USING (tenant_id = auth_tenant_id());

-- ============================================================
-- PAYMENT RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  billing_account_id UUID REFERENCES billing_accounts(id),
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN (
    'check','ach','wire','credit_card','cash','other'
  )),
  reference_number VARCHAR(100),
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pr_invoice ON payment_records(invoice_id);
CREATE INDEX IF NOT EXISTS idx_pr_tenant ON payment_records(tenant_id);
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_payment ON payment_records;
CREATE POLICY tenant_isolation_payment ON payment_records USING (tenant_id = auth_tenant_id());

-- ============================================================
-- BILLING TICKETS
-- Customer billing disputes / questions
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  submitted_by_user_id UUID REFERENCES auth.users(id),
  ticket_number VARCHAR(50),
  type VARCHAR(50) CHECK (type IN ('dispute','question','credit_request','overpayment','other')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount_disputed DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN (
    'open','under_review','awaiting_customer','resolved','closed'
  )),
  assigned_to UUID REFERENCES users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bt_client ON billing_tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_bt_tenant ON billing_tickets(tenant_id);
ALTER TABLE billing_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bt ON billing_tickets;
CREATE POLICY tenant_isolation_bt ON billing_tickets
  USING (
    tenant_id = auth_tenant_id()
    OR (
      submitted_by_user_id = auth.uid()
      AND client_id IN (
        SELECT client_id FROM customer_portal_users WHERE user_id = auth.uid() AND is_active = TRUE
      )
    )
  );

-- ============================================================
-- CONTRACTS (Full Lifecycle)
-- ============================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  contract_number VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
    'draft','internal_review','customer_review','revision_requested',
    'approved','active','renewal_pending','expired','terminated','archived'
  )),
  effective_date DATE,
  expiry_date DATE,
  renewal_date DATE,
  auto_renew BOOLEAN DEFAULT FALSE,
  total_annual_value DECIMAL(15,2),
  billing_frequency VARCHAR(50) CHECK (billing_frequency IN (
    'weekly','biweekly','monthly','quarterly','annually','per_service'
  )),
  service_scope TEXT,
  locations_covered JSONB DEFAULT '[]',
  special_requirements TEXT,
  insurance_required BOOLEAN DEFAULT FALSE,
  compliance_notes TEXT,
  internal_approved_by UUID REFERENCES users(id),
  internal_approved_at TIMESTAMP WITH TIME ZONE,
  customer_signed_at TIMESTAMP WITH TIME ZONE,
  termination_date DATE,
  termination_reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cont_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_cont_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cont_status ON contracts(status);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_contracts ON contracts;
CREATE POLICY tenant_isolation_contracts ON contracts
  USING (
    tenant_id = auth_tenant_id()
    OR client_id IN (
      SELECT client_id FROM customer_portal_users
      WHERE user_id = auth.uid() AND is_active = TRUE AND can_view_contracts = TRUE
    )
  );

-- Link invoices to contracts now that contracts table exists
ALTER TABLE invoices ADD CONSTRAINT fk_invoice_contract
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL
  NOT VALID;

-- Link service_schedules to contracts
ALTER TABLE service_schedules ADD CONSTRAINT fk_schedule_contract
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL
  NOT VALID;

-- ============================================================
-- CONTRACT VERSIONS
-- Full audit trail of contract revisions
-- ============================================================
CREATE TABLE IF NOT EXISTS contract_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  status VARCHAR(50),
  snapshot JSONB NOT NULL, -- full contract fields at time of version
  changed_by UUID REFERENCES users(id),
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cv_contract ON contract_versions(contract_id);
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cv ON contract_versions;
CREATE POLICY tenant_isolation_cv ON contract_versions USING (tenant_id = auth_tenant_id());

-- ============================================================
-- CONTRACT LINE ITEMS
-- Service scope line items per contract
-- ============================================================
CREATE TABLE IF NOT EXISTS contract_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  location_id UUID REFERENCES customer_locations(id),
  service_description TEXT NOT NULL,
  frequency VARCHAR(50),
  unit_price DECIMAL(12,2),
  quantity DECIMAL(10,2) DEFAULT 1,
  total_price DECIMAL(12,2),
  is_optional BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cli_contract ON contract_line_items(contract_id);
ALTER TABLE contract_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cli ON contract_line_items;
CREATE POLICY tenant_isolation_cli ON contract_line_items USING (tenant_id = auth_tenant_id());

-- ============================================================
-- PROPOSAL VERSIONS
-- Revision history for proposals
-- ============================================================
CREATE TABLE IF NOT EXISTS proposal_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  status VARCHAR(50),
  snapshot JSONB NOT NULL,
  changed_by UUID REFERENCES users(id),
  change_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pv_proposal ON proposal_versions(proposal_id);
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pv ON proposal_versions;
CREATE POLICY tenant_isolation_pv ON proposal_versions USING (tenant_id = auth_tenant_id());

-- ============================================================
-- PROPOSAL LINE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS proposal_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  tier VARCHAR(10) CHECK (tier IN ('silver','gold','platinum','all')),
  service_description TEXT NOT NULL,
  frequency VARCHAR(50),
  unit_price DECIMAL(12,2),
  quantity DECIMAL(10,2) DEFAULT 1,
  total_price DECIMAL(12,2),
  is_optional BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pli_proposal ON proposal_line_items(proposal_id);
ALTER TABLE proposal_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pli2 ON proposal_line_items;
CREATE POLICY tenant_isolation_pli2 ON proposal_line_items USING (tenant_id = auth_tenant_id());

-- ============================================================
-- PROPOSAL APPROVALS
-- Internal review workflow
-- ============================================================
CREATE TABLE IF NOT EXISTS proposal_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  approver_id UUID REFERENCES users(id),
  approver_role VARCHAR(50),
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','skipped')),
  decision_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pa_proposal ON proposal_approvals(proposal_id);
ALTER TABLE proposal_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pa ON proposal_approvals;
CREATE POLICY tenant_isolation_pa ON proposal_approvals USING (tenant_id = auth_tenant_id());

-- Patch proposals: add bid linkage + approval tracking
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS bid_version_id UUID; -- FK to bid_versions in part 3
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS internal_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS internal_approved_by UUID REFERENCES users(id);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================
-- BILLING VIEW: Account Statement Summary
-- ============================================================
CREATE OR REPLACE VIEW vw_billing_account_summary AS
SELECT
  ba.id AS billing_account_id,
  ba.tenant_id,
  ba.client_id,
  c.name AS client_name,
  COUNT(DISTINCT i.id) AS total_invoices,
  COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'unpaid'), 0) AS total_outstanding,
  COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'overdue'), 0) AS total_overdue,
  COALESCE(SUM(i.amount) FILTER (WHERE i.status = 'paid'), 0) AS total_paid,
  MAX(i.due_date) FILTER (WHERE i.status IN ('unpaid','overdue')) AS next_due_date
FROM billing_accounts ba
JOIN clients c ON c.id = ba.client_id
LEFT JOIN invoices i ON i.billing_account_id = ba.id
GROUP BY ba.id, ba.tenant_id, ba.client_id, c.name;
