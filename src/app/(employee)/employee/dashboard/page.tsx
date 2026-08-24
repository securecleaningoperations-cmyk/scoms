"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import { getMyEmployee, getMySchedule } from "@/lib/services/employeePortal";
import { Clock, Calendar, AlertCircle, FileText, CheckCircle2, ChevronRight, Loader2, MapPin } from "lucide-react";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const emp = await getMyEmployee();
      if (!emp) { router.push('/employee/login'); return; }
      setEmployee(emp);
      setSchedule(await getMySchedule(emp.id));
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-9 h-9 animate-spin text-indigo-500" /></div>;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysShifts = schedule.filter(s => Array.isArray(s.schedule_days) && s.schedule_days.includes(today));
  const nextShift = todaysShifts[0]; // simplistic for now

  return (
    <div className="flex min-h-screen bg-slate-50">
      <EmployeeSidebar employeeName={`${employee.first_name} ${employee.last_name}`} role={employee.role} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, {employee.first_name}</h1>
              <p className="text-slate-500 text-sm mt-0.5">Here is your summary for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
            </div>
            {nextShift && (
              <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Clock className="w-4 h-4" /> Clock In
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="col-span-2 space-y-6">
              {/* Today's Schedule */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-indigo-500" /> Today's Schedule
                </h2>
                {todaysShifts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="font-medium text-sm">No shifts scheduled for today.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysShifts.map(s => (
                      <div key={s.id} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">{s.start_time} – {s.end_time}</h3>
                            <p className="text-sm font-semibold text-slate-700 mt-1">{s.customer_locations?.name ?? 'Location N/A'}</p>
                          </div>
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">Scheduled</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-50">
                          {s.customer_locations?.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{s.customer_locations.address}</span>}
                          {s.special_instructions && <span className="flex items-center gap-1 text-amber-600 font-medium"><AlertCircle className="w-3.5 h-3.5" /> Notes attached</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Communications */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-indigo-500" /> Action Items &amp; Notices
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <FileText className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Safety Policy Update</p>
                      <p className="text-xs text-amber-700 mt-1">Please review and sign the updated 2026 chemical handling protocols by Friday.</p>
                    </div>
                    <button className="ml-auto text-xs font-bold text-amber-700 hover:text-amber-900 px-3 py-1.5 bg-amber-200/50 rounded-lg">Review</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pay Period (Current)</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-slate-900">32.5</p>
                    <p className="text-sm font-semibold text-slate-500">Hours Logged</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">$585.00</p>
                    <p className="text-[10px] font-semibold text-slate-400">Est. Gross</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button className="w-full text-xs font-bold text-indigo-600 flex items-center justify-between hover:text-indigo-800">
                    View Timesheet <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Training Status</p>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <p className="text-sm font-bold text-slate-900">All required modules complete</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
