"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { getPortalUser, getPortalBillingSummary, getServiceRequests, getComplaints, getServiceSchedule } from "@/lib/services/customerPortal";
import { ClipboardList, AlertCircle, Calendar, DollarSign, CheckCircle2, Clock, Loader2, TrendingUp, MapPin } from "lucide-react";

export default function PortalDashboardPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const pu = await getPortalUser();
      if (!pu) { router.push('/portal/login'); return; }
      setPortalUser(pu);
      const [bill, reqs, comps, scheds] = await Promise.all([
        getPortalBillingSummary(pu.client_id),
        getServiceRequests(pu.client_id),
        getComplaints(pu.client_id),
        getServiceSchedule(pu.client_id),
      ]);
      setBilling(bill);
      setRequests(reqs);
      setComplaints(comps);
      setSchedules(scheds);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
      </div>
    );
  }

  const openRequests = requests.filter(r => !['completed','cancelled'].includes(r.status));
  const openComplaints = complaints.filter(c => !['resolved','closed'].includes(c.status));
  const nextSchedule = schedules[0];
  const fmt = (v: number | null) => v != null ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PortalSidebar clientName={portalUser?.clients?.name} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-0.5">{portalUser?.clients?.name} — Customer Portal</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Outstanding Balance', val: fmt(billing?.total_outstanding), icon: DollarSign, color: billing?.total_overdue > 0 ? 'text-red-600' : 'text-slate-900', bg: billing?.total_overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200' },
              { label: 'Open Requests', val: openRequests.length.toString(), icon: ClipboardList, color: 'text-blue-600', bg: 'bg-white border-slate-200' },
              { label: 'Open Complaints', val: openComplaints.length.toString(), icon: AlertCircle, color: openComplaints.length > 0 ? 'text-amber-600' : 'text-slate-700', bg: 'bg-white border-slate-200' },
              { label: 'Active Schedules', val: schedules.length.toString(), icon: Calendar, color: 'text-emerald-600', bg: 'bg-white border-slate-200' },
            ].map(c => (
              <div key={c.label} className={`rounded-2xl border p-5 shadow-sm ${c.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.label}</p>
                  <c.icon className={`w-5 h-5 ${c.color} opacity-60`} />
                </div>
                <p className={`text-2xl font-bold ${c.color}`}>{c.val}</p>
              </div>
            ))}
          </div>

          {/* Overdue Warning */}
          {billing?.total_overdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700">Overdue Balance: {fmt(billing.total_overdue)}</p>
                <p className="text-sm text-red-600">Please contact your billing coordinator or visit the Billing section to resolve this.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {/* Next Service */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm col-span-1">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> Next Service
              </h2>
              {nextSchedule ? (
                <div>
                  <p className="text-base font-bold text-slate-900 capitalize">{nextSchedule.service_type ?? 'Scheduled Cleaning'}</p>
                  <p className="text-sm text-slate-500 mt-1 capitalize">{nextSchedule.frequency?.replace(/_/g, ' ')}</p>
                  {nextSchedule.customer_locations?.name && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{nextSchedule.customer_locations.name}</p>
                  )}
                  {nextSchedule.start_time && (
                    <p className="text-xs text-slate-400 mt-0.5">{nextSchedule.start_time} — {nextSchedule.end_time}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No active schedules on file. Contact your coordinator to set up your service schedule.</p>
              )}
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm col-span-2">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-500" /> Recent Service Requests
              </h2>
              {requests.length === 0 ? (
                <p className="text-sm text-slate-400">No service requests submitted yet.</p>
              ) : (
                <div className="space-y-2">
                  {requests.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                        <p className="text-xs text-slate-400 capitalize">{r.category?.replace(/_/g, ' ')} · {new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        r.status === 'submitted' ? 'bg-slate-100 text-slate-600' :
                        r.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'}`}>
                        {r.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Billing Summary */}
          {billing && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Billing Summary
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Invoiced', val: fmt(billing.total_paid + billing.total_outstanding), color: 'text-slate-900' },
                  { label: 'Total Paid', val: fmt(billing.total_paid), color: 'text-emerald-600' },
                  { label: 'Outstanding', val: fmt(billing.total_outstanding), color: billing.total_outstanding > 0 ? 'text-amber-600' : 'text-slate-900' },
                ].map(b => (
                  <div key={b.label} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">{b.label}</p>
                    <p className={`text-xl font-bold ${b.color}`}>{b.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
