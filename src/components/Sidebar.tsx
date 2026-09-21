"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { usePermissions } from "@/lib/auth/AuthProvider";
import clsx from "clsx";
import {
  LayoutDashboard, Briefcase, ClipboardList, Calendar, MapPin,
  UserCheck, Clock, CheckSquare, AlertTriangle, ShieldAlert,
  Users, UserPlus, CalendarOff, Award, GraduationCap,
  Building2, Target, FileText, Handshake, Star,
  DollarSign, Receipt, CreditCard, Wallet, PieChart,
  Package, Truck, Beaker, HardHat, Wrench,
  ShieldCheck, FileSearch, Scale, AlertCircle,
  BookOpen, ClipboardCheck,
  FolderOpen, FilePlus, FileSignature,
  MessageSquare, Phone, Video, Bell,
  Bot, Sparkles, PhoneCall, Brain,
  Globe, Network, MapPinned,
  BarChart3, TrendingUp, Activity,
  Settings, Lock, Users2, Workflow, Plug,
  ChevronDown, ChevronRight, Shield,
  PanelLeftClose, PanelLeft
} from "lucide-react";

// ── Navigation Structure (per spec section 8) ──────────────────────────

interface NavChild {
  label: string;
  href: string;
  icon?: React.ElementType;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children: NavChild[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "Overview",
    label: "Overview",
    icon: LayoutDashboard,
    children: [
      { label: "Executive Dashboard", href: "/dashboard" },
      { label: "Operations Dashboard", href: "/dashboard/operations" },
    ],
  },
  {
    id: "Operations",
    label: "Operations",
    icon: ClipboardList,
    children: [
      { label: "Jobs", href: "/dashboard/jobs" },
      { label: "Schedule", href: "/dashboard/scheduling" },
      { label: "Dispatch", href: "/dashboard/scheduling/dispatch" },
      { label: "Route Planning", href: "/dashboard/scheduling/routes" },
      { label: "Inspections", href: "/dashboard/quality" },
      { label: "Issues", href: "/dashboard/incidents" },
    ],
  },
  {
    id: "Workforce",
    label: "Workforce",
    icon: Users,
    children: [
      { label: "Employees", href: "/dashboard/hr" },
      { label: "Recruiting", href: "/dashboard/hr/recruiting" },
      { label: "Certifications", href: "/dashboard/hr/certifications" },
      { label: "Performance", href: "/dashboard/hr/performance" },
      { label: "Payroll", href: "/dashboard/hr/payroll" },
      { label: "Training", href: "/dashboard/hr/training" },
    ],
  },
  {
    id: "Clients & Sales",
    label: "Clients & Sales",
    icon: Building2,
    children: [
      { label: "Clients", href: "/dashboard/clients" },
      { label: "Leads", href: "/dashboard/leads" },
      { label: "Walkthroughs", href: "/dashboard/walkthroughs" },
      { label: "Proposals", href: "/dashboard/clients/proposals" },
      { label: "Contracts", href: "/dashboard/clients/contracts" },
    ],
  },
  {
    id: "Finance",
    label: "Finance",
    icon: DollarSign,
    children: [
      { label: "Accountant", href: "/dashboard/gl/accountant" },
      { label: "General Ledger", href: "/dashboard/gl" },
      { label: "Invoices", href: "/dashboard/gl/invoices" },
      { label: "Quotes", href: "/dashboard/gl/quotes" },
      { label: "Job Costing", href: "/dashboard/gl/job-costing" },
      { label: "Bid Calculator", href: "/dashboard/bid-calculator" },
      { label: "Assets", href: "/dashboard/gl/assets" },
      { label: "Tax", href: "/dashboard/gl/tax" },
    ],
  },
  {
    id: "Procurement & Inventory",
    label: "Procurement",
    icon: Package,
    children: [
      { label: "Procurement Hub", href: "/dashboard/procurement" },
      { label: "Supply Management", href: "/dashboard/supply-management" },
      { label: "Subcontractors", href: "/dashboard/subcontractors" },
    ],
  },
  {
    id: "Quality & Compliance",
    label: "Quality & Compliance",
    icon: ShieldCheck,
    children: [
      { label: "QA Inspections", href: "/dashboard/quality" },
      { label: "CAPA", href: "/dashboard/quality/capa" },
      { label: "Compliance", href: "/dashboard/quality/compliance" },
      { label: "Incidents", href: "/dashboard/incidents" },
      { label: "Improvement", href: "/dashboard/improvement" },
      { label: "Audits", href: "/dashboard/improvement/audits" },
    ],
  },
  {
    id: "Academy",
    label: "Academy",
    icon: GraduationCap,
    children: [
      { label: "Training Dashboard", href: "/dashboard/academy" },
      { label: "Courses", href: "/dashboard/hr/training" },
    ],
  },
  {
    id: "Documents",
    label: "Documents",
    icon: FolderOpen,
    children: [
      { label: "Document Center", href: "/dashboard/documents" },
      { label: "SOPs", href: "/dashboard/sops" },
    ],
  },
  {
    id: "Communications",
    label: "Communications",
    icon: MessageSquare,
    children: [
      { label: "Timeline", href: "/dashboard/communications" },
      { label: "Meetings", href: "/dashboard/communications/meetings" },
    ],
  },
  {
    id: "AI",
    label: "AI & Intelligence",
    icon: Bot,
    children: [
      { label: "AI Dashboard", href: "/dashboard/intelligence" },
      { label: "Phone Agent", href: "/dashboard/phone-agent" },
      { label: "Knowledge Base", href: "/dashboard/knowledge-base" },
    ],
  },
  {
    id: "Organization",
    label: "Organization",
    icon: Network,
    children: [
      { label: "Franchise", href: "/dashboard/franchise" },
      { label: "Compliance", href: "/dashboard/franchise/compliance" },
    ],
  },
  {
    id: "Analytics",
    label: "Analytics",
    icon: BarChart3,
    children: [
      { label: "KPI Dashboard", href: "/dashboard/improvement" },
      { label: "Profit Analysis", href: "/dashboard/profit" },
    ],
  },
  {
    id: "Administration",
    label: "Administration",
    icon: Settings,
    children: [
      { label: "Users & Roles", href: "/dashboard/security" },
      { label: "Audit Logs", href: "/dashboard/security/audit" },
      { label: "Settings", href: "/dashboard/settings" },
    ],
  },
];

// ── Sidebar Component ──────────────────────────────────────────────────

export function Sidebar({
  isMobile = false,
  onNavigate,
}: {
  isMobile?: boolean;
  onNavigate?: () => void;
} = {}) {
  const pathname = usePathname();
  const { canAccessGroup } = usePermissions();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Auto-expand the group that contains the current path
    const initial = new Set<string>();
    for (const group of NAV_GROUPS) {
      if (group.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))) {
        initial.add(group.id);
      }
    }
    if (initial.size === 0) initial.add("Overview");
    return initial;
  });

  const filteredGroups = useMemo(
    () => NAV_GROUPS.filter((g) => canAccessGroup(g.id)),
    [canAccessGroup]
  );

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isChildActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={clsx(
        isMobile
          ? "flex flex-col h-full w-full bg-surface"
          : "hidden md:flex flex-col h-screen border-r border-border bg-surface flex-shrink-0 transition-all duration-200 z-20",
        !isMobile && (collapsed ? "w-[56px]" : "w-[240px]")
      )}
    >
      {/* Brand */}
      <div className={clsx(
        "flex items-center h-14 border-b border-border flex-shrink-0",
        collapsed ? "justify-center px-2" : "px-4 gap-2.5"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white flex-shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-body-sm font-semibold text-text-primary leading-tight truncate">SCOMS</p>
            <p className="text-caption text-text-muted leading-tight">Enterprise Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2">
        {filteredGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const hasActiveChild = group.children.some((c) => isChildActive(c.href));
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="mb-0.5">
              {collapsed ? (
                /* Collapsed: just icon, link to first child */
                <Link
                  href={group.children[0]?.href || "/dashboard"}
                  className={clsx(
                    "flex items-center justify-center w-full h-9 rounded-md transition-colors",
                    hasActiveChild
                      ? "bg-primary-50 text-primary-600"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                  )}
                  title={group.label}
                >
                  <GroupIcon className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={clsx(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-body-sm",
                      hasActiveChild
                        ? "text-primary-600 font-medium"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    )}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <GroupIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{group.label}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-text-muted flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-text-muted flex-shrink-0" />
                    )}
                  </button>

                  {/* Children */}
                  {isExpanded && (
                    <div className="mt-0.5 mb-1">
                      {group.children.map((child) => {
                        const active = isChildActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onNavigate}
                            className={clsx(
                              "flex items-center pl-9 pr-2.5 py-1.5 rounded-md transition-colors text-body-sm",
                              active
                                ? "bg-primary-50 text-primary-700 font-medium"
                                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                            )}
                          >
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!isMobile && (
        <div className="border-t border-border p-2 flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
