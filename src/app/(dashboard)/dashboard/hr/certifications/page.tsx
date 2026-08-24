"use client";

import { useState, useEffect } from "react";
import { Award, AlertCircle, AlertOctagon, Search, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [stats, setStats] = useState({ valid: 0, expiringSoon: 0, expired: 0 });
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    issued_date: "",
    expiry_date: ""
  });

  useEffect(() => {
    fetchCertifications();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('id, users(first_name, last_name)');
    if (data) setEmployees(data);
  };

  const fetchCertifications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('certifications').select('*, employees(id, first_name, last_name, users(first_name, last_name))').order('created_at', { ascending: false });
    if (!error && data) {
      setCertifications(data);
      
      const now = new Date().getTime();
      let valid = 0;
      let expiringSoon = 0;
      let expired = 0;
      
      data.forEach((cert: any) => {
        if (cert.expiry_date) {
          const daysRemaining = Math.ceil((new Date(cert.expiry_date).getTime() - now) / (1000 * 3600 * 24));
          if (daysRemaining <= 0) expired++;
          else if (daysRemaining <= 30) expiringSoon++;
          else valid++;
        }
      });
      setStats({ valid, expiringSoon, expired });
    }
    else {
      console.error(error);
      setCertifications([]);
    }
    setIsLoading(false);
  };

  const getEmpName = (emp: any) => {
    if (!emp) return 'Unknown Employee';
    const first = emp.users?.first_name || emp.first_name || '';
    const last = emp.users?.last_name || emp.last_name || '';
    if (!first && !last) return `Employee #${emp.id?.slice(0,6)}`;
    return `${first} ${last}`.trim();
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    if (form.employee_id) {
      const { error } = await supabase.from('certifications').insert([form]);
      if (!error) {
        setShowModal(false);
        setForm({ employee_id: "", name: "", issued_date: "", expiry_date: "" });
        fetchCertifications();
      }
      else {
        console.error(error);
        alert("Error adding certification: " + error.message);
      }
    } else {
      alert("Please select an employee.");
    }
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-full font-sans">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Certifications</h1>
            {stats.expired > 0 && <span className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">{stats.expired} expired</span>}
          </div>
          <p className="text-slate-500 text-sm">Track employee certifications and expiry dates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Valid</p>
            <p className="text-2xl font-bold text-slate-900">{stats.valid}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Expiring Soon</p>
            <p className="text-2xl font-bold text-slate-900">{stats.expiringSoon}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Expired</p>
            <p className="text-2xl font-bold text-slate-900">{stats.expired}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search certifications..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 py-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            Loading certifications...
          </div>
        ) : certifications.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-500">
            No certifications found. Click "Add Certification" to generate one.
          </div>
        ) : certifications.map((cert, idx) => {
          const daysRemaining = cert.expiry_date ? Math.ceil((new Date(cert.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
          const status = daysRemaining > 0 ? 'Valid' : 'Expired';
          
          return (
          <div key={cert.id || idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status === 'Valid' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{cert.name}</h3>
                  <p className="text-xs text-slate-500">OSHA</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${status === 'Valid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {status}
              </span>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xs font-medium text-slate-700">
                  {getEmpName(cert.employees)}
                </p>
                <p className="text-[10px] text-slate-400">{cert.employee_id?.split('-')[0]?.toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Expires {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : '—'}</span>
                <span className={status === 'Valid' ? 'text-blue-600 font-semibold' : 'text-red-500 font-semibold'}>
                  {daysRemaining > 0 ? `${daysRemaining} days` : '0 days'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${status === 'Valid' ? 'bg-blue-600' : 'bg-red-500'}`} 
                  style={{ width: status === 'Valid' ? '70%' : '100%' }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Issued: {cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : '—'}</p>
            </div>
          </div>
        )})}
      </div>

      {/* Add Certification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add Certification</h3>
            <form onSubmit={handleAddCertification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <select required className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}>
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.users?.first_name} {emp.users?.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Certification Name</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. OSHA 30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issued Date</label>
                  <input required type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.issued_date} onChange={e => setForm({...form, issued_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg font-medium hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
