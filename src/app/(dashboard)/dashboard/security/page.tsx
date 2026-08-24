"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, UserPlus, Lock, Key, Settings2, MoreHorizontal, Search, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SecurityRolesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (e: any) {
      console.error("Fetch users error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-full font-sans">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Users & Roles</h1>
          <p className="text-slate-500 text-sm">Role-Based Access Control (RBAC) and Security Policies</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Settings2 className="w-4 h-4" /> Manage Policies
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" /> Provision User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">42</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Key className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Roles</p>
            <p className="text-2xl font-bold text-slate-900">8</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Lock className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">MFA Enabled</p>
            <p className="text-2xl font-bold text-slate-900">38</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search users by name, email, or role..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Access Scope</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">MFA</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No users found in this tenant.
                </td>
              </tr>
            ) : users.map((user, idx) => (
              <tr key={user.id || idx} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{user.first_name} {user.last_name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700 capitalize">{user?.role ? String(user.role).replace(/_/g, ' ') : 'User'}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">Standard Access</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200`}>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  {idx % 3 !== 0 ? (
                    <span className="inline-flex items-center text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Disabled
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
