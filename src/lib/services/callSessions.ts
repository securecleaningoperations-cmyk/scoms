import { supabase } from '@/lib/supabase';

// ── Call Sessions Service ────────────────────────────────────────────────────

export async function getCallSessions(limit = 50, callerType?: string) {
  let query = supabase
    .from('call_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (callerType && callerType !== 'all') query = query.eq('caller_type', callerType);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getCallSession(id: string) {
  const { data, error } = await supabase
    .from('call_sessions')
    .select('*, call_consent_logs(*), call_extracted_entities(*), call_routing_events(*), ai_call_transcripts(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getCallTranscripts(callSessionId: string) {
  // Try new call_sessions first, fall back to ai_voice_calls
  const { data, error } = await supabase
    .from('ai_call_transcripts')
    .select('*')
    .eq('call_id', callSessionId)
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCallStats() {
  const { data, error } = await supabase
    .from('call_sessions')
    .select('status,caller_type,duration_seconds,escalated_to_human');
  if (error) throw error;
  const sessions = data ?? [];
  return {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    escalated: sessions.filter(s => s.escalated_to_human).length,
    avgDuration: sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / (sessions.length || 1),
    byCallerType: sessions.reduce((acc: Record<string, number>, s) => {
      acc[s.caller_type ?? 'unknown'] = (acc[s.caller_type ?? 'unknown'] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

// ── Knowledge Base Service ───────────────────────────────────────────────────

export async function getKbEntries(statusFilter?: string, category?: string) {
  let query = supabase
    .from('kb_entries')
    .select('*')
    .order('updated_at', { ascending: false });
  if (statusFilter && statusFilter !== 'all') query = query.eq('status', statusFilter);
  if (category && category !== 'all') query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedKbEntries(category?: string) {
  let query = supabase
    .from('kb_entries')
    .select('id,title,content,category,tags')
    .eq('status', 'published')
    .eq('approved_for_ai', true);
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createKbEntry(payload: {
  category: string;
  title: string;
  content: string;
  tags?: string[];
  visibility?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('kb_entries')
    .insert([{ ...payload, status: 'draft', created_by: user?.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateKbEntry(id: string, updates: Partial<{
  title: string; content: string; category: string; tags: string[];
  status: string; approved_for_ai: boolean; visibility: string;
}>) {
  const { error } = await supabase
    .from('kb_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function approveKbEntry(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('kb_entries')
    .update({
      status: 'approved',
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function publishKbEntry(id: string) {
  const { error } = await supabase
    .from('kb_entries')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ── Admin Config Service ─────────────────────────────────────────────────────

export async function getBusinessHours() {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week');
  if (error) throw error;
  return data ?? [];
}

export async function upsertBusinessHours(rows: Array<{
  day_of_week: number; open_time?: string; close_time?: string; is_closed: boolean;
}>) {
  const { error } = await supabase
    .from('business_hours')
    .upsert(rows, { onConflict: 'tenant_id,day_of_week' });
  if (error) throw error;
}

export async function getHolidays() {
  const { data, error } = await supabase
    .from('holiday_schedules')
    .select('*')
    .order('holiday_date');
  if (error) throw error;
  return data ?? [];
}

export async function addHoliday(payload: {
  holiday_name: string; holiday_date: string; is_closed?: boolean; after_hours_message?: string;
}) {
  const { data, error } = await supabase.from('holiday_schedules').insert([payload]).select().single();
  if (error) throw error;
  return data;
}

export async function deleteHoliday(id: string) {
  const { error } = await supabase.from('holiday_schedules').delete().eq('id', id);
  if (error) throw error;
}

export async function getServiceAreas() {
  const { data, error } = await supabase.from('service_areas').select('*').eq('is_active', true);
  if (error) throw error;
  return data ?? [];
}

export async function getComplianceRules() {
  const { data, error } = await supabase.from('compliance_rules').select('*').eq('is_active', true);
  if (error) throw error;
  return data ?? [];
}

export async function getCallRoutingRules() {
  const { data, error } = await supabase
    .from('call_routing_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function logConfigChange(payload: {
  config_area: string; setting_key: string; old_value: unknown; new_value: unknown; change_reason?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('config_change_log').insert([{ ...payload, changed_by: user?.id }]);
}
