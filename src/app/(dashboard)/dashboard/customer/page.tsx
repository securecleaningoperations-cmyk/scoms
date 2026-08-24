"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Bot, Phone, Star, TrendingUp, Plus, Loader2, MessageSquare, X } from "lucide-react";
import { fetchCustomerMetrics, addInquiry, addReview } from "@/lib/queries/customer";

export default function CustomerPage() {
  const [metrics, setMetrics] = useState({
    inquiries: [] as any[],
    reviews: [] as any[],
    totalInquiries: 0,
    newUncontacted: 0,
    totalReviews: 0,
    avgRating: "N/A",
    aiStatus: "active"
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"inquiries" | "reviews">("inquiries");

  // Modals state
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms state
  const [inquiryForm, setInquiryForm] = useState({ customer_name: '', customer_email: '', inquiry_type: 'Quote', message: '', source: 'web', status: 'new' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: '', platform: 'Google' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomerMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up realtime subscriptions
    const channels = supabase.channel('customer-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_receptionist_logs' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addInquiry(inquiryForm);
      setShowInquiryModal(false);
      setInquiryForm({ customer_name: '', customer_email: '', inquiry_type: 'Quote', message: '', source: 'web', status: 'new' });
      await loadData(); // Optimistic update could be done, but refetching is safer for demo
    } catch (err) {
      alert("Error adding inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(reviewForm);
      setShowReviewModal(false);
      setReviewForm({ rating: 5, review_text: '', platform: 'Google' });
      await loadData();
    } catch (err) {
      alert("Error adding review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Customer Intelligence</h1>
          <p className="text-slate-gray font-medium mt-1">AI receptionist, missed calls, reviews & retention</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowReviewModal(true)} className="cal-btn-dark flex items-center gap-2 text-sm px-4 py-2.5">
            <Star className="w-4 h-4" /> Add Review
          </button>
          <button onClick={() => setShowInquiryModal(true)} className="cal-btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Inquiry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: "Total Inquiries", value: loading ? '...' : metrics.totalInquiries, icon: Bot, color: "text-signal-blue" },
          { label: "New / Uncontacted", value: loading ? '...' : metrics.newUncontacted, icon: Phone, color: "text-amber-500" },
          { label: "Avg Rating", value: loading ? '...' : metrics.avgRating, icon: Star, color: "text-yellow-500" },
          { label: "Total Reviews", value: loading ? '...' : metrics.totalReviews, icon: TrendingUp, color: "text-emerald-500" },
        ].map((m, idx) => (
          <div key={idx} className="cal-card p-6">
            <m.icon className={`w-5 h-5 ${m.color} mb-3`} />
            <p className="text-sm text-slate-gray">{m.label}</p>
            <p className="text-3xl font-bold text-ink-navy font-display mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className={`cal-card p-6 border-0 ${metrics.aiStatus === 'active' ? 'bg-gradient-to-r from-ink-navy to-deep-cobalt' : 'bg-slate-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">AI Receptionist — {metrics.aiStatus === 'active' ? 'Active' : 'Offline'}</p>
              <p className="text-white/70 text-sm">Handles missed calls, web chats, and email inquiries 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {metrics.aiStatus === 'active' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-semibold">Online</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 text-sm font-semibold">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="border-b border-hairline bg-paper p-5 flex gap-2">
          {(["inquiries", "reviews"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-signal-blue text-white' : 'text-slate-gray hover:bg-pebble'}`}>
              {t}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-signal-blue" /></div>
        ) : tab === "inquiries" ? (
          <div className="divide-y divide-hairline">
            {metrics.inquiries.length === 0 ? (
              <div className="p-12 text-center text-slate-gray">
                <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No inquiries yet.</p>
              </div>
            ) : metrics.inquiries.map(iq => (
              <div key={iq.id} className="p-5 flex items-start gap-4 hover:bg-cloud/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-signal-blue/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-signal-blue" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-ink-navy text-sm">{iq.customer_name}</p>
                      <p className="text-xs text-mist-gray mt-0.5">{iq.inquiry_type} · {iq.source}</p>
                    </div>
                    <span className={`cal-badge text-xs ${iq.status === 'new' ? 'bg-amber-50 text-amber-700' : 'bg-pebble text-slate-gray'}`}>
                      {iq.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-gray mt-2">{iq.message}</p>
                  {iq.ai_response && (
                    <div className="mt-3 p-3 bg-signal-blue/5 rounded-lg border border-signal-blue/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bot className="w-3 h-3 text-signal-blue" />
                        <span className="text-xs font-semibold text-signal-blue">AI Response</span>
                      </div>
                      <p className="text-xs text-slate-gray">{iq.ai_response}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {metrics.reviews.length === 0 ? (
              <div className="p-12 text-center text-slate-gray">
                <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No reviews yet.</p>
              </div>
            ) : metrics.reviews.map(r => (
              <div key={r.id} className="p-5 flex items-start gap-4 hover:bg-cloud/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < (r.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-mist-gray'}`} />
                    ))}
                    <span className="text-xs text-mist-gray ml-1">{r.platform}</span>
                  </div>
                  <p className="text-sm text-slate-gray">{r.review_text}</p>
                </div>
                <span className="text-xs text-mist-gray">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-ink-navy/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-ink-navy font-display">New Inquiry</h3>
              <button onClick={() => setShowInquiryModal(false)} className="text-mist-gray hover:text-ink-navy"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">Customer Name</label>
                <input required type="text" className="w-full border border-hairline rounded-lg px-3 py-2 text-ink-navy" value={inquiryForm.customer_name} onChange={e => setInquiryForm({...inquiryForm, customer_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">Email</label>
                <input required type="email" className="w-full border border-hairline rounded-lg px-3 py-2 text-ink-navy" value={inquiryForm.customer_email} onChange={e => setInquiryForm({...inquiryForm, customer_email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">Message</label>
                <textarea required rows={3} className="w-full border border-hairline rounded-lg px-3 py-2 text-ink-navy" value={inquiryForm.message} onChange={e => setInquiryForm({...inquiryForm, message: e.target.value})} />
              </div>
              <button disabled={submitting} type="submit" className="w-full cal-btn-primary flex items-center justify-center gap-2 mt-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-ink-navy/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-ink-navy font-display">Add Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-mist-gray hover:text-ink-navy"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">Rating (1-5)</label>
                <input required type="number" min="1" max="5" className="w-full border border-hairline rounded-lg px-3 py-2 text-ink-navy" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">Platform</label>
                <select className="w-full border border-hairline rounded-lg px-3 py-2 text-ink-navy" value={reviewForm.platform} onChange={e => setReviewForm({...reviewForm, platform: e.target.value})}>
                  <option>Google</option>
                  <option>Yelp</option>
                  <option>Facebook</option>
                  <option>Direct</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">Review Text</label>
                <textarea required rows={3} className="w-full border border-hairline rounded-lg px-3 py-2 text-ink-navy" value={reviewForm.review_text} onChange={e => setReviewForm({...reviewForm, review_text: e.target.value})} />
              </div>
              <button disabled={submitting} type="submit" className="w-full cal-btn-primary flex items-center justify-center gap-2 mt-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
