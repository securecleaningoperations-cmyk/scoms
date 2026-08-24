"use client";

import { useState, useEffect } from "react";
import { UserPlus, CheckCircle, Clock, AlertCircle, FileText, UploadCloud, FileSignature, Copy, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OnboardingCenter() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [empForm, setEmpForm] = useState({ first_name: '', last_name: '', email: '', role: 'field_employee', pay_type: 'hourly', pay_rate: '' });
  
  const [newCredentials, setNewCredentials] = useState<{email: string, password: string} | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data } = await supabase.from('employees').select('*, users(first_name, last_name, email)');
    if (data) {
      setEmployees(data);
    }
    setLoading(false);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...empForm })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create employee');
      
      setShowAddModal(false);
      setEmpForm({ first_name: '', last_name: '', email: '', role: 'field_employee', pay_type: 'hourly', pay_rate: '' });
      fetchEmployees();
      
      if (json.credentials) {
        setNewCredentials(json.credentials);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (newCredentials) {
      navigator.clipboard.writeText(`Email: ${newCredentials.email}\nPassword: ${newCredentials.password}`);
      alert("Credentials copied to clipboard!");
    }
  };

  const pendingOnboarding = employees.filter(e => e.status === 'onboarding').length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-display">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-ink-navy mb-2 tracking-tight">Employee Onboarding</h1>
          <p className="text-slate-gray">Module 1.1 • Automated document collection, signatures, and setup.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="cal-btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Start New Onboarding
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="cal-card p-6 border border-hairline bg-paper text-center">
          <div className="w-12 h-12 bg-cloud rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-tangerine" />
          </div>
          <h2 className="text-3xl font-bold text-ink-navy">{pendingOnboarding}</h2>
          <p className="text-sm font-semibold text-mist-gray uppercase tracking-widest mt-1">In Progress</p>
        </div>
        <div className="cal-card p-6 border border-hairline bg-paper text-center">
          <div className="w-12 h-12 bg-[#fee2e2] rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-[#ef4444]" />
          </div>
          <h2 className="text-3xl font-bold text-ink-navy">0</h2>
          <p className="text-sm font-semibold text-mist-gray uppercase tracking-widest mt-1">Action Required</p>
        </div>
        <div className="cal-card p-6 border border-hairline bg-paper text-center">
          <div className="w-12 h-12 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-[#166534]" />
          </div>
          <h2 className="text-3xl font-bold text-ink-navy">{activeEmployees}</h2>
          <p className="text-sm font-semibold text-mist-gray uppercase tracking-widest mt-1">Active</p>
        </div>
        <div className="cal-card p-6 border border-hairline bg-paper text-center">
          <div className="w-12 h-12 bg-[#dbeaff] rounded-full flex items-center justify-center mx-auto mb-3">
            <FileSignature className="w-6 h-6 text-[#1e3a8a]" />
          </div>
          <h2 className="text-3xl font-bold text-ink-navy">0</h2>
          <p className="text-sm font-semibold text-mist-gray uppercase tracking-widest mt-1">Pending Sigs</p>
        </div>
      </div>

      <div className="bg-paper border border-hairline rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-hairline bg-cloud/30">
          <h2 className="text-lg font-bold text-ink-navy">Active Onboarding Flows</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-widest text-mist-gray border-b border-hairline">
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-gray">No employees found. Start onboarding one!</td>
                </tr>
              ) : employees.map((emp) => {
                const name = `${emp.users?.first_name || ''} ${emp.users?.last_name || ''}`.trim() || 'Unknown User';
                const progress = emp.status === 'active' ? 100 : 25;
                const statusColor = emp.status === 'active' ? 'bg-[#10b981]' : 'bg-tangerine';
                
                return (
                  <tr key={emp.id} className="hover:bg-cloud/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-signal-blue text-white flex items-center justify-center font-bold text-xs uppercase">
                          {name.substring(0, 2)}
                        </div>
                        <span className="font-semibold text-ink-navy text-sm">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-gray capitalize">{emp.users?.role?.replace(/_/g, ' ') || 'Employee'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-pebble rounded-full h-2 max-w-[120px]">
                          <div className={`${statusColor} h-2 rounded-full`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-ink-navy">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-gray flex items-center gap-1.5 capitalize">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-signal-blue hover:text-ink-navy font-medium text-sm transition-colors">
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cal-card p-6 bg-paper border border-hairline">
          <h3 className="text-lg font-bold text-ink-navy mb-4">Required Documents Checklist</h3>
          <ul className="space-y-3">
             <li className="flex justify-between items-center p-3 bg-cloud rounded-lg border border-hairline">
                <div className="flex items-center gap-3">
                   <FileText className="w-4 h-4 text-signal-blue" />
                   <span className="text-sm font-medium text-ink-navy">W-4 Tax Form</span>
                </div>
                <span className="text-xs bg-soft-mint text-vivid-green px-2 py-0.5 rounded font-semibold">Auto-Generated</span>
             </li>
             <li className="flex justify-between items-center p-3 bg-cloud rounded-lg border border-hairline">
                <div className="flex items-center gap-3">
                   <FileText className="w-4 h-4 text-signal-blue" />
                   <span className="text-sm font-medium text-ink-navy">I-9 Employment Eligibility</span>
                </div>
                <span className="text-xs bg-[#dbeaff] text-electric-blue px-2 py-0.5 rounded font-semibold">Requires Upload</span>
             </li>
             <li className="flex justify-between items-center p-3 bg-cloud rounded-lg border border-hairline">
                <div className="flex items-center gap-3">
                   <FileSignature className="w-4 h-4 text-signal-blue" />
                   <span className="text-sm font-medium text-ink-navy">Employee Handbook</span>
                </div>
                <span className="text-xs bg-paper-mist text-slate-gray px-2 py-0.5 rounded font-semibold border border-hairline">E-Sign Only</span>
             </li>
          </ul>
        </div>
        
        <div className="cal-card p-6 bg-paper border border-hairline flex flex-col justify-center items-center text-center border-dashed border-2">
           <div className="w-12 h-12 bg-cloud rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6 text-signal-blue" />
           </div>
           <h3 className="font-bold text-ink-navy mb-1">Mass Import Employees</h3>
           <p className="text-sm text-slate-gray mb-4">Upload a CSV to invite multiple employees to the onboarding portal at once.</p>
           <button className="cal-btn-ghost border border-hairline">Download CSV Template</button>
        </div>
      </div>
      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-signal-blue/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-signal-blue" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink-navy">Onboard New Hire</h3>
                <p className="text-xs text-slate-500">Create an account and assign roles</p>
              </div>
            </div>
            
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input required type="text" value={empForm.first_name} onChange={e => setEmpForm(p => ({ ...p, first_name: e.target.value }))} className="w-full border border-hairline bg-cloud rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal-blue" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input required type="text" value={empForm.last_name} onChange={e => setEmpForm(p => ({ ...p, last_name: e.target.value }))} className="w-full border border-hairline bg-cloud rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal-blue" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input required type="email" value={empForm.email} onChange={e => setEmpForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-hairline bg-cloud rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal-blue" placeholder="jane@company.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">System Role</label>
                <select required value={empForm.role} onChange={e => setEmpForm(p => ({ ...p, role: e.target.value }))} className="w-full border border-hairline bg-cloud rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal-blue">
                  <option value="field_employee">Field Employee (Cleaner)</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="operations_manager">Operations Manager</option>
                  <option value="hr_manager">HR Manager</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Type</label>
                  <select required value={empForm.pay_type} onChange={e => setEmpForm(p => ({ ...p, pay_type: e.target.value }))} className="w-full border border-hairline bg-cloud rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal-blue">
                    <option value="hourly">Hourly</option>
                    <option value="salary">Salary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Rate ($)</label>
                  <input required type="number" step="0.01" value={empForm.pay_rate} onChange={e => setEmpForm(p => ({ ...p, pay_rate: e.target.value }))} className="w-full border border-hairline bg-cloud rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-signal-blue" placeholder="18.50" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-hairline mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-pebble transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="cal-btn-primary py-2 px-6 flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Success Modal */}
      {newCredentials && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 relative text-center">
            <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#166534]" />
            </div>
            <h3 className="text-2xl font-bold text-ink-navy mb-2">Account Created!</h3>
            <p className="text-slate-500 text-sm mb-6">The employee has been onboarded successfully. Please securely share these temporary credentials with them.</p>
            
            <div className="bg-cloud border border-hairline rounded-xl p-4 text-left space-y-3 mb-6 relative">
              <button onClick={copyToClipboard} className="absolute top-4 right-4 p-2 bg-white rounded-lg border border-hairline text-slate-500 hover:text-signal-blue shadow-sm transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email (Login ID)</p>
                <p className="font-mono text-ink-navy font-bold">{newCredentials.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temporary Password</p>
                <p className="font-mono text-ink-navy font-bold">{newCredentials.password}</p>
              </div>
            </div>

            <button onClick={() => setNewCredentials(null)} className="w-full cal-btn-primary py-3 text-base">
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
