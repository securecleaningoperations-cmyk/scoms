"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Briefcase, FileText, DollarSign, ShieldCheck,
  Calendar, MessageSquare, Lock, TrendingUp, UserCircle, BarChart,
  Building2, Settings, ChevronDown, ChevronRight, Shield, FolderOpen,
  ClipboardList, BarChart2, UserCheck, Network, Settings2, Bot, Activity, GraduationCap
} from "lucide-react";

import clsx from "clsx";

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
    name: "Finance", icon: DollarSign, href: "/dashboard/gl",
    children: [
      { name: "General Ledger", href: "/dashboard/gl" },
      { name: "Invoices", href: "/dashboard/gl/invoices" },
      { name: "Quotes", href: "/dashboard/gl/quotes" },
      { name: "Bid Calculator", href: "/dashboard/bid-calculator" },
      { name: "Payroll", href: "/dashboard/hr/payroll" },
      { name: "Assets", href: "/dashboard/gl/assets" },
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


export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('super_admin');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'Dashboard', 'Clients', 'Finance', 'Intelligence', 'Executive', 'Workforce', 'Documents'
  ]);

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try user metadata first
        let role = user.user_metadata?.role;
        if (!role) {
          const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
          role = data?.role;
        }
        if (role) {
          const normalizedRole = role.toLowerCase().replace(/\s+/g, '_');
          setUserRole(normalizedRole);
        }
      }
    }
    getRole();
  }, []);

  const allowedGroups = ROLE_ACCESS[userRole] || ['Dashboard'];
  const filteredNav = navStructure.filter(group => 
    allowedGroups.includes('ALL') || allowedGroups.includes(group.name)
  );

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  return (
    <div className="w-[260px] bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0 z-10 hidden md:flex font-sans">
      <div className="p-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-slate-900 leading-tight">SCOMS</h1>
          <p className="text-[11px] text-slate-500 font-medium">Secure Cleaning Ops</p>
        </div>
      </div>

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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMenu(group.name);
                    router.push(group.href);
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-150 text-[14px] font-medium group cursor-pointer",
                    isActive ? "text-blue-600 bg-blue-50/70 font-semibold" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <group.icon className={clsx(
                      "w-[18px] h-[18px]",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
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
                <Link
                  href={group.href}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 text-[14px] font-medium group",
                    pathname === group.href
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <group.icon className={clsx(
                    "w-[18px] h-[18px]",
                    pathname === group.href ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  <span>{group.name}</span>
                </Link>
              )}

              {isExpanded && hasChildren && (
                <div className="mt-0.5 mb-1.5 flex flex-col space-y-0.5">
                  {group.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={clsx(
                          "w-full flex items-center pl-10 pr-3 py-1.5 rounded-lg transition-colors duration-150 text-[13px] font-medium",
                          isChildActive
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 mt-auto bg-slate-50">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-[12px] font-semibold text-slate-700 capitalize">Role: {userRole.replace('_', ' ')}</span>
        </div>
        <p className="text-[10px] text-slate-400 px-2 mt-0.5">v6.1 Enterprise • Production</p>
      </div>
    </div>
  );
}
