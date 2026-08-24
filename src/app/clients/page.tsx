"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  Briefcase, 
  Building2, 
  FileSignature, 
  CheckCircle2, 
  Star,
  Search,
  MoreVertical
} from "lucide-react";
import clsx from "clsx";

const clientStats = [
  { title: "Total Active Clients", value: "...", icon: Building2, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Active Contracts", value: "...", icon: FileSignature, color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Avg Profitability Score", value: "...", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
  { title: "Platinum Tier", value: "...", icon: Star, color: "text-amber-600", bg: "bg-amber-100" },
];

export default function ClientsDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data, error } = await supabase.from('clients').select('*, contracts(*)');
        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Client & Contracts Engine</h1>
          <p className="text-muted-foreground">Engine 3 • Agreements, Billing Rules, & Tiers</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-card hover:bg-muted border border-border text-foreground px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Generate Proposal
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Onboard Client</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {clientStats.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-card shadow-sm border border-border p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={clsx("p-4 rounded-xl", stat.bg, stat.color)}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.title}</h3>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {stat.title === "Total Active Clients" && !loading ? clients.length : stat.value}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Clients Directory Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card shadow-sm border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
          <h2 className="text-xl font-bold text-foreground">Client Portfolio</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Syncing real data from Supabase...</div>
          ) : clients.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No clients found in the database.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Contract Tier</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Profit Score</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => {
                  const contract = client.contracts?.[0]; // Assuming 1 contract for simplicity
                  return (
                    <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-foreground">{client.name}</div>
                          <div className="text-xs text-muted-foreground">{client.contact_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                          contract?.package_tier === "platinum" ? "bg-slate-800 text-slate-100 border border-slate-900" : 
                          contract?.package_tier === "gold" ? "bg-amber-100 text-amber-700 border border-amber-200" : 
                          contract?.package_tier === "silver" ? "bg-gray-100 text-gray-700 border border-gray-200" :
                          "bg-slate-100 text-slate-500"
                        )}>
                          {contract?.package_tier || 'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "flex items-center gap-1 text-xs font-medium capitalize",
                          client.status === "active" ? "text-emerald-600" : "text-blue-600"
                        )}>
                          <div className={clsx("w-1.5 h-1.5 rounded-full", client.status === "active" ? "bg-emerald-500" : "bg-blue-500")} />
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-700 font-medium px-2 py-1 bg-emerald-100 rounded-md border border-emerald-200">
                          {client.profitability_score}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-muted-foreground hover:text-foreground p-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
