"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, TrendingUp, Target, TrendingDown, Loader2, Plus, X } from "lucide-react";

export default function PerformancePage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({ employee_name: '', score: '', department: 'Commercial', notes: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: r }, { data: e }] = await Promise.all([
      supabase.from('performance_reviews').select('*, employees(id, user_id, first_name, last_name, users(first_name, last_name))').order('created_at', { ascending: false }),
      supabase.from('employees').select('id, user_id, first_name, last_name, users(first_name, last_name)'),
    ]);
    setReviews(r || []);
    setEmployees(e || []);
    setLoading(false);
  };

  const getEmpName = (emp: any) => {
    if (!emp) return 'Unknown Employee';
    const first = emp.users?.first_name || emp.first_name || '';
    const last = emp.users?.last_name || emp.last_name || '';
    if (!first && !last) return `Employee #${emp.id?.slice(0,6)}`;
    return `${first} ${last}`.trim();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const selectedEmp = employees.find(emp => getEmpName(emp) === form.employee_name);

    const { error } = await supabase.from('performance_reviews').insert([{
      employee_id: selectedEmp?.id || null,
      score: parseFloat(form.score) || 0,
      department: form.department,
      notes: form.notes,
      review_date: new Date().toISOString().split('T')[0],
      status: 'completed',
    }]);
    if (!error) { 
      setShowModal(false); 
      setForm({ employee_name: '', score: '', department: 'Commercial', notes: '' }); 
      fetchAll(); 
    }
    else {
      console.error(error);
      alert("Error: " + error.message + "\n\nPlease ensure you have run fix_schema.sql to create the table and disable RLS.");
    }
    setIsAdding(false);
  };

  const avgScore = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.score || 0), 0) / reviews.length).toFixed(0) : 0;
  const topPerformers = reviews.filter(r => (r.score || 0) >= 85).length;
  const needsImprovement = reviews.filter(r => (r.score || 0) < 70).length;

  const deptGroups = reviews.reduce((acc: Record<string, number[]>, r) => {
    const d = r.department || 'General';
    if (!acc[d]) acc[d] = [];
    acc[d].push(r.score || 0);
    return acc;
  }, {});
  const deptBars = Object.entries(deptGroups).map(([dept, scores]) => ({
    label: dept,
    val: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  })).slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Management</h1>
          <p className="text-slate-500 text-sm">Live employee performance reviews from database</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm text-sm">
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Score", value: loading ? '...' : `${avgScore}%`, icon: Star, color: "blue" },
          { label: "Top Performers", value: loading ? '...' : topPerformers, icon: TrendingUp, color: "emerald" },
          { label: "Total Reviews", value: loading ? '...' : reviews.length, icon: Target, color: "amber" },
          { label: "Needs Improvement", value: loading ? '...' : needsImprovement, icon: TrendingDown, color: "red" },
        ].map(m => (
          <div key={m.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg bg-${m.color}-50 flex items-center justify-center`}>
              <m.icon className={`w-6 h-6 text-${m.color}-500`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{m.label}</p>
              <p className="text-2xl font-bold text-slate-900">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 0 && deptBars.length > 0 ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6">Performance by Department (Avg Score)</h3>
          <div className="h-52 flex items-end justify-around gap-4 px-4">
            {deptBars.map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-bold text-slate-700">{bar.val}%</span>
                <div className="w-full bg-blue-600 rounded-t-lg hover:bg-blue-700 transition-all" style={{ height: `${(bar.val / 100) * 180}px` }} />
                <span className="text-[10px] text-slate-500 text-center">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center py-12">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No performance reviews yet.</p>
          <p className="text-sm text-slate-400 mt-1">Click "Add Review" to record the first review.</p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr><th className="p-4 pl-6">Employee</th><th className="p-4">Department</th><th className="p-4">Score</th><th className="p-4">Date</th><th className="p-4">Notes</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6 font-semibold text-slate-900">
                    {getEmpName(r.employees)}
                  </td>
                  <td className="p-4 text-slate-600 capitalize">{r.department}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${(r.score||0) >= 85 ? 'bg-emerald-500' : (r.score||0) >= 70 ? 'bg-blue-500' : 'bg-red-400'}`} style={{ width: `${r.score}%` }} />
                      </div>
                      <span className="font-bold text-slate-900 text-xs">{r.score}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{r.review_date || '—'}</td>
                  <td className="p-4 text-slate-500 text-xs max-w-[200px] truncate">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add Performance Review</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <input required list="emp-list" type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={form.employee_name} onChange={e => setForm({ ...form, employee_name: e.target.value })} placeholder="Search employee..." />
                <datalist id="emp-list">
                  {employees.map((emp: any) => <option key={emp.id} value={getEmpName(emp)} />)}
                </datalist>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  {['Commercial', 'Healthcare', 'Industrial', 'Residential', 'Government'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Score (0-100) *</label><input required type="number" min="0" max="100" className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="e.g. 88" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label><textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Review notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
