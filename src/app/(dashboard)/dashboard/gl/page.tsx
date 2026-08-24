"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, FileText, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  recorded_at: string;
}

export default function BookkeepingPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLedger() {
      try {
        const { data, error } = await supabase
          .from('ledger')
          .select('*')
          .order('recorded_at', { ascending: false });
        
        if (error) throw error;
        setEntries(data || []);
      } catch (err) {
        console.error("Error fetching ledger:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLedger();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight mb-2">General Ledger</h1>
          <p className="text-slate-gray font-medium">Engine 5.0 • Bookkeeping and transactional audit logs</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="cal-btn-primary flex items-center gap-2">
             <Plus className="w-4 h-4" />
             New Entry
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="cal-card border-hairline overflow-hidden">
         <div className="p-6 border-b border-hairline bg-paper flex justify-between items-center">
            <h2 className="text-lg font-bold text-ink-navy font-display">Transaction History</h2>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                   <th className="p-4 pl-6">Date</th>
                   <th className="p-4">Description</th>
                   <th className="p-4">Type</th>
                   <th className="p-4 text-right pr-6">Amount</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-hairline">
                 {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-gray">
                         <div className="flex flex-col items-center justify-center gap-3">
                           <div className="w-6 h-6 border-2 border-signal-blue border-t-transparent rounded-full animate-spin"></div>
                           <span className="text-sm font-medium">Loading ledger records...</span>
                         </div>
                      </td>
                    </tr>
                 ) : entries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                         <FileText className="w-12 h-12 text-mist-gray mx-auto mb-3 opacity-50" />
                         <p className="text-ink-navy font-semibold">No transactions found.</p>
                         <p className="text-sm text-slate-gray mt-1">Start by recording your first transaction.</p>
                      </td>
                    </tr>
                 ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-cloud/50 transition-colors">
                        <td className="p-4 pl-6 text-sm text-slate-gray">
                           {new Date(entry.recorded_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-medium text-ink-navy">
                          {entry.description || 'N/A'}
                        </td>
                        <td className="p-4">
                           <span className={`cal-badge flex w-max items-center gap-1 ${
                             entry.type === 'Revenue' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 
                             entry.type === 'Expense' ? 'bg-[#fff0f0] text-[#ef4444]' :
                             'bg-pebble text-deep-cobalt'
                           }`}>
                             {entry.type === 'Revenue' && <ArrowUpRight className="w-3 h-3" />}
                             {entry.type === 'Expense' && <ArrowDownRight className="w-3 h-3" />}
                             {entry.type}
                           </span>
                        </td>
                        <td className={`p-4 text-right pr-6 font-display font-bold ${
                           entry.type === 'Revenue' ? 'text-[#1e8e3e]' : 
                           entry.type === 'Expense' ? 'text-[#ef4444]' :
                           'text-ink-navy'
                        }`}>
                           {entry.type === 'Expense' ? '-' : entry.type === 'Revenue' ? '+' : ''}
                           {formatCurrency(entry.amount)}
                        </td>
                      </tr>
                    ))
                 )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
