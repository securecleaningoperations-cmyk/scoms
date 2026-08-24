"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Loader2 } from "lucide-react";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
      setQuotes(data || [
        { id: "Q-1092", client_name: "Apex Healthcare Center", amount: 14500, status: "Sent", created_at: "2026-07-25" },
        { id: "Q-1093", client_name: "Summit Corporate Plaza", amount: 28900, status: "Approved", created_at: "2026-07-27" }
      ]);
      setLoading(false);
    }
    loadQuotes();
  }, []);

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quotes & Commercial Proposals</h1>
          <p className="text-slate-500 text-sm mt-1">Client estimates, bidding quotes, and pending proposals</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Quote
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
            <tr>
              <th className="p-4 pl-6">Quote ID</th>
              <th className="p-4">Client Name</th>
              <th className="p-4">Estimated Value</th>
              <th className="p-4">Date</th>
              <th className="p-4 pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600"/></td></tr>
            ) : quotes.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-mono font-bold text-slate-900">{q.id}</td>
                <td className="p-4 font-semibold text-slate-800">{q.client_name}</td>
                <td className="p-4 font-bold text-slate-900">${Number(q.amount || 0).toLocaleString()}</td>
                <td className="p-4 text-slate-500">{q.created_at}</td>
                <td className="p-4 pr-6">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                    {q.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
