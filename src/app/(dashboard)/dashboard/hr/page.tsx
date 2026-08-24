'use client';

import React, { useState, useEffect } from 'react';
import { Users, Upload, Video, ShieldAlert, CheckCircle2, ChevronRight, GraduationCap } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function HRManagementPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'training'>('employees');
  const [employees, setEmployees] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [savingEmp, setSavingEmp] = useState(false);
  const [empForm, setEmpForm] = useState({ first_name: '', last_name: '', email: '', role: 'field_employee', pay_type: 'hourly', pay_rate: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch real employees
    const { data: empData } = await supabase.from('employees').select('*, users(first_name, last_name, email)');
    if (empData) setEmployees(empData);

    // Fetch real trainings (unique by type to show modules)
    const { data: trainData } = await supabase.from('trainings').select('*');
    if (trainData) {
      const uniqueModules = trainData.reduce((acc: any[], current: any) => {
        if (!acc.find((x: any) => x.type === current.type)) {
          acc.push({ ...current, completions: trainData.filter((t: any) => t.type === current.type && (t.status === 'Completed' || t.status === 'completed')).length });
        }
        return acc;
      }, []);
      setTrainings(uniqueModules);
    }
    setLoading(false);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmp(true);
    
    // We fetch a valid tenant_id from the current user or assume one if RLS is flexible
    const { data: { session } } = await supabase.auth.getSession();
    
    try {
      const res = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...empForm })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create employee');
      
      setShowAddEmpModal(false);
      setEmpForm({ first_name: '', last_name: '', email: '', role: 'field_employee', pay_type: 'hourly', pay_rate: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEmp(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR & Training Command Center</h1>
          <p className="text-slate-500 mt-2">Manage workforce roles, monitor performance, and deploy interactive training.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            Manage Employees
          </button>
          <button 
            onClick={() => setActiveTab('training')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'training' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <GraduationCap className="inline-block w-5 h-5 mr-2" />
            Training Studio
          </button>
        </div>
      </div>

      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Workforce Roster</h2>
            <button onClick={() => setShowAddEmpModal(true)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100">
              + Add Employee
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Employee Name</th>
                <th className="p-4 font-semibold">Assigned Role</th>
                <th className="p-4 font-semibold">Primary Location</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading employees...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No employees found.</td>
                </tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">{emp.users?.first_name} {emp.users?.last_name}</td>
                  <td className="p-4">
                    <select className="bg-slate-100 border-none text-sm font-semibold text-slate-700 rounded-lg p-2 cursor-pointer focus:ring-2 focus:ring-indigo-500 disabled:opacity-75" value={emp.role || 'Cleaner'} disabled>
                      <option value="Cleaner">Cleaner</option>
                      <option value="Lead Cleaner">Lead Cleaner</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Quality Manager">Quality Manager</option>
                      <option value="Operational Manager">Operational Manager</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-600">Multiple</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700`}>
                      Active
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center text-sm">
                      Monitor Profile <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Active Training Modules</h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-slate-500 p-4">Loading training modules...</p>
                ) : trainings.length === 0 ? (
                  <p className="text-slate-500 p-4">No active training modules found.</p>
                ) : trainings.map(train => (
                  <div key={train.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-4">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{train.type}</h3>
                        <p className="text-sm text-slate-500">Video + Quiz • {train.completions} completions across workforce</p>
                      </div>
                    </div>
                    <Link href="/dashboard/hr/training" className="text-slate-400 hover:text-slate-600">
                      Manage Trainings
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Upload New Video</h2>
              <p className="text-indigo-200 text-sm mb-6">Deploy a new training video and attach an interactive MCQ quiz for employees.</p>
              
              <div className="border-2 border-dashed border-indigo-400 rounded-xl p-8 text-center bg-indigo-700/30 mb-6">
                <Upload className="w-8 h-8 mx-auto mb-2 text-indigo-300" />
                <p className="font-semibold">Drag & Drop MP4</p>
                <p className="text-xs text-indigo-300 mt-1">Maximum size 500MB</p>
              </div>

              <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl shadow hover:bg-slate-50 transition-colors">
                Select Video File
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center text-amber-600 mb-4">
                <ShieldAlert className="w-5 h-5 mr-2" />
                <h3 className="font-bold">Compliance Status</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">3 employees are currently overdue for Mandatory Hazmat Training.</p>
              <button className="w-full bg-amber-50 text-amber-700 font-semibold py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">First Name</label><input required type="text" value={empForm.first_name} onChange={e => setEmpForm(p => ({ ...p, first_name: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label><input required type="text" value={empForm.last_name} onChange={e => setEmpForm(p => ({ ...p, last_name: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input required type="email" value={empForm.email} onChange={e => setEmpForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select required value={empForm.role} onChange={e => setEmpForm(p => ({ ...p, role: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="field_employee">Field Employee (Cleaner)</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="operations_manager">Operations Manager</option>
                  <option value="hr_manager">HR Manager</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pay Type</label>
                  <select required value={empForm.pay_type} onChange={e => setEmpForm(p => ({ ...p, pay_type: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="hourly">Hourly</option>
                    <option value="salary">Salary</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Pay Rate ($)</label><input required type="number" step="0.01" value={empForm.pay_rate} onChange={e => setEmpForm(p => ({ ...p, pay_rate: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={savingEmp} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                  {savingEmp ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
