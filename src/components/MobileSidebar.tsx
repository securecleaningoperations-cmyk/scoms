"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  X, Shield, ChevronDown, ChevronRight, LayoutDashboard, Users,
  Briefcase, DollarSign, ShieldCheck, Calendar, MessageSquare,
  Lock, Building2, FolderOpen, ClipboardList, BarChart2,
  UserCheck, Network, Settings2, Bot, Activity, GraduationCap,
  Smartphone, ExternalLink, LogOut
} from "lucide-react";
import clsx from "clsx";
import { supabase } from "@/lib/supabase";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  onRoleChange?: (role: string) => void;
  userEmail?: string;
}

const ROLE_ACCESS: Record<string, string[]> = {
  'super_admin': ['ALL'],
  'corporate_admin': ['ALL'],
  'executive': ['Dashboard', 'Documents', 'Finance', 'Improvement', 'Clients', 'Quality', 'Executive'],
  'franchise_admin': ['Dashboard', 'Documents', 'Workforce', 'Scheduling', 'Clients', 'Jobs', 'Quality', 'Finance', 'Franchise', 'Settings'],
  'operations_manager': ['Dashboard', 'Documents', 'Workforce', 'Scheduling', 'Jobs', 'Quality', 'Communications', 'Improvement'],
  'supervisor': ['Dashboard', 'Documents', 'Workforce', 'Scheduling', 'Jobs', 'Quality', 'Communications', 'Improvement'],
  'hr_manager': ['Dashboard', 'Documents', 'Workforce', 'Communications', 'Intelligence'],
  'payroll_admin': ['Dashboard', 'Documents', 'Workforce', 'Finance'],
  'finance_admin': ['Dashboard', 'Documents', 'Finance', 'Clients'],
  'sales_manager': ['Dashboard', 'Documents', 'Clients', 'Communications', 'Intelligence'],
  'scheduler': ['Dashboard', 'Scheduling', 'Jobs'],
  'compliance_officer': ['Dashboard', 'Documents', 'Quality', 'Improvement', 'Security', 'Executive'],
  'field_employee': ['Jobs', 'Scheduling'],
  'client_admin': ['Customer', 'Documents'],
  'client_user': ['Customer'],
  'vendor_manager': ['Executive', 'Documents']
};

const navStructure = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", children: [] },
  { name: "Command Center", icon: Activity, href: "/dashboard/operations", children: [] },
  {
    name: "Documents", icon: FolderOpen, href: "/dashboard/documents",
    children: [
      { name: "Repository", href: "/dashboard/documents" },
      { name: "SOPs", href: "/dashboard/sops" },
      { name: "Templates", href: "/dashboard/documents" }
    ]
  },
  {
    name: "Workforce", icon: Users, href: "/dashboard/hr",
    children: [
      { name: "Employees", href: "/dashboard/hr" },
      { name: "Recruiting", href: "/dashboard/hr/recruiting" },
      { name: "Payroll", href: "/dashboard/hr/payroll" },
      { name: "Training", href: "/dashboard/hr/training" },
      { name: "Certifications", href: "/dashboard/hr/certifications" },
      { name: "Performance", href: "/dashboard/hr/performance" }
    ]
  },
  {
    name: "Scheduling", icon: Calendar, href: "/dashboard/scheduling",
    children: [
      { name: "Calendar", href: "/dashboard/scheduling" },
      { name: "Dispatch", href: "/dashboard/scheduling/dispatch" },
      { name: "Routes", href: "/dashboard/scheduling/routes" }
    ]
  },
  {
    name: "Clients", icon: Building2, href: "/dashboard/clients",
    children: [
      { name: "Client Directory", href: "/dashboard/clients" },
      { name: "Leads Pipeline", href: "/dashboard/leads" },
      { name: "Site Walkthroughs", href: "/dashboard/walkthroughs" },
      { name: "Contracts", href: "/dashboard/clients/contracts" },
      { name: "Proposals", href: "/dashboard/clients/proposals" }
    ]
  },
  {
    name: "Jobs", icon: ClipboardList, href: "/dashboard/jobs",
    children: [
      { name: "All Jobs", href: "/dashboard/jobs" },
      { name: "Checklists", href: "/dashboard/jobs/checklists" }
    ]
  },
  {
    name: "Quality", icon: ShieldCheck, href: "/dashboard/quality",
    children: [
      { name: "QA Inspections", href: "/dashboard/quality" },
      { name: "CAPA", href: "/dashboard/quality/capa" },
      { name: "Incidents", href: "/dashboard/incidents" },
      { name: "Compliance", href: "/dashboard/quality/compliance" }
    ]
  },
  {
    name: "Academy", icon: GraduationCap, href: "/dashboard/academy",
    children: [
      { name: "Training Courses", href: "/dashboard/academy" },
      { name: "Assignments", href: "/dashboard/academy" },
      { name: "Certificates", href: "/dashboard/academy" }
    ]
  },
  {
    name: "Finance", icon: DollarSign, href: "/dashboard/gl/accountant",
    children: [
      { name: "Accountant Workspace", href: "/dashboard/gl/accountant" },
      { name: "General Ledger", href: "/dashboard/gl" },
      { name: "Invoices", href: "/dashboard/gl/invoices" },
      { name: "Quotes", href: "/dashboard/gl/quotes" },
      { name: "Job Costing", href: "/dashboard/gl/job-costing" },
      { name: "Bid Calculator", href: "/dashboard/bid-calculator" },
      { name: "Payroll", href: "/dashboard/hr/payroll" },
      { name: "Assets", href: "/dashboard/gl/assets" },
      { name: "Subcontractors", href: "/dashboard/subcontractors" },
      { name: "Tax Intel", href: "/dashboard/gl/tax" },
      { name: "Profit AI", href: "/dashboard/profit" }
    ]
  },
  {
    name: "Communications", icon: MessageSquare, href: "/dashboard/communications",
    children: [
      { name: "Timeline", href: "/dashboard/communications" },
      { name: "Meetings", href: "/dashboard/communications/meetings" }
    ]
  },
  {
    name: "Intelligence", icon: Bot, href: "/dashboard/phone-agent",
    children: [
      { name: "AI Dashboard", href: "/dashboard/intelligence" },
      { name: "Phone Agent", href: "/dashboard/phone-agent" },
      { name: "Knowledge Base", href: "/dashboard/knowledge-base" }
    ]
  },
  {
    name: "Security", icon: Lock, href: "/dashboard/security",
    children: [
      { name: "Users & Roles", href: "/dashboard/security" },
      { name: "Audit Logs", href: "/dashboard/security/audit" },
      { name: "Incidents", href: "/dashboard/incidents" }
    ]
  },
  {
    name: "Improvement", icon: BarChart2, href: "/dashboard/improvement",
    children: [
      { name: "KPI Dashboard", href: "/dashboard/improvement" },
      { name: "Audits", href: "/dashboard/improvement/audits" },
      { name: "Non-Conformance", href: "/dashboard/improvement/nonconformance" }
    ]
  },
  {
    name: "Customer", icon: UserCheck, href: "/dashboard/customer",
    children: [
      { name: "Support Hub", href: "/dashboard/customer" }
    ]
  },
  {
    name: "Executive", icon: Briefcase, href: "/dashboard",
    children: [
      { name: "CFO Dashboard", href: "/dashboard" },
      { name: "Procurement Hub", href: "/dashboard/procurement" },
      { name: "Governance", href: "/dashboard/executive/governance" },
      { name: "Management Review", href: "/dashboard/executive/mrb" }
    ]
  },
  {
    name: "Franchise", icon: Network, href: "/dashboard/franchise",
    children: [
      { name: "Locations", href: "/dashboard/franchise" },
      { name: "Compliance", href: "/dashboard/franchise/compliance" },
      { name: "Training", href: "/dashboard/franchise/training" }
    ]
  },
  {
    name: "Settings", icon: Settings2, href: "/dashboard/settings",
    children: [{ name: "System Config", href: "/dashboard/settings" }]
  }
];

export function MobileSidebar({ isOpen, onClose, userRole, onRoleChange, userEmail }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'Dashboard', 'Clients', 'Finance', 'Intelligence'
  ]);

  if (!isOpen) return null;

  const allowedGroups = ROLE_ACCESS[userRole] || ['Dashboard'];
  const filteredNav = navStructure.filter(group =>
    allowedGroups.includes('ALL') || allowedGroups.includes(group.name)
  );

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const handleLinkClick = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">SCOMS 6.1</h2>
              <p className="text-[10px] text-slate-400">Operations OS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Portal Switcher Pills */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2">
          <button
            onClick={() => handleLinkClick('/employee/dashboard')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Field App</span>
          </button>
          <button
            onClick={() => handleLinkClick('/portal/dashboard')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Client Portal</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {filteredNav.map((group) => {
            const isExpanded = expandedMenus.includes(group.name);
            const hasChildren = group.children && group.children.length > 0;
            const isActive = pathname === group.href || (hasChildren && group.children.some(c => pathname === c.href));

            return (
              <div key={group.name} className="mb-0.5">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleMenu(group.name)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "text-blue-600 bg-blue-50/80 font-semibold" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className={clsx(
                        "w-4 h-4",
                        isActive ? "text-blue-600" : "text-slate-400"
                      )} />
                      <span>{group.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleLinkClick(group.href)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      pathname === group.href
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <group.icon className={clsx(
                      "w-4 h-4",
                      pathname === group.href ? "text-white" : "text-slate-400"
                    )} />
                    <span>{group.name}</span>
                  </button>
                )}

                {isExpanded && hasChildren && (
                  <div className="mt-1 mb-1 pl-4 flex flex-col space-y-0.5 border-l-2 border-slate-100 ml-3">
                    {group.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <button
                          key={child.name}
                          onClick={() => handleLinkClick(child.href)}
                          className={clsx(
                            "w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors",
                            isChildActive
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          )}
                        >
                          {child.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 capitalize">
                {userRole.replace(/_/g, ' ')}
              </span>
            </div>
            {userEmail && (
              <span className="text-[11px] text-slate-400 max-w-[120px] truncate">{userEmail}</span>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
