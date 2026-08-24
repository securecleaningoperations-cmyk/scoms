-- SCOMS Enterprise Schema v5 — Safe Extension Migration
-- Run after supabase_v2.sql — all statements use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- Never drops existing tables or data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- SOP MANAGEMENT
-- ==========================================
CREATE TABLE IF NOT EXISTS sops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) CHECK (category IN ('corporate','regional','franchise','client','location','task')),
    scope VARCHAR(100),
    version INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
    content TEXT,
    effective_date DATE,
    review_date DATE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sops ON sops;
CREATE POLICY tenant_isolation_sops ON sops USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS sop_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content TEXT,
    change_summary TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sop_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sop_versions ON sop_versions;
CREATE POLICY tenant_isolation_sop_versions ON sop_versions USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS sop_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
    sop_version INT NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL
);
ALTER TABLE sop_acknowledgments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sop_ack ON sop_acknowledgments;
CREATE POLICY tenant_isolation_sop_ack ON sop_acknowledgments USING (tenant_id = auth_tenant_id());

-- ==========================================
-- CALL-OUT & REPLACEMENT ENGINE
-- ==========================================
CREATE TABLE IF NOT EXISTS callouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    callout_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_start TIMESTAMP WITH TIME ZONE,
    reason_category VARCHAR(100) CHECK (reason_category IN ('sick','personal','emergency','no_show','late','other')),
    reason_notes TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','replacement_needed','replacement_found','covered','uncovered','excused')),
    supervisor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    supervisor_notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE callouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_callouts ON callouts;
CREATE POLICY tenant_isolation_callouts ON callouts USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS replacement_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    callout_id UUID REFERENCES callouts(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open','candidate_identified','accepted','rejected','escalated','closed')),
    assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE replacement_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_replacement ON replacement_requests;
CREATE POLICY tenant_isolation_replacement ON replacement_requests USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS replacement_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    request_id UUID REFERENCES replacement_requests(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    ai_score DECIMAL(5,2),
    ai_reason JSONB DEFAULT '[]',
    distance_km DECIMAL(8,2),
    status VARCHAR(30) DEFAULT 'suggested' CHECK (status IN ('suggested','contacted','accepted','declined','withdrawn')),
    contacted_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE replacement_candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_candidates ON replacement_candidates;
CREATE POLICY tenant_isolation_candidates ON replacement_candidates USING (tenant_id = auth_tenant_id());

-- ==========================================
-- GPS ATTENDANCE (EXTENDED)
-- ==========================================
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS callout_id UUID REFERENCES callouts(id);
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS geofence_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS distance_from_site_meters INT;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS exception_reason TEXT;

CREATE TABLE IF NOT EXISTS gps_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    event_type VARCHAR(50) CHECK (event_type IN ('arrival','departure','clock_in','clock_out','checkpoint','exception')),
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    accuracy_meters INT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_id TEXT,
    metadata JSONB
);
ALTER TABLE gps_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_gps ON gps_events;
CREATE POLICY tenant_isolation_gps ON gps_events USING (tenant_id = auth_tenant_id());

-- ==========================================
-- INCIDENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    incident_number VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) CHECK (type IN ('injury','near_miss','unsafe_condition','chemical','spill','property_damage','security','client_incident','equipment','other')),
    severity VARCHAR(30) DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
    status VARCHAR(30) DEFAULT 'reported' CHECK (status IN ('reported','under_investigation','corrective_action','closed')),
    location_id UUID,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    immediate_action TEXT,
    photos JSONB DEFAULT '[]',
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    investigated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    investigation_notes TEXT,
    root_cause TEXT,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_incidents ON incidents;
CREATE POLICY tenant_isolation_incidents ON incidents USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    update_type VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_inc_updates ON incident_updates;
CREATE POLICY tenant_isolation_inc_updates ON incident_updates USING (tenant_id = auth_tenant_id());

-- ==========================================
-- SUPPLY REQUESTS
-- ==========================================
CREATE TABLE IF NOT EXISTS supply_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    request_number VARCHAR(50),
    item_name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','approved','ordered','delivered','cancelled')),
    location_note TEXT,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    requested_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE supply_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supply ON supply_requests;
CREATE POLICY tenant_isolation_supply ON supply_requests USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    sku VARCHAR(100),
    quantity_on_hand DECIMAL(10,2) DEFAULT 0,
    minimum_quantity DECIMAL(10,2) DEFAULT 0,
    reorder_threshold DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50),
    unit_cost DECIMAL(10,2),
    location_note TEXT,
    last_restock_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_inventory ON inventory_items;
CREATE POLICY tenant_isolation_inventory ON inventory_items USING (tenant_id = auth_tenant_id());

-- ==========================================
-- SCOMS ACADEMY
-- ==========================================
CREATE TABLE IF NOT EXISTS academy_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    series_number INT,
    course_number INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    series_name VARCHAR(100),
    estimated_minutes INT DEFAULT 20,
    required_for_roles JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT FALSE,
    passing_score INT DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_academy ON academy_courses;
CREATE POLICY tenant_isolation_academy ON academy_courses USING (tenant_id = auth_tenant_id() OR tenant_id IS NULL);

CREATE TABLE IF NOT EXISTS academy_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    lesson_number INT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('welcome','why_it_matters','objectives','demonstration','mistakes','scenario','gold_standard','quiz','completion')),
    title VARCHAR(255),
    content TEXT,
    video_url TEXT,
    duration_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lessons ON academy_lessons;
CREATE POLICY tenant_isolation_lessons ON academy_lessons USING (tenant_id = auth_tenant_id() OR tenant_id IS NULL);

CREATE TABLE IF NOT EXISTS academy_quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INT NOT NULL,
    explanation TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE academy_quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_quiz ON academy_quiz_questions;
CREATE POLICY tenant_isolation_quiz ON academy_quiz_questions USING (tenant_id = auth_tenant_id() OR tenant_id IS NULL);

CREATE TABLE IF NOT EXISTS academy_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'assigned' CHECK (status IN ('assigned','in_progress','completed','failed','expired')),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INT,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE academy_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_assignments ON academy_assignments;
CREATE POLICY tenant_isolation_assignments ON academy_assignments USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS academy_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_progress ON academy_progress;
CREATE POLICY tenant_isolation_progress ON academy_progress USING (tenant_id = auth_tenant_id());

CREATE TABLE IF NOT EXISTS academy_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES academy_assignments(id) ON DELETE SET NULL,
    certificate_number VARCHAR(100),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at DATE,
    score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_certs_academy ON academy_certificates;
CREATE POLICY tenant_isolation_certs_academy ON academy_certificates USING (tenant_id = auth_tenant_id());

-- ==========================================
-- OPERATIONAL EVENTS (APPEND-ONLY LOG)
-- ==========================================
CREATE TABLE IF NOT EXISTS operational_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    source_module VARCHAR(100),
    payload JSONB,
    correlation_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE operational_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_op_events ON operational_events;
CREATE POLICY tenant_isolation_op_events ON operational_events USING (tenant_id = auth_tenant_id());

-- ==========================================
-- OFFLINE SYNC QUEUE (MOBILE)
-- ==========================================
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) CHECK (operation_type IN ('insert','update','delete')),
    table_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    local_id TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','synced','failed')),
    error_message TEXT,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_offline ON offline_sync_queue;
CREATE POLICY tenant_isolation_offline ON offline_sync_queue USING (tenant_id = auth_tenant_id());

-- ==========================================
-- NOTIFICATIONS (EXTEND EXISTING TABLE)
-- ==========================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal','important','urgent','emergency'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- ==========================================
-- JOBS (EXTEND WITH PROPER GPS/LOCATION)
-- ==========================================
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10,7);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location_lng DECIMAL(10,7);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS geofence_radius_meters INT DEFAULT 200;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sop_id UUID REFERENCES sops(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ==========================================
-- EMPLOYEES (EXTEND)
-- ==========================================
ALTER TABLE employees ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10,7);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS current_lng DECIMAL(10,7);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_clocked_in BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS current_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

-- ==========================================
-- PHONE CALLS (TWILIO INTEGRATION)
-- ==========================================
CREATE TABLE IF NOT EXISTS phone_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    twilio_call_sid TEXT UNIQUE,
    direction VARCHAR(10) CHECK (direction IN ('inbound','outbound')),
    from_number VARCHAR(50),
    to_number VARCHAR(50),
    caller_name VARCHAR(255),
    status VARCHAR(30) DEFAULT 'initiated',
    duration_seconds INT,
    recording_sid TEXT,
    recording_url TEXT,
    transcript TEXT,
    ai_summary TEXT,
    intent VARCHAR(100),
    caller_type VARCHAR(50) CHECK (caller_type IN ('new_customer','existing_customer','employee','applicant','vendor','unknown')),
    linked_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    linked_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    ai_actions JSONB DEFAULT '[]',
    ai_confidence DECIMAL(5,2),
    transferred_to UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE phone_calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_calls ON phone_calls;
CREATE POLICY tenant_isolation_calls ON phone_calls USING (tenant_id = auth_tenant_id());

-- ==========================================
-- AI RECOMMENDATIONS LOG
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    input_context JSONB,
    recommendation TEXT NOT NULL,
    confidence DECIMAL(5,2),
    source_data JSONB,
    model VARCHAR(100),
    human_decision VARCHAR(50),
    final_outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_rec ON ai_recommendations;
CREATE POLICY tenant_isolation_ai_rec ON ai_recommendations USING (tenant_id = auth_tenant_id());

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_callouts_employee ON callouts(employee_id);
CREATE INDEX IF NOT EXISTS idx_callouts_job ON callouts(job_id);
CREATE INDEX IF NOT EXISTS idx_callouts_status ON callouts(status);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant_status ON incidents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON supply_requests(status);
CREATE INDEX IF NOT EXISTS idx_academy_assignments_employee ON academy_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_academy_assignments_status ON academy_assignments(status);
CREATE INDEX IF NOT EXISTS idx_gps_events_employee ON gps_events(employee_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_operational_events_tenant ON operational_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phone_calls_tenant ON phone_calls(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sops_tenant_status ON sops(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, status);
