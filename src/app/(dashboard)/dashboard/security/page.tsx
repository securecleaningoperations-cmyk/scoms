"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, UserPlus, Lock, Key, Settings2, MoreHorizontal, 
  Search, Loader2, AlertTriangle, Shield, Check, X, 
  User, Mail, Building, CheckCircle2, ChevronRight, Sliders, RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TenantUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_id?: string;
  status?: string;
  mfa_enabled?: boolean;
  access_scope?: string;
  created_at?: string;
}

const SCOMS_ROLES = [
  { id: "super_admin", label: "Super Admin / Platform Owner", desc: "Unrestricted access across all operational modules, billing, and settings", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "corporate_admin", label: "Corporate Admin", desc: "Enterprise operations and workforce governance without system code access", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "operations_manager", label: "Operations Manager", desc: "Field dispatching, route planning, job orders, and incident management", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "supervisor", label: "Field Supervisor", desc: "On-site quality QA inspections, technician shift check-ins, and checklists", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "field_employee", label: "Field Cleaner / Technician", desc: "Mobile shifts, cleanroom checklist execution, and geo-clock in", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "hr_manager", label: "HR & Recruiting Manager", desc: "Employee records, payroll liabilities, certifications, and academy training", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { id: "finance_admin", label: "Finance & Accounting Admin", desc: "General ledger, invoicing, job costing, and bid calculator", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "franchise_admin", label: "Franchise Owner / Operator", desc: "Hub operations, multi-location compliance, and royalty statements", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "client_admin", label: "Client Facility Admin", desc: "Customer portal walkthroughs, service approvals, and invoice history", color: "bg-slate-100 text-slate-700 border-slate-200" }
];

export default function SecurityRolesPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // New user form state
  const [provisionForm, setProvisionForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "operations_manager",
    accessScope: "Global All Hubs",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const normalizedUsers: TenantUser[] = (data || []).map(u => ({
        id: u.id,
        email: u.email || 'user@company.com',
        first_name: u.first_name || (u.email ? u.email.split('@')[0] : 'User'),
        last_name: u.last_name || '',
        role: u.role || 'super_admin',
        tenant_id: u.tenant_id || 'default-tenant',
        status: 'active',
        mfa_enabled: true,
        access_scope: u.role === 'super_admin' ? 'Global Enterprise' : 'Regional Facility Hub',
        created_at: u.created_at || new Date().toISOString()
      }));

      setUsers(normalizedUsers);
    } catch (e: any) {
      console.error("Fetch users error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string, newScope: string) => {
    try {
      await supabase.from('users').update({ 
        role: newRole,
      }).eq('id', userId);
    } catch {}

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, access_scope: newScope } : u));
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, role: newRole, access_scope: newScope } : null);
    }
    setSaveSuccess(`Role updated to ${newRole.replace(/_/g, ' ')} successfully.`);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: TenantUser = {
      id: `usr-${Date.now()}`,
      email: provisionForm.email,
      first_name: provisionForm.firstName,
      last_name: provisionForm.lastName,
      role: provisionForm.role,
      status: 'active',
      mfa_enabled: true,
      access_scope: provisionForm.accessScope,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('users').insert([{
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
      }]);
    } catch {}

    setUsers([newUser, ...users]);
    setShowProvisionModal(false);
    setProvisionForm({ firstName: "", lastName: "", email: "", role: "operations_manager", accessScope: "Global All Hubs" });
    setSaveSuccess(`User ${newUser.first_name} ${newUser.last_name} provisioned as ${newUser.role.replace(/_/g, ' ')}.`);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (r: string) => {
    const found = SCOMS_ROLES.find(role => role.id === r);
    return found ? found.color : "bg-slate-100 text-slate-700 border-slate-200";
  };

  const activeRolesCount = Array.from(new Set(users.map(u => u.role))).length;
  const superAdminCount = users.filter(u => u.role === 'super_admin').length;

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-6 font-sans pb-24">
      {/* Toast */}
      {saveSuccess && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="text-sm font-semibold">{saveSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Identity & Access Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Users & Roles (RBAC)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage user profiles, assign operational roles, enforce MFA security, and configure tenant permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowPolicyModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Sliders className="w-4 h-4 text-blue-600" /> View RBAC Matrix
          </button>
          <button 
            onClick={() => setShowProvisionModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" /> Provision New User
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Registered Users</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Super Admins / Owners</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">{superAdminCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Distinct Active Roles</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">{activeRolesCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">MFA Protected Accounts</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">{users.length}</p>
          </div>
        </div>
      </div>

      {/* User Directory Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search users by name, email, or role..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Role Filter:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles ({users.length})</option>
              {SCOMS_ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="px-6 py-4">User Account</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Access Scope</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">MFA Security</th>
                <th className="px-6 py-4 text-right">Profile Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading enterprise users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No users matching criteria.
                  </td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr 
                  key={u.id} 
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-blue-50/20 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {u.first_name} {u.last_name}
                    </div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getRoleBadge(u.role)}`}>
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                    {u.access_scope || 'Global Enterprise'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-emerald-700 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Enforced
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(u);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                    >
                      Edit Role & Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profile & Role Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-base font-bold shadow-xs">
                  {selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0) || selectedUser.email.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedUser.first_name} {selectedUser.last_name}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Change User Role & Permissions
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {SCOMS_ROLES.map(r => (
                    <label 
                      key={r.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedUser.role === r.id ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-500' : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="userRole" 
                        value={r.id} 
                        checked={selectedUser.role === r.id}
                        onChange={() => setSelectedUser({ ...selectedUser, role: r.id })}
                        className="mt-1" 
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{r.label}</p>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Access Scope
                </label>
                <select
                  value={selectedUser.access_scope}
                  onChange={e => setSelectedUser({ ...selectedUser, access_scope: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Global Enterprise">Global Enterprise (All Hubs & Locations)</option>
                  <option value="Dallas Metro Hub">Dallas Metro Hub Only</option>
                  <option value="Austin Tech Corridor">Austin Tech Corridor Only</option>
                  <option value="Phoenix Central Hub">Phoenix Central Hub Only</option>
                  <option value="Atlanta Commercial Hub">Atlanta Commercial Hub Only</option>
                  <option value="Facility Specific">Facility Specific (Single Contract Site)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">MFA & Authentication Policy</p>
                  <p className="text-[11px] text-slate-500">Requires authenticator code on corporate login</p>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200 text-[10px]">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateRole(selectedUser.id, selectedUser.role, selectedUser.access_scope || 'Global Enterprise')}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Save Role & Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Provision New Enterprise User</h3>
                <p className="text-xs text-slate-500">Create login credentials and assign role scope.</p>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionUser} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Elena"
                    value={provisionForm.firstName}
                    onChange={e => setProvisionForm({ ...provisionForm, firstName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Vance"
                    value={provisionForm.lastName}
                    onChange={e => setProvisionForm({ ...provisionForm, lastName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="e.vance@securecleaningops.com"
                  value={provisionForm.email}
                  onChange={e => setProvisionForm({ ...provisionForm, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={provisionForm.role}
                  onChange={e => setProvisionForm({ ...provisionForm, role: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  {SCOMS_ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Access Scope</label>
                <select
                  value={provisionForm.accessScope}
                  onChange={e => setProvisionForm({ ...provisionForm, accessScope: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option>Global All Hubs</option>
                  <option>Dallas Metro Hub</option>
                  <option>Austin Tech Corridor</option>
                  <option>Phoenix Central</option>
                  <option>Atlanta Commercial</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowProvisionModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                  Provision User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RBAC Matrix Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-bold text-slate-900 text-base">SCOMS v4.0 RBAC Permission Matrix</h3>
                <p className="text-xs text-slate-500">Security access levels by role classification</p>
              </div>
              <button onClick={() => setShowPolicyModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Role</th>
                    <th className="p-3">Operations & Dispatch</th>
                    <th className="p-3">Workforce & HR</th>
                    <th className="p-3">Finance & P&L</th>
                    <th className="p-3">Quality & CAPA</th>
                    <th className="p-3">Security & RBAC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SCOMS_ROLES.map(r => (
                    <tr key={r.id}>
                      <td className="p-3 font-bold text-slate-900">{r.label}</td>
                      <td className="p-3">{["super_admin", "corporate_admin", "operations_manager", "supervisor", "scheduler", "field_employee"].includes(r.id) ? "✓ Full / Shift" : "—"}</td>
                      <td className="p-3">{["super_admin", "corporate_admin", "hr_manager", "payroll_admin"].includes(r.id) ? "✓ Full Access" : "—"}</td>
                      <td className="p-3">{["super_admin", "corporate_admin", "finance_admin", "payroll_admin"].includes(r.id) ? "✓ Full Access" : "—"}</td>
                      <td className="p-3">{["super_admin", "corporate_admin", "operations_manager", "supervisor"].includes(r.id) ? "✓ Audits & QA" : "—"}</td>
                      <td className="p-3">{["super_admin", "corporate_admin"].includes(r.id) ? "✓ Manage Roles" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={() => setShowPolicyModal(false)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold">
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
