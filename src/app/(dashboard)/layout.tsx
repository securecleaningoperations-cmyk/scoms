"use client";

import { Sidebar } from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Menu, Search, Plus, Bell, HelpCircle,
  User, LogOut, ChevronDown, X, Command, Shield,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

// ── Quick Create Items ─────────────────────────────────────────────────

const QUICK_CREATE_ITEMS = [
  { label: "New Client", href: "/dashboard/clients", icon: "🏢" },
  { label: "New Lead", href: "/dashboard/leads", icon: "🎯" },
  { label: "New Job", href: "/dashboard/jobs", icon: "📋" },
  { label: "New Employee", href: "/dashboard/hr", icon: "👤" },
  { label: "New Invoice", href: "/dashboard/gl/invoices", icon: "💰" },
  { label: "New Incident", href: "/dashboard/incidents", icon: "⚠️" },
  { label: "New Document", href: "/dashboard/documents", icon: "📄" },
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

// ── Quick Create Dropdown ──────────────────────────────────────────────

function QuickCreateMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 w-56 py-1">
        <p className="px-3 py-1.5 text-caption text-text-muted font-medium uppercase tracking-wider border-b border-border-light mb-1">
          Quick Create
        </p>
        {QUICK_CREATE_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              router.push(item.href);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-body-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors text-left"
          >
            <span className="text-sm">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ── Notification Bell ──────────────────────────────────────────────────

function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 w-80">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-body-sm font-medium text-text-primary">Notifications</h3>
              <button className="text-caption text-text-link hover:underline">Mark all read</button>
            </div>
            <div className="py-6 text-center text-body-sm text-text-muted">
              <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No new notifications
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── User Menu ──────────────────────────────────────────────────────────

function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || user.email.charAt(0)}`.toUpperCase()
    : "U";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-surface-hover transition-colors"
      >
        <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white text-caption font-semibold">
          {initials}
        </div>
        <ChevronDown className="w-3 h-3 text-text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 w-56 py-1">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-border-light">
              <p className="text-body-sm font-medium text-text-primary truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
              </p>
              <p className="text-caption text-text-muted capitalize">{user?.role?.replace(/_/g, " ")}</p>
            </div>

            {/* Links */}
            <div className="py-1">
              <Link
                href="/employee/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-body-sm text-text-secondary hover:bg-surface-hover transition-colors"
                onClick={() => setOpen(false)}
              >
                <User className="w-3.5 h-3.5" />
                Field Mobile App
              </Link>
              <Link
                href="/portal/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-body-sm text-text-secondary hover:bg-surface-hover transition-colors"
                onClick={() => setOpen(false)}
              >
                <User className="w-3.5 h-3.5" />
                Client Portal
              </Link>
            </div>

            <div className="border-t border-border-light py-1">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-body-sm text-danger-600 hover:bg-danger-50 transition-colors w-full text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
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
    <div className="flex h-screen overflow-hidden bg-bg-primary">
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
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create</span>
              </button>
              <QuickCreateMenu open={quickCreateOpen} onClose={() => setQuickCreateOpen(false)} />
            </div>

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
