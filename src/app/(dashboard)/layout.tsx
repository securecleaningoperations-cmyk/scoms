"use client";

import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Menu, Shield, Smartphone, ExternalLink, ChevronDown, 
  UserCheck, Briefcase, DollarSign, Calendar, Users
} from "lucide-react";
import Link from "next/link";

const ROLES = [
  { id: "super_admin", label: "Super Admin (Full Access)" },
  { id: "executive", label: "Executive / CFO" },
  { id: "operations_manager", label: "Operations Manager" },
  { id: "supervisor", label: "Field Supervisor" },
  { id: "finance_admin", label: "Finance & Accounting" },
  { id: "hr_manager", label: "HR & Workforce" },
  { id: "compliance_officer", label: "Compliance & Safety" },
  { id: "quality_manager", label: "Quality Assurance" },
  { id: "franchise_admin", label: "Franchise Owner" },
  { id: "vendor_manager", label: "Subcontractor / Vendor" },
  { id: "field_employee", label: "Cleaning Specialist (Field App)" },
  { id: "client_admin", label: "Client Portal User" }
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('super_admin');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        setUserEmail(session.user.email ?? '');

        // Fetch user profile role or metadata
        let role = session.user.user_metadata?.role;
        if (!role) {
          const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
          role = data?.role;
        }
        if (role) {
          setUserRole(role.toLowerCase().replace(/\s+/g, '_'));
        }
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        setUserEmail(session.user.email ?? '');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading SCOMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSwitchRole = (newRole: string) => {
    setUserRole(newRole);
    setRoleDropdownOpen(false);
    if (newRole === 'field_employee') {
      router.push('/employee/dashboard');
    } else if (newRole === 'client_admin') {
      router.push('/portal/dashboard');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userRole={userRole}
        userEmail={userEmail}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 gap-3 z-20 shadow-xs">
          
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">SCOMS 6.1</span>
            </div>

            {/* Quick Portals Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 pl-2">
              <Link
                href="/employee/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                title="Open Mobile Field Cleaning App"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Field Mobile App</span>
              </Link>
              <Link
                href="/portal/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                title="Open Customer Self-Service Portal"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Client Portal</span>
              </Link>
            </div>
          </div>

          {/* Right: Role Switcher, Notifications, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Dynamic Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200/60"
                title="Switch role view"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="capitalize font-semibold max-w-[110px] sm:max-w-none truncate">
                  Role: {userRole.replace(/_/g, ' ')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Simulate / Test Role Access
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSwitchRole(r.id)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          userRole === r.id ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                        }`}
                      >
                        <span className="truncate">{r.label}</span>
                        {userRole === r.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-semibold text-slate-800 max-w-[140px] truncate leading-tight">
                  {userEmail}
                </span>
                <span className="text-[10px] text-slate-400 font-medium capitalize">
                  {userRole.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-400 hover:text-red-600 transition-colors ml-1 px-1.5 py-1 rounded hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
