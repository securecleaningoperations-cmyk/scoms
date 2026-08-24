-- Comprehensive Schema Fix for Clients, Jobs, and Contracts

-- 1. Fix missing columns on clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_id VARCHAR(50);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS type VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS properties_count INTEGER;

-- 2. Fix missing columns on jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS service VARCHAR(255);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS crew_size INTEGER DEFAULT 1;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS time VARCHAR(50);

-- 3. Fix missing columns on contracts table
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS contract_number VARCHAR(50);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS billing_frequency VARCHAR(20);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS signed_by_client BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS signed_by_company BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS terms TEXT;

-- Disable RLS on these tables just in case it was re-enabled
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals DISABLE ROW LEVEL SECURITY;

-- 4. Add missing columns for mobile app job execution
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS evidence_urls JSONB;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS checklist_data JSONB;

-- 5. Create Time Records table for GPS Clock-ins
CREATE TABLE IF NOT EXISTS public.time_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID, -- References jobs(id) if jobs id is UUID, else VARCHAR
    employee_id UUID,
    event_type VARCHAR(50),
    gps_lat DOUBLE PRECISION,
    gps_lon DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Communications table for Chat
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID,
    sender_id UUID,
    sender_name VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Training table
CREATE TABLE IF NOT EXISTS public.training (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255),
    duration VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create Supplies table
CREATE TABLE IF NOT EXISTS public.supplies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name VARCHAR(255),
    quantity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Insert some dummy training data if none exists
INSERT INTO public.training (title, duration)
SELECT 'Chemical Safety & Hazmat SOP', '15 mins'
WHERE NOT EXISTS (SELECT 1 FROM public.training LIMIT 1);

INSERT INTO public.training (title, duration)
SELECT 'Basic Sanitization Protocols', '20 mins'
WHERE NOT (SELECT COUNT(*) FROM public.training) > 1;

-- Disable RLS on new tables to prevent access issues during development
ALTER TABLE public.time_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies DISABLE ROW LEVEL SECURITY;

-- 10. Create a view for public profiles so users can find each other for direct messaging
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
    id, 
    raw_user_meta_data->>'full_name' AS full_name, 
    raw_user_meta_data->>'role' AS role,
    email
FROM auth.users;

GRANT SELECT ON public.profiles TO authenticated, anon;

-- 11. Create a dedicated chat_messages table (since communications already exists and is used for meetings)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID,
    thread_type VARCHAR(50) DEFAULT 'job',
    sender_id UUID,
    recipient_id UUID,
    sender_name VARCHAR(255),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Reload PostgREST schema cache to immediately reflect the new columns in the API
NOTIFY pgrst, 'reload schema';
