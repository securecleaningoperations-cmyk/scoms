-- ==============================================================================
-- FIX FOR MISSING SCHEMA TABLES & 403/404/400 ERRORS
-- ==============================================================================

-- 1. FIX LEADS TABLE (Add missing columns to the existing table)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS facility_type VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS square_footage INTEGER;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. CREATE MISSING KNOWLEDGE BASE TABLES
CREATE TABLE IF NOT EXISTS public.kb_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'internal',
    approved_for_ai BOOLEAN DEFAULT false,
    version_number INTEGER DEFAULT 1,
    created_by UUID,
    reviewed_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE MISSING WALKTHROUGH TABLES
CREATE TABLE IF NOT EXISTS public.walkthrough_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to UUID,
    facility_type VARCHAR(100),
    total_sqft INTEGER,
    cleanable_sqft INTEGER,
    customer_expectations TEXT,
    current_challenges TEXT,
    existing_scope TEXT,
    budget_range VARCHAR(100),
    decision_timeline VARCHAR(100),
    security_requirements TEXT,
    ai_completeness_score INTEGER,
    ai_summary TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE MISSING BID CALCULATOR TABLES
CREATE TABLE IF NOT EXISTS public.bid_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    walkthrough_id UUID REFERENCES walkthrough_assessments(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    client_id UUID,
    facility_profile_id UUID,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    requested_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bid_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    bid_request_id UUID REFERENCES bid_requests(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    cleanable_sqft INTEGER,
    frequency VARCHAR(50),
    visits_per_month DECIMAL(6,2),
    labor_hours_per_visit DECIMAL(8,2),
    labor_rate_card_id UUID,
    labor_cost_per_month DECIMAL(12,2),
    supply_cost_per_month DECIMAL(12,2),
    equipment_cost_per_month DECIMAL(12,2),
    overhead_pct DECIMAL(5,2) DEFAULT 15.0,
    overhead_amount DECIMAL(12,2),
    insurance_pct DECIMAL(5,2) DEFAULT 5.0,
    insurance_amount DECIMAL(12,2),
    target_margin_pct DECIMAL(5,2) DEFAULT 20.0,
    total_cost_per_month DECIMAL(12,2),
    min_bid_per_month DECIMAL(12,2),
    recommended_bid_per_month DECIMAL(12,2),
    premium_bid_per_month DECIMAL(12,2),
    annual_value DECIMAL(15,2),
    underbid_warning BOOLEAN DEFAULT FALSE,
    overbid_warning BOOLEAN DEFAULT FALSE,
    assumptions JSONB DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'draft',
    calculated_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE VIEW vw_bid_summary AS
SELECT
  br.id AS bid_request_id,
  br.tenant_id,
  br.title,
  br.status AS request_status,
  bv.id AS bid_version_id,
  bv.version_number,
  bv.recommended_bid_per_month,
  bv.min_bid_per_month,
  bv.premium_bid_per_month,
  bv.annual_value,
  bv.target_margin_pct,
  bv.underbid_warning,
  bv.overbid_warning,
  bv.status AS version_status,
  bv.created_at AS calculated_at,
  l.company_name AS lead_name
FROM bid_requests br
LEFT JOIN bid_versions bv ON bv.bid_request_id = br.id
LEFT JOIN leads l ON l.id = br.lead_id
ORDER BY bv.created_at DESC;

-- 5. CREATE MISSING CALL SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID,
  call_sid VARCHAR(255) UNIQUE,
  direction VARCHAR(20),
  from_number VARCHAR(50),
  to_number VARCHAR(50),
  caller_type VARCHAR(50),
  caller_entity_id UUID,
  caller_entity_type VARCHAR(50),
  workflow VARCHAR(50),
  status VARCHAR(30) DEFAULT 'initiated',
  duration_seconds INTEGER,
  language VARCHAR(20) DEFAULT 'en',
  recording_consent VARCHAR(20) DEFAULT 'pending',
  recording_sid VARCHAR(255),
  recording_url TEXT,
  recording_stored_at TIMESTAMP WITH TIME ZONE,
  intent VARCHAR(100),
  sentiment VARCHAR(30),
  ai_summary TEXT,
  escalated_to_human BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  handoff_user_id UUID,
  lead_created_id UUID REFERENCES leads(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.call_consent_logs (
  id UUID PRIMARY KEY DEFAULT
   uuid_generate_v4(),
  tenant_id UUID,
  call_session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  consent_type VARCHAR(50),
  disclosure_script_version VARCHAR(50),
  consent_state VARCHAR(20),
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.call_extracted_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID,
  call_session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  entity_type VARCHAR(100),
  entity_value TEXT,
  confidence DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.call_routing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID,
  call_session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  from_workflow VARCHAR(50),
  to_workflow VARCHAR(50),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    call_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
    speaker VARCHAR(50) CHECK (speaker IN ('ai', 'caller')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE MISSING LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(100),
    account_code VARCHAR(50),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    period_closed BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. GRANT API PERMISSIONS
-- This step fixes the 403 Forbidden errors by allowing the API to read/write the tables!
GRANT ALL ON TABLE public.leads TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.kb_entries TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.walkthrough_assessments TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.bid_requests TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.bid_versions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.call_sessions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.call_consent_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.call_extracted_entities TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.call_routing_events TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ai_call_transcripts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ledger TO anon, authenticated, service_role;

-- 8. DISABLE ROW LEVEL SECURITY (DEVELOPMENT MODE)
-- This ensures all queries work perfectly without complex user/tenant policies
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.walkthrough_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_consent_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_extracted_entities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_routing_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_call_transcripts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger DISABLE ROW LEVEL SECURITY;
