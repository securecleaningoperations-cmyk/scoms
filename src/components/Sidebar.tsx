"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth, usePermissions, type ScomsRole } from "@/lib/auth/AuthProvider";
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
  PanelLeftClose, PanelLeft, Filter, Check, Eye,
  SlidersHorizontal, GripVertical
} from "lucide-react";

// ── Role Presets & Specific Options ─────────────────────────────────────

interface RolePreset {
  id: ScomsRole;
  name: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
  quickLinks: { label: string; href: string }[];
}

const ROLE_PRESETS: RolePreset[] = [
  {
    id: "super_admin",
    name: "Super Admin (Owner)",
    badge: "Platform Master",
    icon: "👑",
    color: "bg-blue-600 text-white",
    description: "Full enterprise command over all 14 operational engines & security",
    quickLinks: [
      { label: "Executive Radar", href: "/dashboard" },
      { label: "Users & RBAC", href: "/dashboard/security" },
      { label: "Audit Logs", href: "/dashboard/security/audit" },
    ],
  },
  {
    id: "operations_manager",
    name: "Operations Manager",
    badge: "Field Operations",
    icon: "🛠️",
    color: "bg-indigo-600 text-white",
    description: "Dispatch, scheduling, GPS telemetry, jobs & QA audits",
    quickLinks: [
      { label: "Live Dispatch", href: "/dashboard/scheduling/dispatch" },
      { label: "Schedule Grid", href: "/dashboard/scheduling" },
      { label: "Fleet Telemetry", href: "/dashboard/scheduling/routes" },
    ],
  },
  {
    id: "field_employee",
    name: "Field Cleaner / Technician",
    badge: "Field Crew",
    icon: "🧹",
    color: "bg-emerald-600 text-white",
    description: "Work orders, mobile checklists, training courses & SOPs",
    quickLinks: [
      { label: "My Work Orders", href: "/dashboard/jobs" },
      { label: "QA Checklists", href: "/dashboard/quality" },
      { label: "Safety Issues", href: "/dashboard/incidents" },
      { label: "SOP Training", href: "/dashboard/academy" },
    ],
  },
  {
    id: "hr_manager",
    name: "HR & Workforce Director",
    badge: "Human Resources",
    icon: "👥",
    color: "bg-purple-600 text-white",
    description: "Staff directory, recruiting pipeline, payroll runs & OSHA training",
    quickLinks: [
      { label: "Employee Directory", href: "/dashboard/hr" },
      { label: "Recruiting Pipeline", href: "/dashboard/hr/recruiting" },
      { label: "Payroll Run", href: "/dashboard/hr/payroll" },
    ],
  },
  {
    id: "finance_admin",
    name: "Finance & Accounting",
    badge: "CFO / Accounting",
    icon: "💰",
    color: "bg-amber-600 text-white",
    description: "General ledger, customer invoicing, job costing, and bid calculator",
    quickLinks: [
      { label: "General Ledger", href: "/dashboard/gl" },
      { label: "Invoices", href: "/dashboard/gl/invoices" },
      { label: "Bid Calculator", href: "/dashboard/bid-calculator" },
    ],
  },
  {
    id: "quality_manager",
    name: "Quality & Compliance Auditor",
    badge: "Audits & QA",
    icon: "🛡️",
    color: "bg-teal-600 text-white",
    description: "Facility hygiene scores, CAPA nonconformance & ISO standards",
    quickLinks: [
      { label: "QA Inspections", href: "/dashboard/quality" },
      { label: "Six Sigma CAPA", href: "/dashboard/improvement" },
      { label: "Safety Incidents", href: "/dashboard/incidents" },
    ],
  },
  {
    id: "sales_manager",
    name: "Commercial Sales Director",
    badge: "Sales & CRM",
    icon: "💼",
    color: "bg-rose-600 text-white",
    description: "Commercial pipeline, 3-tier proposals, facility walkthroughs & contracts",
    quickLinks: [
      { label: "Lead Pipeline", href: "/dashboard/leads" },
      { label: "Walkthroughs", href: "/dashboard/walkthroughs" },
      { label: "Proposals", href: "/dashboard/clients/proposals" },
    ],
  },
  {
    id: "franchise_admin",
    name: "Franchise Administrator",
    badge: "Franchise Hub",
    icon: "🌐",
    color: "bg-cyan-600 text-white",
    description: "Multi-location hubs, brand livery compliance & royalty settlement",
    quickLinks: [
      { label: "Franchise Hubs", href: "/dashboard/franchise" },
      { label: "Franchise Audits", href: "/dashboard/franchise/compliance" },
      { label: "P&L Analysis", href: "/dashboard/profit" },
    ],
  },
];

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

// ── Sidebar Component with Drag Resizing & Role Customizer ───────────────

export function Sidebar({
  isMobile = false,
  onNavigate,
}: {
  isMobile?: boolean;
  onNavigate?: () => void;
} = {}) {
  const pathname = usePathname();
  const { activeRole, setActiveRole } = useAuth();
  const { canAccessGroup } = usePermissions();

  // Width & Resizing State
  const [width, setWidth] = useState<number>(260);
  const [isResizing, setIsResizing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [filterByRole, setFilterByRole] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Restore saved width from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWidth = localStorage.getItem("scoms_sidebar_width");
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (parsed >= 200 && parsed <= 420) {
          setWidth(parsed);
        }
      }
    }
  }, []);

  // Close role selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    if (showRoleMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRoleMenu]);

  // Drag-to-resize listener on window
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(420, Math.max(200, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("scoms_sidebar_width", String(width));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, width]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const resetWidth = () => {
    setWidth(260);
    if (typeof window !== "undefined") {
      localStorage.setItem("scoms_sidebar_width", "260");
    }
  };

  const currentRolePreset = useMemo(
    () => ROLE_PRESETS.find((r) => r.id === activeRole) || ROLE_PRESETS[0],
    [activeRole]
  );

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const group of NAV_GROUPS) {
      if (group.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))) {
        initial.add(group.id);
      }
    }
    if (initial.size === 0) initial.add("Overview");
    return initial;
  });

  // Filter groups depending on role and filterByRole toggle
  const filteredGroups = useMemo(() => {
    if (!filterByRole || activeRole === "super_admin") {
      return NAV_GROUPS.filter((g) => canAccessGroup(g.id));
    }
    return NAV_GROUPS.filter((g) => canAccessGroup(g.id));
  }, [canAccessGroup, filterByRole, activeRole]);

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

  const actualWidth = isMobile ? "100%" : collapsed ? 64 : width;

  return (
    <aside
      style={{
        width: actualWidth,
        minWidth: isMobile ? undefined : collapsed ? 64 : width,
        maxWidth: isMobile ? undefined : collapsed ? 64 : width,
        transition: isResizing ? "none" : "width 180ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={clsx(
        "select-none relative flex flex-col h-screen border-r border-border bg-surface flex-shrink-0 z-20",
        isMobile && "h-full w-full"
      )}
    >
      {/* Brand & Platform Header */}
      <div
        className={clsx(
          "flex items-center h-14 border-b border-border flex-shrink-0 bg-surface",
          collapsed ? "justify-center px-2" : "px-3.5 gap-2.5"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
          <Shield className="w-4 h-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 flex items-center justify-between">
            <div className="truncate">
              <p className="text-body-sm font-bold text-text-primary leading-tight truncate">
                SCOMS v4.0
              </p>
              <p className="text-[11px] text-text-muted leading-tight font-mono truncate">
                Secure Cleaning Ops
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Role Switcher & Role-Specific Options Strip */}
      {!collapsed && (
        <div className="p-2 border-b border-slate-200 bg-slate-50/70" ref={roleMenuRef}>
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu((prev) => !prev)}
              className="w-full flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-all text-left"
              title="Switch role view to see specific options for other roles"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{currentRolePreset.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {currentRolePreset.name}
                  </p>
                  <p className="text-[10px] text-blue-600 font-semibold truncate">
                    {currentRolePreset.badge}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Role Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-1.5 max-h-[360px] overflow-y-auto space-y-1 animate-scale-in">
                <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Role-Specific Views
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">8 Roles</span>
                </div>

                {ROLE_PRESETS.map((rp) => (
                  <button
                    key={rp.id}
                    onClick={() => {
                      setActiveRole(rp.id);
                      setShowRoleMenu(false);
                    }}
                    className={clsx(
                      "w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors",
                      activeRole === rp.id
                        ? "bg-blue-50 border border-blue-200 text-blue-900"
                        : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{rp.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{rp.name}</span>
                        {activeRole === rp.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        {rp.description}
                      </p>
                    </div>
                  </button>
                ))}

                {/* Filter Toggle */}
                <div className="pt-2 border-t border-slate-100 px-2 py-1 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Role Filter Only</span>
                  <input
                    type="checkbox"
                    checked={filterByRole}
                    onChange={(e) => setFilterByRole(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Shortcuts for Selected Role */}
          <div className="mt-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {currentRolePreset.quickLinks.map((ql) => (
              <Link
                key={ql.href}
                href={ql.href}
                onClick={onNavigate}
                className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors shrink-0 truncate"
              >
                {ql.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Groups List */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2 space-y-0.5">
        {filteredGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const hasActiveChild = group.children.some((c) => isChildActive(c.href));
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="mb-0.5">
              {collapsed ? (
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
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={clsx(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-body-sm",
                      hasActiveChild
                        ? "text-blue-600 font-semibold"
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

                  {isExpanded && (
                    <div className="mt-0.5 mb-1 space-y-0.5">
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
                                ? "bg-blue-50 text-blue-700 font-bold"
                                : "text-text-muted hover:text-text-primary hover:bg-surface-hover font-medium"
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

      {/* Footer & Collapse Bar */}
      {!isMobile && (
        <div className="border-t border-border p-2 flex-shrink-0 flex items-center justify-between bg-surface">
          {!collapsed ? (
            <span className="text-[10px] text-slate-400 font-mono px-2">
              Width: {width}px
            </span>
          ) : null}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors ml-auto"
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

      {/* Interactive Drag Resize Handle (Desktop Only) */}
      {!isMobile && !collapsed && (
        <div
          onMouseDown={startResizing}
          onDoubleClick={resetWidth}
          className={clsx(
            "absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/60 active:bg-blue-600 transition-colors group z-30 select-none",
            isResizing && "bg-blue-600 w-2"
          )}
          title="Drag to resize sidebar • Double-click to reset"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-10 -mr-1 rounded bg-slate-400/80 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity shadow-sm">
            <GripVertical className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </aside>
  );
}
