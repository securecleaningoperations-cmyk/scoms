"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import { getMyEmployee } from "@/lib/services/employeePortal";
import { supabase } from "@/lib/supabase";
import { BookOpen, CheckCircle2, PlayCircle, Loader2, AlertCircle } from "lucide-react";

export default function EmployeeTrainingPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const emp = await getMyEmployee();
      if (!emp) { router.push('/employee/login'); return; }
      setEmployee(emp);
      
      const { data } = await supabase
        .from('employee_training_records')
        .select('*')
        .eq('employee_id', emp.id)
        .order('completed_at', { ascending: false });
        
      setTrainings(data ?? []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-9 h-9 animate-spin text-indigo-500" /></div>;

  const incomplete = trainings.filter(t => t.status !== 'completed');
  const completed = trainings.filter(t => t.status === 'completed');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <EmployeeSidebar employeeName={`${employee.first_name} ${employee.last_name}`} role={employee.role} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Training Hub</h1>
            <p className="text-slate-500 text-sm mt-0.5">Required compliance and safety modules.</p>
          </div>

          {/* Action Required */}
          {incomplete.length > 0 ? (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold text-red-900">Action Required: Pending Modules</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {incomplete.map(t => (
                  <div key={t.id} className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{t.module_name}</h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <span className="capitalize">{t.status.replace(/_/g, ' ')}</span>
                        {t.score && <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">Score: {t.score}%</span>}
                      </p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">
                      <PlayCircle className="w-4 h-4" /> Start Module
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-900">You're all caught up!</h2>
                <p className="text-emerald-700 text-sm mt-0.5">All required training modules have been completed.</p>
              </div>
            </div>
          )}

          {/* History */}
          {completed.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <h2 className="text-base font-bold text-slate-900">Training History</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {completed.map(t => (
                  <div key={t.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{t.module_name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Completed {new Date(t.completed_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Score: {t.score}%</p>
                    </div>
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
