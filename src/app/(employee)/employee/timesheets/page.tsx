"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import { getMyEmployee } from "@/lib/services/employeePortal";
import { supabase } from "@/lib/supabase";
import { Clock, Loader2, Play, Square, MapPin } from "lucide-react";

export default function EmployeeTimesheetsPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLog, setActiveLog] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const emp = await getMyEmployee();
      if (!emp) { router.push('/employee/login'); return; }
      setEmployee(emp);
      
      const { data } = await supabase
        .from('time_logs')
        .select('*, customer_locations(name, address)')
        .eq('employee_id', emp.id)
        .order('clock_in', { ascending: false })
        .limit(30);
      
      setLogs(data ?? []);
      setActiveLog(data?.find(l => !l.clock_out) || null);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleClockIn = async () => {
    setActionLoading(true);
    const { data, error } = await supabase.from('time_logs').insert([{
      employee_id: employee.id,
      clock_in: new Date().toISOString(),
      location_id: null // Ideally fetch nearest scheduled location or select from dropdown
    }]).select('*, customer_locations(name, address)').single();
    
    if (data && !error) {
      setLogs([data, ...logs]);
      setActiveLog(data);
    }
    setActionLoading(false);
  };

  const handleClockOut = async () => {
    if (!activeLog) return;
    setActionLoading(true);
    const { data, error } = await supabase.from('time_logs')
      .update({ clock_out: new Date().toISOString() })
      .eq('id', activeLog.id)
      .select('*, customer_locations(name, address)').single();
      
    if (data && !error) {
      setLogs(logs.map(l => l.id === data.id ? data : l));
      setActiveLog(null);
    }
    setActionLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-9 h-9 animate-spin text-indigo-500" /></div>;

  const totalHours = logs.reduce((sum, log) => {
    if (!log.clock_out) return sum;
    const hrs = (new Date(log.clock_out).getTime() - new Date(log.clock_in).getTime()) / (1000 * 60 * 60);
    return sum + hrs;
  }, 0);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <EmployeeSidebar employeeName={`${employee.first_name} ${employee.last_name}`} role={employee.role} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Timesheets</h1>
              <p className="text-slate-500 text-sm mt-0.5">Track your time and clock in/out of shifts.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500">Total Logged (30 days)</span>
              <span className="text-xl font-bold text-indigo-600">{totalHours.toFixed(1)} hrs</span>
            </div>
          </div>

          {/* Clock In/Out Action */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Clock className={`w-6 h-6 ${activeLog ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                {activeLog ? 'Currently Clocked In' : 'Not Clocked In'}
              </h2>
              <p className="text-sm text-slate-500">
                {activeLog 
                  ? `Clocked in at ${new Date(activeLog.clock_in).toLocaleTimeString()} on ${new Date(activeLog.clock_in).toLocaleDateString()}` 
                  : 'Ready to start your shift?'}
              </p>
            </div>
            <div>
              {activeLog ? (
                <button onClick={handleClockOut} disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 text-lg shadow-sm">
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5 fill-current" />} Clock Out
                </button>
              ) : (
                <button onClick={handleClockIn} disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 text-lg shadow-sm">
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />} Clock In
                </button>
              )}
            </div>
          </div>

          {/* Time Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Recent Time Logs</h3>
            </div>
            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No recent time logs found.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs">
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Location</th>
                    <th className="px-6 py-3 font-semibold">Clock In</th>
                    <th className="px-6 py-3 font-semibold">Clock Out</th>
                    <th className="px-6 py-3 font-semibold text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => {
                    let hrs = 0;
                    if (log.clock_out) {
                      hrs = (new Date(log.clock_out).getTime() - new Date(log.clock_in).getTime()) / (1000 * 60 * 60);
                    }
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {new Date(log.clock_in).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {log.customer_locations ? (
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{log.customer_locations.name}</span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-medium">
                          {new Date(log.clock_in).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : <span className="text-amber-500 font-semibold animate-pulse">In Progress...</span>}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {log.clock_out ? `${hrs.toFixed(2)}h` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
