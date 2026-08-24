-- Run this script in your Supabase SQL Editor
-- This drops the strict role check constraint so you can add any role without errors.

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
