"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { getPortalUser, getServiceSchedule } from "@/lib/services/customerPortal";
import { Calendar, MapPin, Clock, Loader2 } from "lucide-react";

const FREQ_LABELS: Record<string, string> = { daily:'Daily',weekly:'Weekly',biweekly:'Every 2 Weeks',monthly:'Monthly',quarterly:'Quarterly',one_time:'One Time',custom:'Custom' };
const STATUS_STYLES: Record<string, string> = { active:'bg-emerald-100 text-emerald-700',paused:'bg-amber-100 text-amber-700',cancelled:'bg-red-100 text-red-700',completed:'bg-slate-100 text-slate-500' };
const DAY_ORDER = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function PortalSchedulePage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const pu = await getPortalUser();
      if (!pu) { router.push('/portal/login'); return; }
      setPortalUser(pu);
      setSchedules(await getServiceSchedule(pu.client_id));
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-9 h-9 animate-spin text-blue-500" /></div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PortalSidebar clientName={portalUser?.clients?.name} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Service Schedule</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your current cleaning schedules at all locations.</p>
          </div>

          {schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-lg">No schedules on file</p>
              <p className="text-sm mt-2">Contact your SCOMS coordinator to set up or review your service schedule.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map(s => {
                const days: string[] = Array.isArray(s.schedule_days) ? s.schedule_days : [];
                const sortedDays = days.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{s.service_type ?? 'Cleaning Service'}</h3>
                        {s.customer_locations?.name && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {s.customer_locations.name}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_STYLES[s.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Frequency</p>
                        <p className="text-sm font-bold text-slate-900">{FREQ_LABELS[s.frequency] ?? s.frequency ?? '—'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Time</p>
                        <p className="text-sm font-bold text-slate-900">{s.start_time ? `${s.start_time}${s.end_time ? ` – ${s.end_time}` : ''}` : '—'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Effective</p>
                        <p className="text-sm font-bold text-slate-900">{s.effective_date ? new Date(s.effective_date).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                    {sortedDays.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-2">Service Days</p>
                        <div className="flex gap-2">
                          {DAY_ORDER.map(d => (
                            <div key={d} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${sortedDays.includes(d) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {d.substring(0, 2)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {s.special_instructions && (
                      <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-700 mb-0.5">Special Instructions</p>
                        <p className="text-sm text-amber-800">{s.special_instructions}</p>
                      </div>
                    )}
                    {s.temporary_change_note && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-0.5">Temporary Change Notice</p>
                        <p className="text-sm text-blue-800">{s.temporary_change_note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
