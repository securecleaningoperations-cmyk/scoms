import { supabase } from '@/lib/supabase';

// ── Bid Calculator Service ───────────────────────────────────────────────────

export async function getBidRequests() {
  const { data, error } = await supabase
    .from('vw_bid_summary')
    .select('*');
  if (error) throw error;
  return data ?? [];
}

export async function getBidRequest(id: string) {
  const { data, error } = await supabase
    .from('bid_requests')
    .select('*, bid_versions(*), walkthrough_assessments(facility_type,total_sqft,cleanable_sqft), leads(company_name), clients(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createBidRequest(payload: {
  walkthrough_id?: string;
  lead_id?: string;
  client_id?: string;
  facility_profile_id?: string;
  title: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('bid_requests')
    .insert([{ ...payload, status: 'open', requested_by: user?.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Core bid calculation function — pure deterministic, stores result */
export async function calculateBid(params: {
  bid_request_id: string;
  cleanable_sqft: number;
  frequency: string;
  visits_per_month: number;
  labor_hours_per_visit: number;
  labor_rate_per_hour: number;
  burden_rate_pct: number;
  supply_cost_per_month: number;
  equipment_cost_per_month: number;
  overhead_pct: number;
  insurance_pct: number;
  target_margin_pct: number;
  labor_rate_card_id?: string;
}) {
  const {
    bid_request_id, cleanable_sqft, visits_per_month,
    labor_hours_per_visit, labor_rate_per_hour, burden_rate_pct,
    supply_cost_per_month, equipment_cost_per_month,
    overhead_pct, insurance_pct, target_margin_pct,
  } = params;

  // Labor
  const rawLaborRate = labor_rate_per_hour * (1 + burden_rate_pct / 100);
  const labor_cost_per_month = rawLaborRate * labor_hours_per_visit * visits_per_month;

  // Totals before markup
  const direct_cost = labor_cost_per_month + supply_cost_per_month + equipment_cost_per_month;
  const overhead_amount = direct_cost * (overhead_pct / 100);
  const insurance_amount = direct_cost * (insurance_pct / 100);
  const total_cost_per_month = direct_cost + overhead_amount + insurance_amount;

  // Bid outputs
  const min_bid = total_cost_per_month * 1.05; // 5% floor
  const recommended_bid = total_cost_per_month / (1 - target_margin_pct / 100);
  const premium_bid = recommended_bid * 1.15;
  const annual_value = recommended_bid * 12;

  // Warnings
  const actual_margin = ((recommended_bid - total_cost_per_month) / recommended_bid) * 100;
  const underbid_warning = actual_margin < 10;
  const overbid_warning = actual_margin > 50;

  // Get latest version number
  const { data: existing } = await supabase
    .from('bid_versions')
    .select('version_number')
    .eq('bid_request_id', bid_request_id)
    .order('version_number', { ascending: false })
    .limit(1);
  const nextVersion = (existing?.[0]?.version_number ?? 0) + 1;

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('bid_versions')
    .insert([{
      bid_request_id,
      version_number: nextVersion,
      cleanable_sqft,
      frequency: params.frequency,
      visits_per_month,
      labor_hours_per_visit,
      labor_rate_card_id: params.labor_rate_card_id,
      labor_cost_per_month: Math.round(labor_cost_per_month * 100) / 100,
      supply_cost_per_month,
      equipment_cost_per_month,
      overhead_pct,
      overhead_amount: Math.round(overhead_amount * 100) / 100,
      insurance_pct,
      insurance_amount: Math.round(insurance_amount * 100) / 100,
      target_margin_pct,
      total_cost_per_month: Math.round(total_cost_per_month * 100) / 100,
      min_bid_per_month: Math.round(min_bid * 100) / 100,
      recommended_bid_per_month: Math.round(recommended_bid * 100) / 100,
      premium_bid_per_month: Math.round(premium_bid * 100) / 100,
      annual_value: Math.round(annual_value * 100) / 100,
      underbid_warning,
      overbid_warning,
      status: 'draft',
      calculated_by: user?.id,
      assumptions: { ...params },
    }])
    .select()
    .single();
  if (error) throw error;

  // Update bid request status
  await supabase.from('bid_requests').update({ status: 'calculating' }).eq('id', bid_request_id);

  return data;
}

export async function getLaborRateCards() {
  const { data, error } = await supabase
    .from('labor_rate_cards')
    .select('*')
    .eq('is_active', true)
    .order('role_type');
  if (error) throw error;
  return data ?? [];
}

export async function getProductivityProfiles() {
  const { data, error } = await supabase
    .from('productivity_profiles')
    .select('*')
    .eq('is_active', true);
  if (error) throw error;
  return data ?? [];
}

export async function approveBidVersion(bidVersionId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('bid_versions')
    .update({ status: 'approved', approved_by: user?.id, approved_at: new Date().toISOString() })
    .eq('id', bidVersionId);
  if (error) throw error;
}
