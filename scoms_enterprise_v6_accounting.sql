-- SCOMS Enterprise Schema v6 — Full Accounting Module

-- ==========================================
-- ACCOUNTING PERIODS
-- ==========================================
CREATE TABLE IF NOT EXISTS accounting_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    period_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    closed_by UUID REFERENCES auth.users(id),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, period_name)
);

-- ==========================================
-- CHART OF ACCOUNTS (COA)
-- ==========================================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
    balance_type VARCHAR(10) CHECK (balance_type IN ('Debit', 'Credit')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, account_number)
);

-- ==========================================
-- DOUBLE ENTRY JOURNAL ENTRIES
-- ==========================================
CREATE TABLE IF NOT EXISTS erp_journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    period_id UUID REFERENCES accounting_periods(id),
    entry_date DATE NOT NULL,
    reference_number VARCHAR(100),
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) CHECK (status IN ('draft', 'posted', 'voided')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_journal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES erp_journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit NUMERIC(15, 2) DEFAULT 0.00,
    credit NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- RLS POLICIES
-- ==========================================
ALTER TABLE accounting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_journal_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for accounting_periods" ON accounting_periods FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Tenant isolation for chart_of_accounts" ON chart_of_accounts FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Tenant isolation for erp_journal_entries" ON erp_journal_entries FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Journal lines use implicit tenant isolation through the entry_id reference.
CREATE POLICY "Tenant isolation for erp_journal_lines" ON erp_journal_lines FOR ALL USING (
    EXISTS (SELECT 1 FROM erp_journal_entries WHERE erp_journal_entries.id = erp_journal_lines.entry_id AND erp_journal_entries.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))
);
