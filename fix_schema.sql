-- Fix missing performance_reviews table
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL DEFAULT 0,
    department VARCHAR(255),
    notes TEXT,
    review_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure jobs table has client and assigned columns just in case they were dropped
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS client VARCHAR(255);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS assigned VARCHAR(255);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- Disable RLS on performance_reviews as requested globally
ALTER TABLE public.performance_reviews DISABLE ROW LEVEL SECURITY;

-- VERY IMPORTANT: Force Supabase to reload the schema cache
NOTIFY pgrst, 'reload schema';
