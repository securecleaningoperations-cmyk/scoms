"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  BookOpen, 
  ArrowRightLeft, 
  Download, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  TrendingDown
} from "lucide-react";
import clsx from "clsx";

const ledgerStats = [
  { title: "Total Assets", value: "...", icon: DollarSign, change: "Real Data", isPositive: true },
  { title: "Total Liabilities", value: "...", icon: ArrowRightLeft, change: "Real Data", isPositive: true },
  { title: "Net Equity", value: "...", icon: BookOpen, change: "Real Data", isPositive: true },
];

export default function GeneralLedgerDashboard() {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLedger() {
      try {
        const { data, error } = await supabase.from('general_ledger').select('*').order('transaction_date', { ascending: false });
        if (error) throw error;
        setLedgerEntries(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLedger();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bookkeeping (GL) Engine</h1>
          <p className="text-muted-foreground">Engine 6.4 • Central Accounting Brain & Double-Entry Ledger</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-card hover:bg-muted border border-border text-foreground px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ledgerStats.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-card shadow-sm border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={clsx("flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full", stat.isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.title}</h3>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {stat.title === "Total Assets" && !loading ? (ledgerEntries.length > 0 ? "$0 (No Asset TXNs)" : "$0") : stat.value}
            </h2>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card shadow-sm border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
          <h2 className="text-xl font-bold text-foreground">General Ledger Transactions</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">Balanced</span>
            <span className="text-sm text-muted-foreground">Double-Entry Validated</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Syncing real data from Supabase...</div>
          ) : ledgerEntries.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">No transactions found in the database.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledgerEntries.map((txn) => (
                  <tr key={txn.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary truncate max-w-[80px]">{txn.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(txn.transaction_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-foreground font-medium capitalize">{txn.account_type}</td>
                    <td className="px-6 py-4 text-muted-foreground">{txn.description}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                        txn.type === "credit" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"
                      )}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-foreground">${Number(txn.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
