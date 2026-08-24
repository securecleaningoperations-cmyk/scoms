"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  UserCheck, 
  Clock, 
  CalendarDays, 
  ShieldAlert,
  Search,
  MoreVertical
} from "lucide-react";
import clsx from "clsx";

const hrStats = [
  { title: "Total Workforce", value: "...", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Currently Clocked In", value: "...", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-100" },
  { title: "Pending Leave Requests", value: "...", icon: CalendarDays, color: "text-amber-600", bg: "bg-amber-100" },
  { title: "Compliance Warnings", value: "...", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-100" },
];

export default function HRDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const { data, error } = await supabase.from('employees').select('*, users(first_name, last_name, role)');
        if (error) throw error;
        setEmployees(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Workforce (HR) Engine</h1>
          <p className="text-muted-foreground">Engine 1 • Lifecycle, Onboarding, Pay & Attendance</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-card hover:bg-muted border border-border text-foreground px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Run Payroll Batch
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>Onboard Employee</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hrStats.map((stat, i) => (
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
                {stat.title === "Total Workforce" && !loading ? employees.length : stat.value}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Employee Directory Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card shadow-sm border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
          <h2 className="text-xl font-bold text-foreground">Employee Directory</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Syncing real data from Supabase...</div>
          ) : employees.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">No employees found in the database.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Pay Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {emp.users?.first_name ? emp.users.first_name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{emp.users?.first_name} {emp.users?.last_name}</div>
                          <div className="text-xs text-muted-foreground">{emp.users?.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs truncate max-w-[100px]">{emp.id}</td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">{emp.users?.role || 'Employee'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{emp.pay_type}</span>
                        <span className="text-xs text-muted-foreground">${emp.pay_rate}/hr</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                        emp.status === "active" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : 
                        emp.status === "onboarding" ? "bg-blue-100 text-blue-700 border border-blue-200" : 
                        "bg-red-100 text-red-700 border border-red-200"
                      )}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground p-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
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
