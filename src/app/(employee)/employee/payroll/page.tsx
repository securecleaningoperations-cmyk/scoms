"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import { getMyEmployee } from "@/lib/services/employeePortal";
import { supabase } from "@/lib/supabase";
import { DollarSign, FileText, Download, Loader2, Calendar } from "lucide-react";

export default function EmployeePayrollPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [payStubs, setPayStubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const emp = await getMyEmployee();
      if (!emp) { router.push('/employee/login'); return; }
      setEmployee(emp);
      
      const { data } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('employee_id', emp.id)
        .order('period_end', { ascending: false });
        
      setPayStubs(data ?? []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-9 h-9 animate-spin text-indigo-500" /></div>;

  const fmt = (v: number | null) => v != null ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <EmployeeSidebar employeeName={`${employee.first_name} ${employee.last_name}`} role={employee.role} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Payroll &amp; Stubs</h1>
              <p className="text-slate-500 text-sm mt-0.5">View your earnings history and download pay stubs.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500">YTD Gross</span>
              <span className="text-xl font-bold text-emerald-600">
                {fmt(payStubs.filter(p => new Date(p.period_end).getFullYear() === new Date().getFullYear()).reduce((s, p) => s + (p.gross_pay || 0), 0))}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Pay History</h2>
            </div>
            {payStubs.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No payroll records found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {payStubs.map(p => (
                  <div key={p.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold uppercase">{new Date(p.period_end).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-sm font-black">{new Date(p.period_end).getDate()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{fmt(p.net_pay)}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {new Date(p.period_start).toLocaleDateString()} – {new Date(p.period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-400 font-medium">Gross</p>
                        <p className="text-sm font-bold text-slate-700">{fmt(p.gross_pay)}</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-400 font-medium">Taxes</p>
                        <p className="text-sm font-bold text-red-600">-{fmt(p.taxes)}</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-400 font-medium">Deductions</p>
                        <p className="text-sm font-bold text-red-600">-{fmt(p.deductions)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">Hours</p>
                        <p className="text-sm font-bold text-indigo-600">{p.total_hours}</p>
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">
                        <Download className="w-3.5 h-3.5" /> Stub
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
