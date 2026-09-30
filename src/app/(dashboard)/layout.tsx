"use client";

import { Sidebar } from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Menu, Search, Plus, Bell, HelpCircle, MessageSquare, Video,
  User, Users, Briefcase, ExternalLink, LogOut, ChevronDown, X, Command, Shield,
  Target, Building2, ClipboardList, UserPlus,
  DollarSign, AlertTriangle, FileText, CheckCheck, Check,
  CheckCircle2, Clock, Sparkles, ChevronRight, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { QuickCreateModal, type CreateEntityType } from "@/components/QuickCreateModal";

// ── Quick Create Categories ───────────────────────────────────────────

const QUICK_CREATE_CATEGORIES = [
  {
    category: "Commercial & Sales",
    items: [
      { label: "New Lead", type: "lead" as CreateEntityType, icon: Target, desc: "Capture commercial cleaning inquiry" },
      { label: "New Client", type: "client" as CreateEntityType, icon: Building2, desc: "Onboard facility account" },
    ],
  },
  {
    category: "Field Operations",
    items: [
      { label: "New Job", type: "job" as CreateEntityType, icon: ClipboardList, desc: "Schedule or dispatch service work order" },
      { label: "New Document", type: "document" as CreateEntityType, icon: FileText, desc: "Contract, SOP, or official record" },
    ],
  },
  {
    category: "Workforce & Finance",
    items: [
      { label: "New Employee", type: "employee" as CreateEntityType, icon: UserPlus, desc: "Enroll cleaning technician or supervisor" },
      { label: "New Invoice", type: "invoice" as CreateEntityType, icon: DollarSign, desc: "Issue accounts receivable billing" },
    ],
  },
  {
    category: "Quality & Safety",
    items: [
      { label: "New Incident / Issue", type: "incident" as CreateEntityType, icon: AlertTriangle, desc: "Log safety deficiency or CAPA" },
    ],
  },
];

// ── Search Modal (CMD+K) ───────────────────────────────────────────────

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  const SEARCH_SECTIONS = [
    {
      title: "Pages",
      items: [
        { label: "Executive Dashboard", href: "/dashboard" },
        { label: "Operations", href: "/dashboard/operations" },
        { label: "Employees", href: "/dashboard/hr" },
        { label: "Clients", href: "/dashboard/clients" },
        { label: "Jobs", href: "/dashboard/jobs" },
        { label: "Leads", href: "/dashboard/leads" },
        { label: "Schedule", href: "/dashboard/scheduling" },
        { label: "General Ledger", href: "/dashboard/gl" },
        { label: "Invoices", href: "/dashboard/gl/invoices" },
        { label: "Quality", href: "/dashboard/quality" },
        { label: "CAPA", href: "/dashboard/quality/capa" },
        { label: "Documents", href: "/dashboard/documents" },
        { label: "Academy", href: "/dashboard/academy" },
        { label: "Communications", href: "/dashboard/communications" },
        { label: "AI Intelligence", href: "/dashboard/intelligence" },
        { label: "Phone Agent", href: "/dashboard/phone-agent" },
        { label: "Settings", href: "/dashboard/settings" },
        { label: "Security", href: "/dashboard/security" },
        { label: "Audit Logs", href: "/dashboard/security/audit" },
        { label: "Franchise", href: "/dashboard/franchise" },
        { label: "Procurement", href: "/dashboard/procurement" },
        { label: "Incidents", href: "/dashboard/incidents" },
      ],
    },
  ];

  const filteredSections = SEARCH_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((i) =>
      i.label.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  if (!open) return null;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-xl shadow-overlay w-full max-w-lg flex flex-col max-h-[70vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search pages, entities, commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-body text-text-primary outline-none placeholder:text-text-muted"
          />
          <kbd className="text-caption text-text-muted bg-bg-inset rounded px-1.5 py-0.5 border border-border-light font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 py-2">
          {filteredSections.length === 0 ? (
            <div className="px-4 py-6 text-center text-body-sm text-text-muted">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.title}>
                <p className="px-4 py-1 text-caption text-text-muted font-medium uppercase tracking-wider">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-body-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors text-left"
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Quick Create Dropdown (Solid Background, Zero Bleed-Through) ────────

function QuickCreateMenu({
  open,
  onClose,
  onSelectEntity,
}: {
  open: boolean;
  onClose: () => void;
  onSelectEntity: (type: CreateEntityType) => void;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 w-80 p-3 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider">
            Quick Action Center
          </p>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
            Create In-Place
          </span>
        </div>
        <div className="space-y-3 py-1">
          {QUICK_CREATE_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <p className="px-3 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {cat.category}
              </p>
              <div className="space-y-1 mt-1">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        onSelectEntity(item.type);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 truncate">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Notification Bell ──────────────────────────────────────────────────

interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  category: "operations" | "sales" | "compliance" | "finance";
  priority: "urgent" | "important" | "normal";
  time: string;
  read: boolean;
  href: string;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<PlatformNotification[]>([
    {
      id: "notif-1",
      title: "New Commercial Proposal Generated",
      message: "Proposal PROP-TX4410 sent for Apex Logistics Tech Campus ($4,950/mo Platinum tier).",
      category: "sales",
      priority: "important",
      time: "10m ago",
      read: false,
      href: "/dashboard/clients/proposals"
    },
    {
      id: "notif-2",
      title: "Dispatch Route #2 Dispatched",
      message: "4 Cleanroom suites scheduled and dispatched to Field Lead Marcus Vance.",
      category: "operations",
      priority: "normal",
      time: "42m ago",
      read: false,
      href: "/dashboard/scheduling/dispatch"
    },
    {
      id: "notif-3",
      title: "OSHA & Brand Compliance Audit Passed",
      message: "Dallas Metro Franchise Hub achieved 99.1% standards certification score.",
      category: "compliance",
      priority: "important",
      time: "2h ago",
      read: false,
      href: "/dashboard/franchise/compliance"
    },
    {
      id: "notif-4",
      title: "Active CAPA Remediated",
      message: "Corrective action CAPA-2026-079 resolved for North Texas Freight Terminal.",
      category: "operations",
      priority: "normal",
      time: "5h ago",
      read: true,
      href: "/dashboard/improvement"
    },
    {
      id: "notif-5",
      title: "Invoice #INV-TX901 Reconciled",
      message: "Accounts Receivable confirmed ACH deposit of $5,800 from Metro Healthcare Network.",
      category: "finance",
      priority: "normal",
      time: "1d ago",
      read: true,
      href: "/dashboard/gl/invoices"
    }
  ]);

  // Listen for newly created entities across the app and append notifications
  useEffect(() => {
    const handleEntityCreated = (event: any) => {
      const { type, entity } = event.detail || {};
      const newNotif: PlatformNotification = {
        id: `notif-${Date.now()}`,
        title: `New ${type ? String(type).toUpperCase() : 'Record'} Created`,
        message: `${entity?.name || entity?.company_name || entity?.title || entity?.first_name || 'Item'} was registered in platform.`,
        category: type === 'invoice' ? 'finance' : type === 'lead' || type === 'client' ? 'sales' : 'operations',
        priority: 'important',
        time: 'Just now',
        read: false,
        href: type === 'lead' ? '/dashboard/leads' : type === 'client' ? '/dashboard/clients' : type === 'job' ? '/dashboard/jobs' : type === 'invoice' ? '/dashboard/gl/invoices' : '/dashboard'
      };
      setNotifications(prev => [newNotif, ...prev]);
    };

    window.addEventListener("scoms-entity-created", handleEntityCreated);
    return () => window.removeEventListener("scoms-entity-created", handleEntityCreated);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markItemRead = (id: string, href: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setOpen(false);
    router.push(href);
  };

  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute 0 top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 w-84 sm:w-96 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Operational Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setOpen(false)} 
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Sub-Bar */}
            <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${filter === "all" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${filter === "unread" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="font-medium text-xs">No notifications in this view</p>
                </div>
              ) : (
                filtered.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markItemRead(n.id, n.href)}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                      n.priority === 'urgent' ? 'bg-red-50 text-red-600 border border-red-100' :
                      n.category === 'sales' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      n.category === 'finance' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      n.category === 'compliance' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {n.category === 'finance' ? <DollarSign className="w-3.5 h-3.5" /> :
                       n.category === 'sales' ? <FileText className="w-3.5 h-3.5" /> :
                       n.category === 'compliance' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                       <ClipboardList className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs ${!n.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'} truncate`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>

                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <Link 
                href="/dashboard/communications" 
                onClick={() => setOpen(false)}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Communications Log
              </Link>
              <span className="text-slate-400 text-[11px]">Dispatch System Online</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── User Menu with 4-Role Persona Switcher & Employee ID Tag ───────────

function UserMenu() {
  const { user, activeRole, setActiveRole, signOut, loginAsUser } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName}`
    : user?.email
    ? user.email.split("@")[0]
    : "David Vance";

  const employeeId = user?.employeeId || (
    activeRole === "super_admin" ? "EMP-0001" :
    activeRole === "operations_manager" ? "EMP-1042" :
    activeRole === "supervisor" ? "EMP-2015" :
    activeRole === "field_employee" ? "EMP-3015" :
    activeRole === "client_admin" || activeRole === "client_user" ? "CLI-8092" : "EMP-5000"
  );

  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "DV";

  // Pre-configured 4 Primary Roles for 1-Click Persona Testing
  const CORE_ROLES = [
    {
      id: "super_admin",
      title: "Super Admin (Owner)",
      name: "David Vance",
      empId: "EMP-0001",
      email: "admin@securecleaningoperations.com",
      role: "super_admin" as const,
      color: "border-blue-500 bg-blue-50 text-blue-700"
    },
    {
      id: "client_admin",
      title: "Company / Commercial Client",
      name: "Apex Logistics Facilities",
      empId: "CLI-8092",
      email: "client@apexlogistics.com",
      role: "client_admin" as const,
      color: "border-emerald-500 bg-emerald-50 text-emerald-700"
    },
    {
      id: "operations_manager",
      title: "Operations Manager / Supervisor",
      name: "Marcus Vance",
      empId: "EMP-1042",
      email: "marcus.ops@securecleaningoperations.com",
      role: "operations_manager" as const,
      color: "border-purple-500 bg-purple-50 text-purple-700"
    },
    {
      id: "field_employee",
      title: "Lead Cleaner / Field Tech",
      name: "Carlos Rodriguez",
      empId: "EMP-3015",
      email: "carlos.cleaner@securecleaningoperations.com",
      role: "field_employee" as const,
      color: "border-amber-500 bg-amber-50 text-amber-700"
    }
  ];

  const handleSwitchPersona = (target: typeof CORE_ROLES[0]) => {
    loginAsUser({
      id: `usr-${target.empId.toLowerCase()}`,
      email: target.email,
      firstName: target.name.split(" ")[0],
      lastName: target.name.split(" ").slice(1).join(" ") || "",
      role: target.role,
      employeeId: target.empId,
      username: `@${target.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}`,
      department: target.title
    });
    setOpen(false);
    if (target.role === "client_admin") {
      router.push("/portal/dashboard");
    } else if (target.role === "field_employee") {
      router.push("/employee/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative">
      {/* Top Header Logged In Indicator */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        title="Account & Role Switcher"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
          {initials}
        </div>

        <div className="hidden lg:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
              {displayName}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-semibold truncate">
            {employeeId} • {activeRole.replace(/_/g, " ")}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 w-80 p-3 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/10">
            
            {/* Active User Header */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50 mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  {employeeId}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active Session
                </span>
              </div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || "admin@securecleaningoperations.com"}</p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1">
                Role: {activeRole.replace(/_/g, " ")}
              </p>
            </div>

            {/* 4 Core Roles Switcher */}
            <div className="mb-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                Switch Role / Persona (4 Core Tiers)
              </p>
              <div className="space-y-1">
                {CORE_ROLES.map((r) => {
                  const isCurrent = activeRole === r.role;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSwitchPersona(r)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition border ${
                        isCurrent
                          ? "bg-blue-50 border-blue-200 text-blue-900 font-bold"
                          : "hover:bg-slate-50 border-transparent text-slate-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{r.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {r.empId} • {r.name}
                        </p>
                      </div>
                      {isCurrent && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Shortcuts */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-0.5 text-xs">
              <Link
                href="/dashboard/communications/chat"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Team Chat (WhatsApp Style)</span>
              </Link>
              <Link
                href="/dashboard/communications/meetings"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Video Meetings Console</span>
              </Link>
              <Link
                href="/employee/dashboard"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Cleaner Field Mobile App</span>
              </Link>
              <Link
                href="/portal/dashboard"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer Client Portal</span>
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors w-full text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Platform</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Mobile Sidebar ─────────────────────────────────────────────────────

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="overlay-backdrop md:hidden animate-fade-in z-50" onClick={onClose}>
      <div
        className="fixed inset-y-0 left-0 w-[280px] bg-surface shadow-overlay flex flex-col animate-slide-in-left z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-text-primary text-body-sm block leading-tight">SCOMS</span>
              <span className="text-[10px] text-text-muted">Enterprise Platform</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar isMobile={true} onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

// ── Inner Layout (needs auth context) ──────────────────────────────────

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<CreateEntityType>("lead");

  // CMD+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuickCreateOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-caption font-medium text-text-muted uppercase tracking-wider">Loading SCOMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <div className="flex w-full h-full shadow-overlay overflow-hidden bg-surface/60 backdrop-blur-3xl border border-border">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 h-14 bg-surface/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 gap-3 z-20 sticky top-0">
          {/* Left */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors bg-bg-inset"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-body-sm">Search...</span>
              <kbd className="text-caption bg-surface rounded px-1 py-0.5 border border-border-light font-mono ml-4">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            {/* Quick Create */}
            <div className="relative">
              <button
                onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Create</span>
              </button>
              <QuickCreateMenu
                open={quickCreateOpen}
                onClose={() => setQuickCreateOpen(false)}
                onSelectEntity={(type) => {
                  setCreateModalType(type);
                  setCreateModalOpen(true);
                }}
              />
            </div>

            {/* Team Chat (WhatsApp Style) */}
            <Link
              href="/dashboard/communications/chat"
              className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              title="Team Chat (WhatsApp Style)"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                2
              </span>
            </Link>

            {/* Video Meetings Console */}
            <Link
              href="/dashboard/communications/meetings"
              className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              title="Video Meetings & Hall"
            >
              <Video className="w-4 h-4" />
            </Link>

            <NotificationBell />
            
            <div className="w-px h-6 bg-border mx-1" />

            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1500px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Universal In-Place Quick Create Modal */}
      <QuickCreateModal
        open={createModalOpen}
        initialType={createModalType}
        onClose={() => setCreateModalOpen(false)}
      />
      </div>
    </div>
  );
}

// ── Export Layout ──────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
