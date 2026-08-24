"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Clock, DollarSign, BookOpen, MessageSquare, Briefcase, LogOut, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employee/schedule", label: "My Schedule", icon: Calendar },
  { href: "/employee/timesheets", label: "Timesheets", icon: Clock },
  { href: "/employee/payroll", label: "Payroll & Stubs", icon: DollarSign },
  { href: "/employee/training", label: "Training Hub", icon: BookOpen },
  { href: "/employee/documents", label: "HR Documents", icon: FileText },
  { href: "/employee/communications", label: "Messages", icon: MessageSquare },
];

export default function EmployeeSidebar({ employeeName, role }: { employeeName?: string, role?: string }) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/employee/login";
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 text-white">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">SCOMS Team</span>
        </div>
        {employeeName && (
          <div className="pl-10">
            <p className="text-sm font-semibold text-slate-200 truncate">{employeeName}</p>
            <p className="text-xs text-indigo-400 capitalize">{role?.replace(/_/g, ' ')}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
