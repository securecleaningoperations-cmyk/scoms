-- SCOMS Enterprise v6.1 - Document Management, Lead Intelligence, Communications & AI Phone Agent

-- 1. Document Management Center
CREATE TABLE IF NOT EXISTS public.enterprise_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- employee, client, vendor, corporate, financial, operations
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'Active', -- Active, Archived, Pending Signature
    retention_schedule_years INT DEFAULT 5,
    contains_pii BOOLEAN DEFAULT false,
    requires_original BOOLEAN DEFAULT false,
    entity_id UUID, -- Can link to employee_id, client_id, vendor_id, etc.
    entity_type VARCHAR(50), -- 'employee', 'client', 'vendor', 'contract'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Access Log (Audit Trail)
CREATE TABLE IF NOT EXISTS public.document_access_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES public.enterprise_documents(id) ON DELETE CASCADE,
    accessed_by UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL, -- 'view', 'download', 'sign', 'archive'
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 2. Lead Intelligence Center
CREATE TABLE IF NOT EXISTS public.sales_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    facility_type VARCHAR(100),
    square_footage INT,
    cleaning_frequency VARCHAR(100),
    status VARCHAR(50) DEFAULT 'New', -- New, Qualified, Walkthrough Scheduled, Proposal Sent, Won, Lost
    lead_quality_score INT DEFAULT 0, -- AI Score 0-4
    lead_tier VARCHAR(100),
    recommended_package VARCHAR(50), -- silver, gold, platinum
    close_probability NUMERIC(4,3),
    estimated_monthly_revenue NUMERIC(10,2),
    assigned_to UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. Communications & Zoom Integration
CREATE TABLE IF NOT EXISTS public.communications_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'call', 'email', 'zoom', 'sms'
    direction VARCHAR(50), -- 'inbound', 'outbound'
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    subject VARCHAR(255),
    body TEXT,
    duration_seconds INT,
    recording_url TEXT,
    entity_type VARCHAR(50), -- 'lead', 'client', 'employee', 'vendor'
    entity_id UUID,
    created_by UUID REFERENCES auth.users(id),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.zoom_meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meeting_id VARCHAR(100) NOT NULL,
    join_url TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INT,
    topic VARCHAR(255),
    host_id UUID REFERENCES auth.users(id),
    communication_log_id UUID REFERENCES public.communications_log(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 4. AI Phone Agent Interaction Log
CREATE TABLE IF NOT EXISTS public.ai_phone_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    call_sid VARCHAR(100) UNIQUE,
    from_number VARCHAR(50),
    caller_type VARCHAR(50), -- new_customer, existing_customer, employee, applicant, vendor, general
    department_route VARCHAR(50),
    is_emergency BOOLEAN DEFAULT false,
    urgency_rating INT DEFAULT 1,
    sentiment VARCHAR(50),
    transcript TEXT,
    recommended_action TEXT,
    twiml_greeting TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply RLS (example placeholder, adjust to specific tenant needs)
ALTER TABLE public.enterprise_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoom_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_phone_interactions ENABLE ROW LEVEL SECURITY;

-- Disable RLS for now to ensure MVP works
ALTER TABLE public.enterprise_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoom_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_phone_interactions DISABLE ROW LEVEL SECURITY;
