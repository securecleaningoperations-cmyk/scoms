import { supabase } from '@/lib/supabase';

/** Get the employee record for the currently authenticated user */
export async function getMyEmployee() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('employees')
    .select('*, users(email,first_name,last_name,role)')
    .eq('user_id', user.id)
    .single();
  if (error) return null;
  return data;
}

/** Get upcoming schedules for an employee */
export async function getMySchedule(employeeId: string) {
  const { data, error } = await supabase
    .from('schedules')
    .select('*, jobs(client, service, type, job_date, time, notes)')
    .eq('employee_id', employeeId)
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

/** Get all portal requests submitted by this employee */
export async function getMyRequests(employeeId: string) {
  const { data, error } = await supabase
    .from('employee_portal_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Submit a new portal request */
export async function submitEmployeeRequest(payload: {
  employee_id: string;
  request_type: string;
  title: string;
  description?: string;
  priority?: string;
  requested_date?: string;
  requested_date_end?: string;
}) {
  const { data, error } = await supabase
    .from('employee_portal_requests')
    .insert([{ ...payload, status: 'submitted' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Get issue reports submitted by this employee */
export async function getMyIssueReports(employeeId: string) {
  const { data, error } = await supabase
    .from('employee_issue_reports')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Submit an issue report */
export async function submitIssueReport(payload: {
  employee_id: string;
  issue_type: string;
  urgency: string;
  title: string;
  description?: string;
  job_id?: string;
  location_id?: string;
}) {
  const { data, error } = await supabase
    .from('employee_issue_reports')
    .insert([{ ...payload, status: 'open' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Get company announcements for this employee */
export async function getAnnouncements() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('employee_announcements')
    .select('*')
    .lte('publish_at', now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('is_urgent', { ascending: false })
    .order('publish_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

/** Get training acknowledgements for this employee */
export async function getMyAcknowledgements(employeeId: string) {
  const { data, error } = await supabase
    .from('training_acknowledgements')
    .select('*, documents(name,file_path)')
    .eq('employee_id', employeeId)
    .order('required_by', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Mark training acknowledgement as done */
export async function acknowledgeTraining(id: string) {
  const { error } = await supabase
    .from('training_acknowledgements')
    .update({ is_acknowledged: true, acknowledged_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ── Manager views ────────────────────────────────────────────────────────────

/** Get all employee requests (for managers/supervisors) */
export async function getAllEmployeeRequests(statusFilter?: string) {
  let query = supabase
    .from('employee_portal_requests')
    .select('*, employees(user_id,users(first_name,last_name))')
    .order('created_at', { ascending: false });
  if (statusFilter) query = query.eq('status', statusFilter);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Review an employee request */
export async function reviewEmployeeRequest(
  id: string,
  status: 'approved' | 'denied' | 'under_review',
  notes?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('employee_portal_requests')
    .update({
      status,
      review_notes: notes,
      reviewed_by: user?.id,
      resolved_at: ['approved', 'denied'].includes(status) ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) throw error;
}
