"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, Calendar, Clock, DollarSign, BookOpen, 
  MessageSquare, Briefcase, LogOut, FileText, Menu, X, 
  ArrowLeft, CheckCircle2, ShieldCheck, QrCode
} from "lucide-react";
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

const BOTTOM_NAV = [
  { href: "/employee/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/employee/schedule", label: "Schedule", icon: Calendar },
  { href: "/employee/timesheets", label: "Clock / Time", icon: Clock },
  { href: "/employee/training", label: "Training", icon: BookOpen },
];

export default function EmployeeSidebar({ employeeName, role }: { employeeName?: string, role?: string }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/employee/login";
  };

  return (
    <>
      {/* Mobile Top App Header */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">SCOMS Field App</h1>
            <p className="text-[10px] text-indigo-400 capitalize">{employeeName ?? 'Field Specialist'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            title="Return to Corporate Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline text-[11px]">Portal</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
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
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[280px] max-w-[80vw] bg-slate-900 border-r border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">SCOMS Mobile</h2>
                  <p className="text-[10px] text-slate-400">Workforce Field OS</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {employeeName && (
              <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-200 truncate">{employeeName}</p>
                <p className="text-[11px] text-indigo-400 capitalize">{role?.replace(/_/g, ' ') || 'Cleaning Specialist'}</p>
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Corporate Dashboard</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col h-screen fixed left-0 top-0 text-white z-30">
        {/* Logo & User */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-wide">SCOMS Team</span>
                <p className="text-[10px] text-slate-400">Field Workforce</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 bg-slate-800 rounded-md transition-colors"
              title="Return to Main Dashboard"
            >
              Admin
            </Link>
          </div>

          {employeeName && (
            <div className="bg-slate-800/70 p-2.5 rounded-xl">
              <p className="text-xs font-semibold text-slate-200 truncate">{employeeName}</p>
              <p className="text-[10px] text-indigo-400 capitalize">{role?.replace(/_/g, ' ') || 'Cleaning Specialist'}</p>
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (App Bar for Phone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around text-slate-400 shadow-2xl">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-[10px] font-medium ${
                active ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-indigo-400 scale-110' : 'text-slate-400'}`} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium hover:text-slate-200"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
