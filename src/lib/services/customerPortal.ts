import { supabase } from '@/lib/supabase';

// ── Customer Portal Service ──────────────────────────────────────────────────
// All queries are tenant-scoped via RLS. Never bypass RLS from this layer.

/** Get the portal user record for the currently authenticated user */
export async function getPortalUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('customer_portal_users')
    .select('*, clients(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return data;
}

/** Get all locations for a customer's client account */
export async function getClientLocations(clientId: string) {
  const { data, error } = await supabase
    .from('customer_locations')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('is_primary', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Get service schedule for a client (optionally filtered by location) */
export async function getServiceSchedule(clientId: string, locationId?: string) {
  let query = supabase
    .from('service_schedules')
    .select('*, customer_locations(name,address)')
    .eq('client_id', clientId)
    .eq('status', 'active');
  if (locationId) query = query.eq('location_id', locationId);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Get service requests for a client */
export async function getServiceRequests(clientId: string, locationId?: string) {
  let query = supabase
    .from('service_requests')
    .select('*, customer_locations(name)')
    .eq('client_id', clientId);
  if (locationId) query = query.eq('location_id', locationId);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Submit a new service request */
export async function submitServiceRequest(payload: {
  client_id: string;
  location_id?: string;
  category: string;
  priority: string;
  title: string;
  description?: string;
  requested_date?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  const requestNumber = `SR-${Date.now().toString().slice(-6)}`;
  const { data, error } = await supabase
    .from('service_requests')
    .insert([{ ...payload, submitted_by_user_id: user?.id, request_number: requestNumber, status: 'submitted' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Get complaints for a client */
export async function getComplaints(clientId: string) {
  const { data, error } = await supabase
    .from('service_complaints')
    .select('*, customer_locations(name)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Submit a new complaint */
export async function submitComplaint(payload: {
  client_id: string;
  location_id?: string;
  category: string;
  priority: string;
  title: string;
  description?: string;
  incident_date?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  const num = `CMP-${Date.now().toString().slice(-6)}`;
  const { data, error } = await supabase
    .from('service_complaints')
    .insert([{ ...payload, submitted_by_user_id: user?.id, complaint_number: num, status: 'submitted' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Get portal-accessible invoices for a client */
export async function getPortalInvoices(clientId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_line_items(*)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Get portal-accessible documents for a client */
export async function getPortalDocuments(clientId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('entity_id', clientId)
    .in('category', ['client', 'financial'])
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Get communication history visible to customer */
export async function getPortalCommunications(clientId: string) {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .eq('entity_id', clientId)
    .eq('entity_type', 'client')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Get upcoming/recent appointments for a client */
export async function getPortalAppointments(clientId: string) {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .eq('entity_id', clientId)
    .in('type', ['meeting', 'zoom'])
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Get billing summary for portal dashboard */
export async function getPortalBillingSummary(clientId: string) {
  const { data, error } = await supabase
    .from('vw_billing_account_summary')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
