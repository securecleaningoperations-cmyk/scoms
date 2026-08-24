-- SCOMS v4 MIGRATION — PART 3: Bid Calculator, Call Sessions, Knowledge Base, Admin Config

-- ============================================================
-- FACILITY PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS facility_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  facility_type VARCHAR(100),
  total_sqft INTEGER,
  cleanable_sqft INTEGER,
  floors INTEGER,
  restrooms INTEGER,
  occupancy_count INTEGER,
  traffic_level VARCHAR(30) CHECK (traffic_level IN ('low','medium','high','very_high')),
  operating_hours JSONB,
  security_level VARCHAR(30) CHECK (security_level IN ('open','badge','clearance','restricted')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE facility_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY fp_tenant ON facility_profiles USING (tenant_id = auth_tenant_id());

-- ============================================================
-- LABOR RATE CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS labor_rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role_type VARCHAR(100),
  hourly_rate DECIMAL(10,2) NOT NULL,
  burden_rate_pct DECIMAL(5,2) DEFAULT 30.0,
  effective_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE labor_rate_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY lrc_tenant ON labor_rate_cards USING (tenant_id = auth_tenant_id());

-- ============================================================
-- PRODUCTIVITY PROFILES
-- sqft/hour by task and facility type
-- ============================================================
CREATE TABLE IF NOT EXISTS productivity_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(100),
  sqft_per_hour DECIMAL(10,2) NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE productivity_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY pp_tenant ON productivity_profiles USING (tenant_id = auth_tenant_id());

-- ============================================================
-- SUPPLY COST PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS supply_cost_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  cost_per_sqft DECIMAL(10,4),
  cost_per_unit DECIMAL(10,2),
  unit VARCHAR(50),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE supply_cost_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY scp_tenant ON supply_cost_profiles USING (tenant_id = auth_tenant_id());

-- ============================================================
-- MARKET PRICING SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS market_pricing_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  region VARCHAR(100),
  facility_type VARCHAR(100),
  avg_price_per_sqft DECIMAL(10,4),
  min_price_per_sqft DECIMAL(10,4),
  max_price_per_sqft DECIMAL(10,4),
  source VARCHAR(255),
  snapshot_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE market_pricing_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY mps_tenant ON market_pricing_snapshots USING (tenant_id = auth_tenant_id());

-- ============================================================
-- BID REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS bid_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  walkthrough_id UUID REFERENCES walkthrough_assessments(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  facility_profile_id UUID REFERENCES facility_profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN (
    'open','calculating','in_review','approved','sent_to_proposal','archived'
  )),
  requested_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_br_tenant ON bid_requests(tenant_id);
ALTER TABLE bid_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY br_tenant ON bid_requests USING (tenant_id = auth_tenant_id());

-- ============================================================
-- BID VERSIONS
-- Each calculation run is a versioned record
-- ============================================================
CREATE TABLE IF NOT EXISTS bid_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_request_id UUID NOT NULL REFERENCES bid_requests(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 1,
  cleanable_sqft INTEGER,
  frequency VARCHAR(50),
  visits_per_month DECIMAL(6,2),
  -- Labor
  labor_hours_per_visit DECIMAL(8,2),
  labor_rate_card_id UUID REFERENCES labor_rate_cards(id),
  labor_cost_per_month DECIMAL(12,2),
  -- Supplies
  supply_cost_per_month DECIMAL(12,2),
  -- Equipment
  equipment_cost_per_month DECIMAL(12,2),
  -- Overhead
  overhead_pct DECIMAL(5,2) DEFAULT 15.0,
  overhead_amount DECIMAL(12,2),
  -- Insurance
  insurance_pct DECIMAL(5,2) DEFAULT 5.0,
  insurance_amount DECIMAL(12,2),
  -- Profit
  target_margin_pct DECIMAL(5,2) DEFAULT 20.0,
  -- Outputs
  total_cost_per_month DECIMAL(12,2),
  min_bid_per_month DECIMAL(12,2),
  recommended_bid_per_month DECIMAL(12,2),
  premium_bid_per_month DECIMAL(12,2),
  annual_value DECIMAL(15,2),
  -- Analysis
  underbid_warning BOOLEAN DEFAULT FALSE,
  overbid_warning BOOLEAN DEFAULT FALSE,
  market_comparison JSONB,
  assumptions JSONB DEFAULT '{}',
  -- Status
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
    'draft','approved','sent','archived'
  )),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  calculated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bv_request ON bid_versions(bid_request_id);
ALTER TABLE bid_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY bv_tenant ON bid_versions USING (tenant_id = auth_tenant_id());

-- Link proposals.bid_version_id now that bid_versions exists
ALTER TABLE proposals ADD CONSTRAINT fk_proposal_bid
  FOREIGN KEY (bid_version_id) REFERENCES bid_versions(id) ON DELETE SET NULL NOT VALID;

-- Link applicants.call_session_id — added after call_sessions below

-- ============================================================
-- BID LINE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS bid_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_version_id UUID NOT NULL REFERENCES bid_versions(id) ON DELETE CASCADE,
  category VARCHAR(50) CHECK (category IN (
    'labor','supplies','equipment','overhead','insurance','other'
  )),
  description TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  unit_cost DECIMAL(12,4),
  total_cost DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bli_bid ON bid_line_items(bid_version_id);
ALTER TABLE bid_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY bli_tenant ON bid_line_items USING (tenant_id = auth_tenant_id());

-- ============================================================
-- BID SCENARIOS (min/recommended/premium)
-- ============================================================
CREATE TABLE IF NOT EXISTS bid_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_version_id UUID NOT NULL REFERENCES bid_versions(id) ON DELETE CASCADE,
  scenario_name VARCHAR(50) CHECK (scenario_name IN ('minimum','recommended','premium','custom')),
  monthly_price DECIMAL(12,2),
  margin_pct DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE bid_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY bs_tenant ON bid_scenarios USING (tenant_id = auth_tenant_id());

-- ============================================================
-- PROFITABILITY ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS profitability_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bid_version_id UUID REFERENCES bid_versions(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  analysis_type VARCHAR(20) CHECK (analysis_type IN ('bid','contract','post_service')),
  total_revenue DECIMAL(12,2),
  total_cost DECIMAL(12,2),
  gross_profit DECIMAL(12,2),
  margin_pct DECIMAL(5,2),
  risk_level VARCHAR(10) CHECK (risk_level IN ('low','medium','high')),
  recommendation TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE profitability_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY profitability_tenant ON profitability_analysis USING (tenant_id = auth_tenant_id());

-- ============================================================
-- CALL SESSIONS (extended from ai_voice_calls)
-- ============================================================
CREATE TABLE IF NOT EXISTS call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  call_sid VARCHAR(255) UNIQUE,
  direction VARCHAR(20) CHECK (direction IN ('inbound','outbound')),
  from_number VARCHAR(50),
  to_number VARCHAR(50),
  caller_type VARCHAR(50) CHECK (caller_type IN (
    'new_customer','existing_customer','employee','applicant','vendor','unknown'
  )),
  caller_entity_id UUID,
  caller_entity_type VARCHAR(50),
  workflow VARCHAR(50) CHECK (workflow IN (
    'new_lead','service_request','employee_support','applicant_screening',
    'vendor_inquiry','after_hours','emergency','general'
  )),
  status VARCHAR(30) DEFAULT 'initiated' CHECK (status IN (
    'initiated','ringing','in_progress','on_hold','transferred','completed',
    'abandoned','failed','voicemail'
  )),
  duration_seconds INTEGER,
  language VARCHAR(20) DEFAULT 'en',
  -- Consent/Recording
  recording_consent VARCHAR(20) DEFAULT 'pending' CHECK (recording_consent IN (
    'pending','granted','declined','not_required'
  )),
  recording_sid VARCHAR(255),
  recording_url TEXT,
  recording_stored_at TIMESTAMP WITH TIME ZONE,
  -- AI Processing
  intent VARCHAR(100),
  sentiment VARCHAR(30),
  ai_summary TEXT,
  escalated_to_human BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  handoff_user_id UUID REFERENCES users(id),
  -- Outcomes
  lead_created_id UUID REFERENCES leads(id),
  ticket_created_id UUID REFERENCES support_tickets(id),
  applicant_created_id UUID REFERENCES applicants(id),
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cs_tenant ON call_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cs_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cs_caller_type ON call_sessions(caller_type);
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cs_tenant ON call_sessions USING (tenant_id = auth_tenant_id());

-- Link applicants.call_session_id
ALTER TABLE applicants ADD CONSTRAINT fk_applicant_call
  FOREIGN KEY (call_session_id) REFERENCES call_sessions(id) ON DELETE SET NULL NOT VALID;

-- ============================================================
-- CALL CONSENT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS call_consent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) CHECK (consent_type IN ('recording','ai_processing','data_retention')),
  disclosure_script_version VARCHAR(50),
  consent_state VARCHAR(20) CHECK (consent_state IN ('granted','declined','timeout','not_applicable')),
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE call_consent_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY ccl_tenant ON call_consent_logs USING (tenant_id = auth_tenant_id());

-- ============================================================
-- CALL EXTRACTED ENTITIES
-- Structured info extracted by AI from the call
-- ============================================================
CREATE TABLE IF NOT EXISTS call_extracted_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  entity_type VARCHAR(100),
  entity_value TEXT,
  confidence DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE call_extracted_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY cee_tenant ON call_extracted_entities USING (tenant_id = auth_tenant_id());

-- ============================================================
-- CALL ROUTING EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS call_routing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  from_workflow VARCHAR(50),
  to_workflow VARCHAR(50),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE call_routing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY cre_tenant ON call_routing_events USING (tenant_id = auth_tenant_id());

-- ============================================================
-- KB ENTRIES (replaces basic ai_knowledge_base with approval workflow)
-- ============================================================
CREATE TABLE IF NOT EXISTS kb_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category VARCHAR(100) CHECK (category IN (
    'sales','customer_service','employee_support','recruiting',
    'vendor_inquiry','billing','general','emergency','routing'
  )),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  approved_for_ai BOOLEAN DEFAULT FALSE,
  visibility VARCHAR(30) DEFAULT 'internal' CHECK (visibility IN (
    'internal','ai_only','customer_portal','employee_portal','public'
  )),
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
    'draft','in_review','approved','published','unpublished','archived'
  )),
  version_number INT DEFAULT 1,
  created_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kb_tenant ON kb_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_status ON kb_entries(status);
CREATE INDEX IF NOT EXISTS idx_kb_category ON kb_entries(category);
ALTER TABLE kb_entries ENABLE ROW LEVEL SECURITY;
-- Published+approved visible to all authenticated in tenant; drafts only to admins
DROP POLICY IF EXISTS kb_read ON kb_entries;
CREATE POLICY kb_read ON kb_entries USING (
  tenant_id = auth_tenant_id()
  AND (
    status IN ('published')
    OR EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND u.role IN ('super_admin','corporate_admin','operations_manager','hr_manager')
    )
  )
);

-- ============================================================
-- KB VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS kb_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kb_entry_id UUID NOT NULL REFERENCES kb_entries(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  content TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  change_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE kb_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY kbv_tenant ON kb_versions USING (tenant_id = auth_tenant_id());

-- ============================================================
-- BUSINESS HOURS
-- ============================================================
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  UNIQUE(tenant_id, day_of_week)
);
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY bh_tenant ON business_hours USING (tenant_id = auth_tenant_id());

-- ============================================================
-- HOLIDAY SCHEDULES
-- ============================================================
CREATE TABLE IF NOT EXISTS holiday_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  holiday_name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT TRUE,
  after_hours_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE holiday_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY hs_tenant ON holiday_schedules USING (tenant_id = auth_tenant_id());

-- ============================================================
-- SERVICE AREAS
-- ============================================================
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(50),
  cities JSONB DEFAULT '[]',
  zip_codes JSONB DEFAULT '[]',
  assigned_branch VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY sa_tenant ON service_areas USING (tenant_id = auth_tenant_id());

-- ============================================================
-- CALL ROUTING RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS call_routing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  trigger_condition VARCHAR(100),
  caller_type VARCHAR(50),
  time_condition VARCHAR(50) CHECK (time_condition IN ('business_hours','after_hours','always')),
  action VARCHAR(100),
  target_workflow VARCHAR(50),
  target_user_id UUID REFERENCES users(id),
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE call_routing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY crr_tenant ON call_routing_rules USING (tenant_id = auth_tenant_id());

-- ============================================================
-- COMPLIANCE RULES (recording/consent by jurisdiction)
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  jurisdiction VARCHAR(100),
  requires_consent BOOLEAN DEFAULT TRUE,
  consent_parties INT DEFAULT 1 CHECK (consent_parties IN (1,2)),
  disclosure_script TEXT,
  recording_allowed BOOLEAN DEFAULT TRUE,
  retention_days INT DEFAULT 90,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY compr_tenant ON compliance_rules USING (tenant_id = auth_tenant_id());

-- ============================================================
-- CONFIG CHANGE LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS config_change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id),
  config_area VARCHAR(100),
  setting_key VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE config_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY cclog_tenant ON config_change_log USING (tenant_id = auth_tenant_id());

-- ============================================================
-- WALKTHROUGH PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS walkthrough_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  walkthrough_id UUID NOT NULL REFERENCES walkthrough_assessments(id) ON DELETE CASCADE,
  room_id UUID REFERENCES walkthrough_rooms(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE walkthrough_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY wp_tenant ON walkthrough_photos USING (tenant_id = auth_tenant_id());

-- ============================================================
-- BID CALCULATOR VIEW
-- ============================================================
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
  l.company_name AS lead_name,
  c.name AS client_name
FROM bid_requests br
LEFT JOIN bid_versions bv ON bv.bid_request_id = br.id
LEFT JOIN leads l ON l.id = br.lead_id
LEFT JOIN clients c ON c.id = br.client_id
ORDER BY bv.created_at DESC;
