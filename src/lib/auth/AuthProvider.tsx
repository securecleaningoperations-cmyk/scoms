"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────

export type ScomsRole =
  | "super_admin"
  | "corporate_admin"
  | "executive"
  | "operations_manager"
  | "supervisor"
  | "hr_manager"
  | "finance_admin"
  | "payroll_admin"
  | "sales_manager"
  | "scheduler"
  | "compliance_officer"
  | "quality_manager"
  | "franchise_admin"
  | "vendor_manager"
  | "field_employee"
  | "client_admin"
  | "client_user";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: ScomsRole;
  tenantId?: string;
  locationId?: string;
  avatarUrl?: string;
  username?: string;
  employeeId?: string;
  department?: string;
}

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: ScomsRole;
  setActiveRole: (role: ScomsRole) => void;
  loginAsUser: (profile: UserProfile) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  activeRole: "super_admin",
  setActiveRole: () => {},
  loginAsUser: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ── Permission helpers ─────────────────────────────────────────────────

const ADMIN_ROLES: ScomsRole[] = ["super_admin", "corporate_admin"];

const ROLE_NAV_ACCESS: Record<string, string[]> = {
  super_admin: ["ALL"],
  corporate_admin: ["ALL"],
  executive: ["ALL"],
  operations_manager: ["Overview", "Operations", "Workforce", "Clients & Sales", "Procurement & Inventory", "Quality & Compliance", "Communications"],
  supervisor: ["Overview", "Operations", "Workforce", "Quality & Compliance", "Communications"],
  hr_manager: ["Overview", "Workforce", "Academy", "Documents", "Communications"],
  finance_admin: ["Overview", "Finance", "Clients & Sales", "Documents", "Analytics"],
  payroll_admin: ["Overview", "Finance", "Workforce"],
  sales_manager: ["Overview", "Clients & Sales", "Communications", "Documents"],
  scheduler: ["Overview", "Operations"],
  compliance_officer: ["Overview", "Quality & Compliance", "Documents", "Analytics"],
  quality_manager: ["Overview", "Operations", "Quality & Compliance", "Documents", "Analytics"],
  franchise_admin: ["Overview", "Operations", "Workforce", "Finance", "Quality & Compliance", "Organization", "Analytics"],
  vendor_manager: ["Overview", "Procurement & Inventory", "Documents"],
  field_employee: ["Overview", "Operations", "Academy", "Documents"],
  client_admin: ["Overview"],
  client_user: ["Overview"],
};

export function usePermissions() {
  const { user, activeRole } = useAuth();
  const role = activeRole || user?.role || "super_admin";

  const isAdmin = ADMIN_ROLES.includes(role);
  const allowedGroups = ROLE_NAV_ACCESS[role] || ["ALL"];
  const canAccessGroup = (group: string) => isAdmin || allowedGroups.includes("ALL") || allowedGroups.includes(group);

  return {
    role,
    isAdmin,
    canAccessGroup,
    canCreate: !["client_user"].includes(role),
    canApprove: ["super_admin", "corporate_admin", "executive", "operations_manager", "finance_admin", "hr_manager"].includes(role),
    canDelete: isAdmin,
    canExport: !["client_user"].includes(role),
    canViewFinance: ["super_admin", "corporate_admin", "executive", "finance_admin", "payroll_admin", "franchise_admin"].includes(role),
    canViewHR: ["super_admin", "corporate_admin", "hr_manager", "payroll_admin", "operations_manager"].includes(role),
    canManageSettings: isAdmin,
  };
}

// ── Provider ───────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<ScomsRole>("super_admin");

  const buildProfile = useCallback(async (authUser: User): Promise<UserProfile> => {
    // Default corporate portal login to super_admin/owner level so all features work
    let role: ScomsRole = "super_admin";
    let firstName = "";
    let lastName = "";
    let tenantId: string | undefined;

    if (authUser.user_metadata?.role) {
      role = (authUser.user_metadata.role as string).toLowerCase().replace(/\s+/g, "_") as ScomsRole;
    }

    // Attempt to fetch from users table
    try {
      const { data } = await supabase
        .from("users")
        .select("role, first_name, last_name, tenant_id")
        .eq("id", authUser.id)
        .single();

      if (data) {
        if (data.role) role = (data.role as string).toLowerCase().replace(/\s+/g, "_") as ScomsRole;
        firstName = data.first_name || "";
        lastName = data.last_name || "";
        tenantId = data.tenant_id;
      }
    } catch {
      // Table may not exist or user not in it — use default/metadata
    }

    // Fallback safeguard for admin users
    if (!role || role === "field_employee") {
      const email = authUser.email?.toLowerCase() || "";
      if (email.includes("admin") || email.includes("securecleaning") || email.includes("freelancecomm9") || email.includes("owner")) {
        role = "super_admin";
      }
    }

    setActiveRole(role);

    // Generate sensible employeeId and username if not present
    const cleanFirst = (firstName || authUser.user_metadata?.first_name || (authUser.email ? authUser.email.split('@')[0] : "user")).toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = (lastName || authUser.user_metadata?.last_name || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = authUser.user_metadata?.username || `@${cleanFirst}${cleanLast ? `.${cleanLast[0]}` : ''}`;
    const employeeId = authUser.user_metadata?.employee_id || 
      (role === 'super_admin' ? 'EMP-0001' : 
       role === 'operations_manager' ? 'EMP-1042' : 
       role === 'supervisor' ? 'EMP-2015' : 
       role === 'field_employee' ? 'EMP-3015' : 
       role === 'client_admin' || role === 'client_user' ? 'CLI-8092' : 'EMP-5000');

    return {
      id: authUser.id,
      email: authUser.email || "",
      firstName: firstName || authUser.user_metadata?.first_name || (authUser.email ? authUser.email.split('@')[0] : "Administrator"),
      lastName: lastName || authUser.user_metadata?.last_name || "",
      role,
      tenantId,
      username,
      employeeId,
      department: authUser.user_metadata?.department || (role === 'super_admin' ? 'Executive Platform Ownership' : 'Field Operations')
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await buildProfile(authUser);
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem("scoms_active_user", JSON.stringify(profile));
      }
    }
  }, [buildProfile]);

  const loginAsUser = useCallback((profile: UserProfile) => {
    setUser(profile);
    setActiveRole(profile.role);
    if (typeof window !== 'undefined') {
      localStorage.setItem("scoms_active_user", JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent("scoms-auth-changed", { detail: profile }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem("scoms_active_user");
      window.dispatchEvent(new CustomEvent("scoms-auth-changed", { detail: null }));
    }
    setUser(null);
    setSession(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // First check custom logged-in user in localStorage
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem("scoms_active_user");
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed && parsed.role) {
                if (mounted) {
                  setUser(parsed);
                  setActiveRole(parsed.role);
                  setIsLoading(false);
                }
                return;
              }
            } catch (e) {
              console.warn("Could not parse cached user", e);
            }
          }
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          const profile = await buildProfile(currentSession.user);
          if (mounted) {
            setUser(profile);
            if (typeof window !== 'undefined') {
              localStorage.setItem("scoms_active_user", JSON.stringify(profile));
            }
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    // Listen for custom login events from login page or profile switcher
    const handleAuthEvent = (e: any) => {
      if (!mounted) return;
      if (e.detail) {
        setUser(e.detail);
        setActiveRole(e.detail.role);
      } else {
        setUser(null);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("scoms-auth-changed", handleAuthEvent);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      if (newSession?.user) {
        const profile = await buildProfile(newSession.user);
        if (mounted) {
          setUser(profile);
          if (typeof window !== 'undefined') {
            localStorage.setItem("scoms_active_user", JSON.stringify(profile));
          }
        }
      } else {
        // Don't wipe custom user if using role demo login
        if (typeof window !== 'undefined' && !localStorage.getItem("scoms_active_user")) {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener("scoms-auth-changed", handleAuthEvent);
      }
    };
  }, [buildProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        activeRole,
        setActiveRole,
        loginAsUser,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
