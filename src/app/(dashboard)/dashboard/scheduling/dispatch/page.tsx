"use client";

import { useState, useEffect } from "react";
import { Truck, MapPin, Clock, User, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DispatchPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [jobsRes, empRes] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('id, first_name, last_name, role').in('role', ['field_employee', 'cleaner', 'supervisor'])
    ]);
    
    if (jobsRes.data) setJobs(jobsRes.data);
    if (empRes.data) setEmployees(empRes.data);
    setIsLoading(false);
  };

  const handleAssign = async (jobId: string) => {
    const assignedName = selections[jobId];
    if (!assignedName) return alert("Please select an employee first.");
    
    setIsAssigning(jobId);
    const { error } = await supabase.from('jobs')
      .update({ assigned: assignedName, status: 'In Progress' })
      .eq('id', jobId);
      
    if (!error) {
      fetchData();
      setSelections(prev => { const n = {...prev}; delete n[jobId]; return n; });
    } else {
      alert("Failed to assign job: " + error.message);
    }
    setIsAssigning(null);
  };

  const pendingJobs = jobs.filter(j => !j.assigned || j.assigned === 'Auto Assignee' || j.status === 'Created');
  const activeJobs = jobs.filter(j => j.assigned && j.assigned !== 'Auto Assignee' && j.status !== 'Created');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-full font-sans">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-900 text-sm">Dispatch Mode:</span>
          <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button className="px-4 py-1.5 text-sm font-semibold rounded-md bg-blue-600 text-white shadow-sm transition-colors">Auto</button>
            <button className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-slate-100 text-slate-600 transition-colors">Manual</button>
            <button className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-slate-100 text-slate-600 transition-colors">Emergency</button>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
          <Truck className="w-4 h-4" /> Dispatch All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Pending Dispatch</h2>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                Loading jobs...
              </div>
            ) : pendingJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg">
                No pending dispatches.
              </div>
            ) : pendingJobs.map(job => (
              <div key={job.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">JOB{job.id.split('-')[0].substring(0, 5).toUpperCase()}</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Created</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Medium</span>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-1">{job.title || job.client || 'Unnamed Job'}</h3>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || 'Location pending'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.start_time || 'TBD'}</span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select 
                      value={selections[job.id] || ''} 
                      onChange={e => setSelections({...selections, [job.id]: e.target.value})}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500">
                      <option value="">Assign employee</option>
                      {employees.map(e => (
                        <option key={e.id} value={`${e.first_name} ${e.last_name}`}>{e.first_name} {e.last_name} ({e.role})</option>
                      ))}
                      {/* Removed mock employees */}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button 
                    onClick={() => handleAssign(job.id)}
                    disabled={isAssigning === job.id}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center justify-center min-w-[80px]">
                    {isAssigning === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Active Dispatches</h2>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                Loading jobs...
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg">
                No active dispatches.
              </div>
            ) : activeJobs.map(job => (
              <div key={job.id} className="border border-slate-200 rounded-lg p-4 hover:border-emerald-200 hover:shadow-sm transition-all bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">JOB{job.id.split('-')[0].substring(0, 5).toUpperCase()}</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">{job.status}</span>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-0.5">{job.title || job.client || 'Unnamed Job'}</h3>
                <p className="text-xs text-slate-500 mb-4">{job.type || 'Commercial'} • {job.location || 'Location pending'}</p>
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{job.assigned}</span>
                  </div>
                  <button onClick={() => setSelections({...selections, [job.id]: job.assigned})} className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                    Edit Assignee
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
