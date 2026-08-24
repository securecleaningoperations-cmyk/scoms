import { supabase } from '@/lib/supabase';

export async function fetchCustomerMetrics() {
  const { data: inquiries, error: inqError } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
  const { data: reviews, error: revError } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  const { data: aiLogs, error: aiError } = await supabase.from('ai_receptionist_logs').select('*').order('created_at', { ascending: false }).limit(1);

  if (inqError || revError || aiError) {
    console.error("Error fetching customer data", { inqError, revError, aiError });
  }

  const inqs = inquiries || [];
  const revs = reviews || [];
  
  const totalInquiries = inqs.length;
  const newUncontacted = inqs.filter(i => i.status === 'new' || i.status === 'uncontacted').length;
  
  const totalReviews = revs.length;
  const avgRating = totalReviews > 0 
    ? (revs.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1) 
    : "N/A";

  const aiStatus = (aiLogs && aiLogs.length > 0) ? aiLogs[0].status : 'active';

  return {
    inquiries: inqs,
    reviews: revs,
    totalInquiries,
    newUncontacted,
    totalReviews,
    avgRating,
    aiStatus
  };
}

export async function addInquiry(data: { customer_name: string; customer_email: string; inquiry_type: string; message: string; source: string; status: string }) {
  const { error } = await supabase.from('inquiries').insert([data]);
  if (error) throw error;
}

export async function addReview(data: { rating: number; review_text: string; platform: string }) {
  const { error } = await supabase.from('reviews').insert([data]);
  if (error) throw error;
}
