"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, ClipboardList, AlertCircle, Calendar, 
  FileText, DollarSign, MessageSquare, CalendarClock, 
  LogOut, Building2, Menu, X, ArrowLeft, ShieldCheck 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/requests", label: "Service Requests", icon: ClipboardList },
  { href: "/portal/complaints", label: "Complaints & Feedback", icon: AlertCircle },
  { href: "/portal/schedule", label: "Cleaning Schedule", icon: Calendar },
  { href: "/portal/appointments", label: "Appointments", icon: CalendarClock },
  { href: "/portal/documents", label: "Documents & QA", icon: FileText },
  { href: "/portal/billing", label: "Billing & Invoices", icon: DollarSign },
  { href: "/portal/communications", label: "Messages", icon: MessageSquare },
];

export default function PortalSidebar({ clientName }: { clientName?: string }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/portal/login";
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Client Portal</h1>
            <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{clientName ?? 'Customer Account'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1"
            title="Return to Corporate Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline text-[11px]">Ops</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[280px] max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">SCOMS Portal</h2>
                  <p className="text-[10px] text-slate-400">Customer Access</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {clientName && (
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800 truncate">{clientName}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Active Account</span>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Corporate Dashboard</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen fixed left-0 top-0 z-30">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">SCOMS Portal</span>
            </div>
            <Link
              href="/dashboard"
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 rounded-md transition-colors"
              title="Return to Corporate Dashboard"
            >
              Admin
            </Link>
          </div>
          {clientName && <p className="text-xs text-slate-400 font-medium truncate">{clientName}</p>}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
