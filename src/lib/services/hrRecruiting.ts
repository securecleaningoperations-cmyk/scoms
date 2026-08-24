import { supabase } from '@/lib/supabase';

// ── HR Recruiting Service ────────────────────────────────────────────────────

export async function getApplicants(statusFilter?: string) {
  let query = supabase
    .from('applicants')
    .select('*, interview_schedules(id,scheduled_at,status,outcome), applicant_screening_results(id,score,recommendation)')
    .order('created_at', { ascending: false });
  if (statusFilter && statusFilter !== 'all') query = query.eq('status', statusFilter);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getApplicant(id: string) {
  const { data, error } = await supabase
    .from('applicants')
    .select('*, interview_schedules(*), applicant_screening_results(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createApplicant(payload: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position_applied?: string;
  location_preference?: string;
  source: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('applicants')
    .insert([{ ...payload, status: 'new' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateApplicantStatus(
  id: string,
  status: string,
  stageNotes?: string,
  rejectionReason?: string
) {
  const { error } = await supabase
    .from('applicants')
    .update({ status, stage_notes: stageNotes, rejection_reason: rejectionReason, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function scheduleInterview(payload: {
  applicant_id: string;
  interviewer_id?: string;
  interview_type: string;
  scheduled_at: string;
  duration_minutes?: number;
  location_or_link?: string;
}) {
  const { data, error } = await supabase
    .from('interview_schedules')
    .insert([{ ...payload, status: 'scheduled' }])
    .select()
    .single();
  if (error) throw error;
  // Update applicant status
  await supabase.from('applicants').update({ status: 'interview_scheduled' }).eq('id', payload.applicant_id);
  return data;
}

export async function getPipelineSummary() {
  const { data, error } = await supabase.from('vw_applicant_pipeline').select('*');
  if (error) throw error;
  return data ?? [];
}
