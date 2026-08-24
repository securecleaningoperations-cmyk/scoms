"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, AlertCircle, Calendar, FileText, DollarSign, MessageSquare, CalendarClock, LogOut, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/requests", label: "Service Requests", icon: ClipboardList },
  { href: "/portal/complaints", label: "Complaints", icon: AlertCircle },
  { href: "/portal/schedule", label: "Schedule", icon: Calendar },
  { href: "/portal/appointments", label: "Appointments", icon: CalendarClock },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/billing", label: "Billing", icon: DollarSign },
  { href: "/portal/communications", label: "Communications", icon: MessageSquare },
];

export default function PortalSidebar({ clientName }: { clientName?: string }) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/portal/login";
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">SCOMS Portal</span>
        </div>
        {clientName && <p className="text-xs text-slate-400 font-medium pl-10 truncate">{clientName}</p>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-100">
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
