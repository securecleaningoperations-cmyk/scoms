-- ============================================================
-- SCOMS v4 MIGRATION — PART 1
-- Customer Portal, Employee Portal, HR Recruiting
-- Run AFTER supabase_v2.sql and supabase_v3.sql
-- ============================================================

-- ============================================================
-- PATCH EXISTING TABLES
-- ============================================================

-- Clients: add portal support
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS primary_contact_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Walkthrough rooms: fix missing tenant_id + RLS
ALTER TABLE walkthrough_rooms ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE walkthrough_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rooms ON walkthrough_rooms;
CREATE POLICY tenant_isolation_rooms ON walkthrough_rooms
  USING (
    tenant_id = auth_tenant_id()
    OR walkthrough_id IN (
      SELECT id FROM walkthrough_assessments WHERE tenant_id = auth_tenant_id()
    )
  );

-- ============================================================
-- CUSTOMER PORTAL USERS
-- Links auth.users → clients with portal role + permissions
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_portal_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  portal_role VARCHAR(50) NOT NULL DEFAULT 'client_user'
    CHECK (portal_role IN ('client_admin', 'location_manager', 'billing_contact', 'read_only')),
  can_view_invoices BOOLEAN DEFAULT TRUE,
  can_view_contracts BOOLEAN DEFAULT TRUE,
  can_submit_requests BOOLEAN DEFAULT TRUE,
  can_view_documents BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);
CREATE INDEX IF NOT EXISTS idx_cpu_user ON customer_portal_users(user_id);
CREATE INDEX IF NOT EXISTS idx_cpu_client ON customer_portal_users(client_id);
CREATE INDEX IF NOT EXISTS idx_cpu_tenant ON customer_portal_users(tenant_id);
ALTER TABLE customer_portal_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cpu_own_record ON customer_portal_users;
CREATE POLICY cpu_own_record ON customer_portal_users
  USING (user_id = auth.uid() OR tenant_id = auth_tenant_id());

-- ============================================================
-- CUSTOMER LOCATIONS
-- Multi-location support per client account
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cl_client ON customer_locations(client_id);
CREATE INDEX IF NOT EXISTS idx_cl_tenant ON customer_locations(tenant_id);
ALTER TABLE customer_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customer_locations ON customer_locations;
CREATE POLICY tenant_isolation_customer_locations ON customer_locations
  USING (
    tenant_id = auth_tenant_id()
    OR client_id IN (
      SELECT client_id FROM customer_portal_users WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- ============================================================
-- SERVICE SCHEDULES
-- Customer-visible cleaning schedule records
-- ============================================================
CREATE TABLE IF NOT EXISTS service_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  location_id UUID REFERENCES customer_locations(id) ON DELETE SET NULL,
  contract_id UUID, -- FK added in part 2 after contracts table
  service_type VARCHAR(100),
  frequency VARCHAR(50) CHECK (frequency IN (
    'daily','weekly','biweekly','monthly','quarterly','one_time','custom'
  )),
  schedule_days JSONB DEFAULT '[]', -- ["Monday","Wednesday","Friday"]
  start_time TIME,
  end_time TIME,
  special_instructions TEXT,
  effective_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active','paused','cancelled','completed'
  )),
  temporary_change_note TEXT,
  last_modified_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ss_client ON service_schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_ss_location ON service_schedules(location_id);
CREATE INDEX IF NOT EXISTS idx_ss_tenant ON service_schedules(tenant_id);
ALTER TABLE service_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_service_schedules ON service_schedules;
CREATE POLICY tenant_isolation_service_schedules ON service_schedules
  USING (
    tenant_id = auth_tenant_id()
    OR client_id IN (
      SELECT client_id FROM customer_portal_users WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- ============================================================
-- SERVICE REQUESTS
-- Customer-submitted requests via portal
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  location_id UUID REFERENCES customer_locations(id) ON DELETE SET NULL,
  submitted_by_user_id UUID REFERENCES auth.users(id),
  request_number VARCHAR(50),
  category VARCHAR(100) CHECK (category IN (
    'additional_cleaning','missed_service','schedule_change',
    'special_instructions','emergency_cleaning','general_question','other'
  )),
  priority VARCHAR(30) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requested_date DATE,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
    'submitted','acknowledged','in_review','scheduled','in_progress','completed','cancelled'
  )),
  assigned_to UUID REFERENCES users(id),
  internal_notes TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sr_client ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_sr_tenant ON service_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sr_status ON service_requests(status);
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_service_requests ON service_requests;
-- Staff see all in tenant; customers see own location's requests
CREATE POLICY tenant_isolation_service_requests ON service_requests
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
-- SERVICE COMPLAINTS
-- Complaint submission + issue resolution tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS service_complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  location_id UUID REFERENCES customer_locations(id) ON DELETE SET NULL,
  submitted_by_user_id UUID REFERENCES auth.users(id),
  complaint_number VARCHAR(50),
  category VARCHAR(100) CHECK (category IN (
    'quality_issue','missed_area','damaged_property','staff_conduct',
    'billing_issue','communication_issue','safety_concern','other'
  )),
  priority VARCHAR(30) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  incident_date DATE,
  attachments JSONB DEFAULT '[]', -- array of Supabase Storage URLs
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
    'submitted','acknowledged','under_review','action_taken','resolved','closed'
  )),
  assigned_to UUID REFERENCES users(id),
  internal_notes TEXT,
  customer_visible_update TEXT, -- shown to customer
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  satisfaction_rating INT CHECK (satisfaction_rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sc_client ON service_complaints(client_id);
CREATE INDEX IF NOT EXISTS idx_sc_tenant ON service_complaints(tenant_id);
ALTER TABLE service_complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_service_complaints ON service_complaints;
CREATE POLICY tenant_isolation_service_complaints ON service_complaints
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
-- EMPLOYEE PORTAL REQUESTS
-- Time off, availability updates, equipment, payroll questions, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_portal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  request_type VARCHAR(100) CHECK (request_type IN (
    'time_off','availability_update','equipment_request','uniform_request',
    'payroll_question','schedule_question','incident_report',
    'operational_concern','general_support','other'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(30) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  requested_date DATE,
  requested_date_end DATE,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
    'submitted','acknowledged','under_review','approved','denied','completed','cancelled'
  )),
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_epr_employee ON employee_portal_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_epr_tenant ON employee_portal_requests(tenant_id);
ALTER TABLE employee_portal_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_epr ON employee_portal_requests;
-- Employee sees own; manager/admin sees all in tenant
CREATE POLICY tenant_isolation_epr ON employee_portal_requests
  USING (
    tenant_id = auth_tenant_id()
    OR employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- EMPLOYEE ISSUE REPORTS
-- Site issues, safety, supply shortages, customer concerns
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_issue_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  location_id UUID REFERENCES customer_locations(id) ON DELETE SET NULL,
  issue_type VARCHAR(100) CHECK (issue_type IN (
    'site_issue','safety_hazard','supply_shortage','customer_concern',
    'attendance_issue','equipment_failure','access_issue','other'
  )),
  urgency VARCHAR(30) DEFAULT 'normal' CHECK (urgency IN ('low','normal','high','emergency')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  photos JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN (
    'open','acknowledged','in_progress','resolved','closed'
  )),
  assigned_manager UUID REFERENCES users(id),
  response_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_eir_employee ON employee_issue_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_eir_tenant ON employee_issue_reports(tenant_id);
ALTER TABLE employee_issue_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eir ON employee_issue_reports;
CREATE POLICY tenant_isolation_eir ON employee_issue_reports
  USING (
    tenant_id = auth_tenant_id()
    OR employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- EMPLOYEE ANNOUNCEMENTS
-- Company-wide and targeted notices
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  audience VARCHAR(50) DEFAULT 'all' CHECK (audience IN (
    'all','field_employees','supervisors','managers','specific_location'
  )),
  location_filter UUID REFERENCES customer_locations(id) ON DELETE SET NULL,
  is_urgent BOOLEAN DEFAULT FALSE,
  publish_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ea_tenant ON employee_announcements(tenant_id);
ALTER TABLE employee_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ea ON employee_announcements;
CREATE POLICY tenant_isolation_ea ON employee_announcements
  USING (tenant_id = auth_tenant_id());

-- ============================================================
-- TRAINING ACKNOWLEDGEMENTS
-- Employee acknowledgement of policies/handbooks/procedures
-- ============================================================
CREATE TABLE IF NOT EXISTS training_acknowledgements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  training_id UUID REFERENCES trainings(id) ON DELETE SET NULL,
  document_title VARCHAR(255) NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  required_by DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ta_employee ON training_acknowledgements(employee_id);
CREATE INDEX IF NOT EXISTS idx_ta_tenant ON training_acknowledgements(tenant_id);
ALTER TABLE training_acknowledgements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ta ON training_acknowledgements;
CREATE POLICY tenant_isolation_ta ON training_acknowledgements
  USING (
    tenant_id = auth_tenant_id()
    OR employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- APPLICANTS (HR Recruiting)
-- Proper applicant records separate from leads
-- ============================================================
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  position_applied VARCHAR(255),
  location_preference VARCHAR(255),
  source VARCHAR(100) CHECK (source IN (
    'ai_phone','web_portal','referral','job_board','walk_in','recruiter','other'
  )),
  call_session_id UUID, -- FK to call_sessions in part 2
  resume_url TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
    'new','screening','phone_screened','interview_scheduled',
    'interviewed','offer_extended','hired','rejected','withdrawn','archived'
  )),
  stage_notes TEXT,
  ai_screening_summary TEXT,
  ai_recommendation VARCHAR(30) CHECK (ai_recommendation IN (
    'proceed','hold','reject','needs_review'
  )),
  assigned_recruiter UUID REFERENCES users(id),
  rejection_reason TEXT,
  hired_as_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_tenant ON applicants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_app_status ON applicants(status);
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_applicants ON applicants;
CREATE POLICY tenant_isolation_applicants ON applicants
  USING (tenant_id = auth_tenant_id());

-- ============================================================
-- APPLICANT SCREENING RESULTS
-- AI phone screening outputs per applicant
-- ============================================================
CREATE TABLE IF NOT EXISTS applicant_screening_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  screening_type VARCHAR(50) DEFAULT 'ai_phone' CHECK (screening_type IN ('ai_phone','manual','written')),
  questions_asked JSONB DEFAULT '[]',
  answers_captured JSONB DEFAULT '[]',
  score DECIMAL(5,2),
  recommendation VARCHAR(30) CHECK (recommendation IN ('proceed','hold','reject')),
  summary TEXT,
  flags JSONB DEFAULT '[]', -- concern flags raised
  screened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_asr_applicant ON applicant_screening_results(applicant_id);
ALTER TABLE applicant_screening_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_asr ON applicant_screening_results;
CREATE POLICY tenant_isolation_asr ON applicant_screening_results
  USING (tenant_id = auth_tenant_id());

-- ============================================================
-- INTERVIEW SCHEDULES
-- Interview slots per applicant
-- ============================================================
CREATE TABLE IF NOT EXISTS interview_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES users(id),
  interview_type VARCHAR(50) CHECK (interview_type IN ('phone','in_person','video','panel')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 30,
  location_or_link TEXT,
  status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN (
    'scheduled','confirmed','completed','rescheduled','cancelled','no_show'
  )),
  outcome VARCHAR(30) CHECK (outcome IN ('passed','failed','pending','rescheduled')),
  notes TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_is_applicant ON interview_schedules(applicant_id);
CREATE INDEX IF NOT EXISTS idx_is_tenant ON interview_schedules(tenant_id);
ALTER TABLE interview_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_interview ON interview_schedules;
CREATE POLICY tenant_isolation_interview ON interview_schedules
  USING (tenant_id = auth_tenant_id());

-- ============================================================
-- HELPER VIEW: HR Recruiting Pipeline Summary
-- ============================================================
CREATE OR REPLACE VIEW vw_applicant_pipeline AS
SELECT
  a.tenant_id,
  a.status,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE a.source = 'ai_phone') AS from_ai_phone,
  COUNT(*) FILTER (WHERE a.ai_recommendation = 'proceed') AS ai_recommended,
  COUNT(*) FILTER (WHERE a.status = 'hired') AS hired_count
FROM applicants a
GROUP BY a.tenant_id, a.status;
