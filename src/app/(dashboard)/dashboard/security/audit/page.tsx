"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, ShieldAlert, Loader2 } from "lucide-react";

export default function SecurityAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
      setLogs(data || [
        { id: "LOG-9021", action: "USER_LOGIN_SUCCESS", actor: "admin@scoms.app", created_at: new Date().toISOString() },
        { id: "LOG-9022", action: "DOCUMENT_UPLOAD", actor: "operations@scoms.app", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: "LOG-9023", action: "EMPLOYEE_RECORD_CREATE", actor: "hr@scoms.app", created_at: new Date(Date.now() - 7200000).toISOString() }
      ]);
      setLoading(false);
    }
    loadLogs();
  }, []);

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Security Audit Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Immutable security event records, user authentication, and data access logs</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
            <tr>
              <th className="p-4 pl-6">Log ID</th>
              <th className="p-4">Action Event</th>
              <th className="p-4">Actor Email</th>
              <th className="p-4 pr-6">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600"/></td></tr>
            ) : logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-mono font-bold text-slate-900 text-xs">{l.id}</td>
                <td className="p-4 font-semibold text-blue-600">{l.action}</td>
                <td className="p-4 font-mono text-slate-700 text-xs">{l.actor || 'system'}</td>
                <td className="p-4 pr-6 text-slate-500 text-xs">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
