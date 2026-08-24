"use client";

import { motion } from "framer-motion";
import { 
  Activity, 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  AlertCircle
} from "lucide-react";

export default function ProfitabilityAIDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Profitability AI Engine</h1>
          <p className="text-muted-foreground">Engine 6.7 • Pre-Job + Post-Job Predictive Analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            <span>Analyze New Contract</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card shadow-sm border border-border p-6 rounded-2xl">
          <Target className="w-8 h-8 text-emerald-600 mb-4" />
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Avg Pre-Job Profit Margin</h3>
          <h2 className="text-3xl font-bold text-foreground">Waiting on ML Data...</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card shadow-sm border border-border p-6 rounded-2xl">
          <Activity className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Post-Job Reality Delta</h3>
          <h2 className="text-3xl font-bold text-foreground">N/A</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card shadow-sm border border-border p-6 rounded-2xl">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-4" />
          <h3 className="text-muted-foreground text-sm font-medium mb-1">Top Performing Tier</h3>
          <h2 className="text-3xl font-bold text-foreground">Evaluating...</h2>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card shadow-sm border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Pre-Job Prediction Model</h2>
          <div className="space-y-4">
            <div className="p-4 bg-muted border border-border rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-foreground">Proposed Contract: Pending Request</span>
                <span className="text-slate-500 font-bold bg-slate-200 px-2 py-1 rounded-md text-xs border border-slate-300">AWAITING DB</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div className="p-2 bg-white rounded-md border border-border">
                  <p className="text-muted-foreground mb-1">Est Labor</p>
                  <p className="font-mono text-foreground">$0</p>
                </div>
                <div className="p-2 bg-white rounded-md border border-border">
                  <p className="text-muted-foreground mb-1">Est Risk</p>
                  <p className="font-mono text-slate-500">N/A</p>
                </div>
                <div className="p-2 bg-slate-100 rounded-md border border-slate-200">
                  <p className="text-slate-600 mb-1">Predicted Margin</p>
                  <p className="font-mono text-slate-700 font-bold">0%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card shadow-sm border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Post-Job Analysis & Deviation</h2>
          <div className="space-y-4">
             <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-blue-700 font-medium">Insufficient Real Data</h3>
                <Activity className="w-4 h-4 text-blue-700" />
              </div>
              <p className="text-sm text-muted-foreground">The AI engine requires at least 10 completed jobs from Supabase `jobs` table before generating cost deviation models.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
