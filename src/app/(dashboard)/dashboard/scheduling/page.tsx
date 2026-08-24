"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus, MapPin, Clock, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

function getWeekDays(anchor: Date) {
  const dow = anchor.getDay(); // 0=Sun
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d, dateStr: d.toISOString().split('T')[0], label: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i] };
  });
}

const JOB_COLORS = ['bg-blue-50 border-blue-200 text-blue-700', 'bg-emerald-50 border-emerald-200 text-emerald-700', 'bg-amber-50 border-amber-200 text-amber-700', 'bg-purple-50 border-purple-200 text-purple-700'];

export default function CalendarPage() {
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ client_name: '', job_date: new Date().toISOString().split('T')[0], title: '', location: '', start_time: '09:00', type: 'commercial' });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    const [{ data: j }, { data: c }] = await Promise.all([
      supabase.from('jobs').select('*').order('job_date', { ascending: true }),
      supabase.from('clients').select('id, name').order('name'),
    ]);
    setJobs(j || []);
    setClients(c || []);
    setIsLoading(false);
  };

  const week = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);

  const jobsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    week.forEach(d => map.set(d.dateStr, []));
    jobs.forEach(j => { const key = j.job_date; if (map.has(key)) map.get(key)!.push(j); });
    return map;
  }, [jobs, week]);

  const weekLabel = `${week[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${week[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const client = clients.find(c => c.name === addForm.client_name);
    const { error } = await supabase.from('jobs').insert([{
      client_id: client?.id || null,
      client: client?.name || addForm.client_name || 'Unknown Client',
      title: addForm.title,
      location: addForm.location,
      job_date: addForm.job_date,
      start_time: addForm.start_time,
      type: addForm.type,
      status: 'Created',
    }]);
    if (!error) { 
      setShowAddModal(false); 
      setAddForm({ ...addForm, title: '', location: '', client_name: '' }); 
      fetchJobs(); 
    }
    else {
      console.error(error);
      alert("Error scheduling job: " + error.message);
    }
    setIsAdding(false);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('job_id');
    if (!jobId) return;
    
    // Optimistic update
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, job_date: targetDate } : j));
    
    // DB update
    const { error } = await supabase.from('jobs').update({ job_date: targetDate }).eq('id', jobId);
    if (error) {
      console.error(error);
      alert("Error moving job: " + error.message);
      fetchJobs(); // revert
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Scheduling Calendar</h1>
          <p className="text-slate-500 text-sm">{jobs.length} total jobs scheduled • Live from Supabase</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm">
          <Plus className="w-4 h-4" /> Schedule Job
        </button>
      </div>

      {/* Week navigation */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => { const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-bold text-slate-900 text-sm">{weekLabel}</span>
          <button onClick={() => { const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronRight className="w-5 h-5" /></button>
          <button onClick={() => setWeekAnchor(new Date())} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">Today</button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span> Job
          <span className="ml-2 w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Completed
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {week.map(d => (
            <div key={d.dateStr} className={`p-4 text-center border-r border-slate-200 last:border-r-0 ${d.dateStr === todayStr ? 'bg-blue-50' : ''}`}>
              <div className="text-xs font-semibold text-slate-500 uppercase">{d.label}</div>
              <div className={`text-xl font-bold mt-1 ${d.dateStr === todayStr ? 'text-blue-600' : 'text-slate-700'}`}>{d.date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Job cells */}
        <div className="grid grid-cols-7 min-h-[480px] divide-x divide-slate-100 relative">
          {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}
          {week.map((d, idx) => {
            const dayJobs = jobsByDate.get(d.dateStr) || [];
            return (
              <div key={d.dateStr} 
                   className={`p-2 space-y-1.5 min-h-[120px] ${d.dateStr === todayStr ? 'bg-blue-50/30' : ''}`}
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={(e) => handleDrop(e, d.dateStr)}
              >
                {dayJobs.length === 0 && !isLoading && (
                  <div className="h-full flex items-start justify-center pt-8 opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setAddForm(f => ({ ...f, job_date: d.dateStr })); setShowAddModal(true); }} className="text-slate-300 hover:text-blue-400 text-xs transition-colors" title="Add job">+</button>
                  </div>
                )}
                {dayJobs.map((job, i) => (
                  <div key={job.id || i} 
                       draggable={true}
                       onDragStart={(e) => e.dataTransfer.setData('job_id', job.id)}
                       className={`p-2 rounded-md border text-xs cursor-move hover:shadow-sm transition-shadow ${JOB_COLORS[i % JOB_COLORS.length]}`}
                  >
                    <p className="font-semibold truncate leading-tight">{job.title || job.client || 'Unnamed Job'}</p>
                    {job.location && <div className="flex items-center gap-1 mt-0.5 opacity-70"><MapPin className="w-2.5 h-2.5" /><span className="truncate">{job.location}</span></div>}
                    {job.start_time && <div className="flex items-center gap-1 mt-0.5 opacity-70"><Clock className="w-2.5 h-2.5" /><span>{job.start_time}</span></div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Schedule New Job</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddJob} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label><input required type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} placeholder="e.g. Commercial Office Deep Clean" /></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <input required list="clients-list" type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={addForm.client_name} onChange={e => setAddForm({ ...addForm, client_name: e.target.value })} placeholder="Search client..." />
                <datalist id="clients-list">
                  {clients.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Location</label><input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} placeholder="e.g. 123 Main St, Phoenix AZ" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Date *</label><input required type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={addForm.job_date} onChange={e => setAddForm({ ...addForm, job_date: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label><input type="time" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={addForm.start_time} onChange={e => setAddForm({ ...addForm, start_time: e.target.value })} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 capitalize" value={addForm.type} onChange={e => setAddForm({ ...addForm, type: e.target.value })}>
                  {['commercial', 'healthcare', 'industrial', 'residential', 'retail', 'education'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Schedule Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
