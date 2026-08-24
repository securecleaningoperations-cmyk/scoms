"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import { getMyEmployee, getMySchedule } from "@/lib/services/employeePortal";
import { Calendar, MapPin, Clock, Loader2, AlertCircle } from "lucide-react";

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function EmployeeSchedulePage() {
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <EmployeeSidebar employeeName={`${employee.first_name} ${employee.last_name}`} role={employee.role} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your recurring shifts and site assignments.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> Standard Week View
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {DAYS.map(day => {
                const dayShifts = schedule.filter(s => Array.isArray(s.schedule_days) && s.schedule_days.includes(day));
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                
                return (
                  <div key={day} className={`flex ${isToday ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                    {/* Day Column */}
                    <div className={`w-32 flex-shrink-0 p-6 border-r border-slate-100 flex flex-col justify-center ${isToday ? 'bg-indigo-100/50 border-r-indigo-100' : ''}`}>
                      <p className={`text-sm font-bold ${isToday ? 'text-indigo-700' : 'text-slate-700'}`}>{day}</p>
                      {isToday && <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1">Today</span>}
                    </div>
                    {/* Shifts Column */}
                    <div className="flex-1 p-4">
                      {dayShifts.length === 0 ? (
                        <div className="h-full flex items-center px-2">
                          <p className="text-sm text-slate-400 font-medium">Off</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dayShifts.map(s => (
                            <div key={`${day}-${s.id}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-bold text-slate-900 text-base">{s.start_time} – {s.end_time}</h3>
                                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{s.customer_locations?.name ?? 'Location N/A'}</p>
                                </div>
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">{s.service_type ?? 'Cleaning'}</span>
                              </div>
                              <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-50">
                                {s.customer_locations?.address && (
                                  <span className="flex items-start gap-1.5 text-xs text-slate-500">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span>{s.customer_locations.address}</span>
                                  </span>
                                )}
                                {s.special_instructions && (
                                  <span className="flex items-start gap-1.5 text-xs text-amber-700 font-medium bg-amber-50 p-2 rounded-lg mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span>{s.special_instructions}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
