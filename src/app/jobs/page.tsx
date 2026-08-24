"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  CheckSquare, 
  Clock, 
  ShieldCheck, 
  Search,
  MoreVertical,
  ClipboardCheck
} from "lucide-react";
import clsx from "clsx";

const jobStats = [
  { title: "Active Jobs", value: "...", icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Pending Verification", value: "...", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-100" },
  { title: "Completed Today", value: "...", icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-100" },
  { title: "Avg QA Score", value: "...", icon: ClipboardCheck, color: "text-purple-600", bg: "bg-purple-100" },
];

export default function JobsDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase.from('jobs').select('*, clients(name), employees(users(first_name, last_name))');
        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Jobs & QA Engine</h1>
          <p className="text-muted-foreground">Engine 4 • Assignment, Execution, & Quality Control</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-card hover:bg-muted border border-border text-foreground px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Run Audit
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Create New Job</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {jobStats.map((stat, i) => (
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
                {stat.title === "Active Jobs" && !loading ? jobs.length : stat.value}
              </h2>
            </div>
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
          <h2 className="text-xl font-bold text-foreground">Job Pipeline</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground">Syncing real data from Supabase...</div>
          ) : jobs.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">No jobs found in the database.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Job ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">QA Score</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary truncate max-w-[80px]">{job.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{job.clients?.name || 'Unknown'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {job.employees?.users?.first_name} {job.employees?.users?.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                        job.status === "verified" || job.status === "closed" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : 
                        job.status === "in_progress" ? "bg-blue-100 text-blue-700 border border-blue-200" : 
                        "bg-amber-100 text-amber-700 border border-amber-200"
                      )}>
                        {job.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "font-medium",
                        job.qa_score >= 90 ? "text-emerald-600" :
                        !job.qa_score ? "text-muted-foreground" : "text-amber-600"
                      )}>
                        {job.qa_score ? `${job.qa_score}/100` : 'Pending'}
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
