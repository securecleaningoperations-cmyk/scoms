"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Filter, MoreHorizontal, Download, PlayCircle, CheckCircle2, Clock, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [formState, setFormState] = useState({
    client: "",
    service: "Standard Commercial Cleaning",
    status: "In Progress",
    assigned: "",
    job_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [
      { data: jobsData },
      { data: clientsData },
      { data: employeesData }
    ] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name'),
      supabase.from('employees').select('id, users(first_name, last_name)')
    ]);
    
    if (jobsData) setJobs(jobsData);
    if (clientsData) setClients(clientsData);
    if (employeesData) setEmployees(employeesData);
    
    setIsLoading(false);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    // Optional: resolve IDs if needed for backend relations
    const selectedClient = clients.find(c => c.name === formState.client);
    const selectedEmployee = employees.find(emp => `${emp.users?.first_name} ${emp.users?.last_name}` === formState.assigned);

    const payload = {
      ...formState,
      client_id: selectedClient?.id || null,
      employee_id: selectedEmployee?.id || null,
    };

    const { error } = await supabase.from('jobs').insert([payload]);
    if (!error) {
      setShowModal(false);
      setFormState({
        client: "",
        service: "Standard Commercial Cleaning",
        status: "In Progress",
        assigned: "",
        job_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } else {
      alert("Error creating job: " + error.message);
    }
    setIsAdding(false);
  };

  const filteredJobs = jobs.filter(j => 
    (j.client || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.assigned || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.service || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Accepted': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Closed': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'In Progress': return <PlayCircle className="w-3 h-3 mr-1" />;
      case 'Approved': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'Closed': return <CheckCircle2 className="w-3 h-3 mr-1 opacity-50" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-full font-sans relative">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Job Execution Board</h1>
          <p className="text-slate-500 text-sm">Monitor all field service operations, checklists, and sign-offs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
            <FileText className="w-4 h-4" /> Create Work Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search jobs by client, service, or assignee..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Job #</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assigned</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading jobs...
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No jobs found. Click "Create Work Order" to add a job.
                </td>
              </tr>
            ) : filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-semibold text-slate-900 font-mono">{job.id.split('-')[0].toUpperCase()}</td>
                <td className="px-6 py-4 text-slate-700 font-medium">{job.client}</td>
                <td className="px-6 py-4 text-slate-600">{job.service}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full border ${getStatusStyle(job.status)}`}>
                    {getStatusIcon(job.status)}
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">{job.assigned || 'Unassigned'}</td>
                <td className="px-6 py-4 text-slate-500">{job.job_date ? new Date(job.job_date).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Create Work Order</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                <input required list="clients-list" type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={formState.client} onChange={e => setFormState({...formState, client: e.target.value})} placeholder="Search or select client..." />
                <datalist id="clients-list">
                  {clients.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                <input required list="services-list" type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={formState.service} onChange={e => setFormState({...formState, service: e.target.value})} />
                <datalist id="services-list">
                  <option value="Standard Commercial Cleaning" />
                  <option value="Deep Cleaning" />
                  <option value="Move-In/Move-Out Cleaning" />
                  <option value="Carpet Cleaning" />
                  <option value="Window Washing" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Worker</label>
                <input required list="employees-list" type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={formState.assigned} onChange={e => setFormState({...formState, assigned: e.target.value})} placeholder="Search or select employee..." />
                <datalist id="employees-list">
                  {employees.map(emp => <option key={emp.id} value={`${emp.users?.first_name} ${emp.users?.last_name}`} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={formState.status} onChange={e => setFormState({...formState, status: e.target.value})}>
                    <option>In Progress</option>
                    <option>Accepted</option>
                    <option>Approved</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={formState.job_date} onChange={e => setFormState({...formState, job_date: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                  Save Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
