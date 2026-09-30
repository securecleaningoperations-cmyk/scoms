"use client";

import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EmployeeCommunicationsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/employee/dashboard" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Messages</h1>
          <p className="text-sm text-slate-400 mt-1">Chat with operations dispatch and field managers.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 shadow-xl">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-indigo-500 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Message Center</h2>
        <p className="text-sm max-w-md mx-auto leading-relaxed">
          No new messages from dispatch. All clears!
        </p>
      </div>
    </div>
  );
}
