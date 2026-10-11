"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { clearSession, persistSession, readSession, SESSION_KEY } from "./service";
import { normalizeRole } from "./roles";

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
  organizationName?: string;
  organizationCode?: string;
}

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: ScomsRole;
  setActiveRole: (role: ScomsRole) => void;
  loginAsUser: (profile: UserProfile, remember?: boolean) => void;
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
  const role: ScomsRole = activeRole || user?.role || "client_user";

  const isAdmin = ADMIN_ROLES.includes(role);
  const allowedGroups = ROLE_NAV_ACCESS[role] || ["Overview"];
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
    // Role comes from the account (users table, then metadata). Unknown accounts get the
    // least-privileged staff role — never an implicit admin.
    let role: ScomsRole = normalizeRole(authUser.user_metadata?.role, "field_employee");
    let firstName = "";
    let lastName = "";
    let tenantId: string | undefined;

    // Attempt to fetch from users table
    try {
      const { data } = await supabase
        .from("users")
        .select("role, first_name, last_name, tenant_id")
        .eq("id", authUser.id)
        .single();

      if (data) {
        if (data.role) role = normalizeRole(data.role, role);
        firstName = data.first_name || "";
        lastName = data.last_name || "";
        tenantId = data.tenant_id;
      }
    } catch {
      // Table may not exist or user not in it — use default/metadata
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
      department: authUser.user_metadata?.department || (role === 'super_admin' ? 'Executive Platform Ownership' : 'Field Operations'),
      organizationName: authUser.user_metadata?.organization_name || "Secure Cleaning Operations Inc.",
      organizationCode: authUser.user_metadata?.organization_code || "ORG-SCOMS-7749"
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await buildProfile(authUser);
      setUser(profile);
      if (typeof window !== "undefined") persistSession(profile, !!localStorage.getItem(SESSION_KEY));
    }
  }, [buildProfile]);

  const loginAsUser = useCallback((profile: UserProfile, remember = true) => {
    setUser(profile);
    setActiveRole(profile.role);
    if (typeof window !== "undefined") {
      persistSession(profile, remember);
      window.dispatchEvent(new CustomEvent("scoms-auth-changed", { detail: profile }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    if (typeof window !== "undefined") {
      clearSession();
      window.dispatchEvent(new CustomEvent("scoms-auth-changed", { detail: null }));
    }
    setUser(null);
    setSession(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // 1. an existing app session (Supabase-backed or demo directory)
        const cached = typeof window !== "undefined" ? readSession() : null;
        if (cached) {
          if (mounted) {
            setUser(cached);
            setActiveRole(cached.role);
          }
          return;
        }
        // 2. a live Supabase session without a cached profile
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (currentSession?.user) {
          setSession(currentSession);
          const profile = await buildProfile(currentSession.user);
          if (mounted) {
            setUser(profile);
            persistSession(profile, true);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    // Sync across tabs/components (login page, sign-out, role switch)
    const handleAuthEvent = (e: Event) => {
      if (!mounted) return;
      const detail = (e as CustomEvent<UserProfile | null>).detail;
      if (detail) {
        setUser(detail);
        setActiveRole(detail.role);
      } else {
        setUser(null);
      }
    };
    window.addEventListener("scoms-auth-changed", handleAuthEvent);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") return; // handled by /reset-password
      setSession(newSession);
      if (newSession?.user) {
        const profile = await buildProfile(newSession.user);
        if (mounted) {
          setUser(profile);
          persistSession(profile, !!localStorage.getItem(SESSION_KEY) || !sessionStorage.getItem(SESSION_KEY));
        }
      } else if (!readSession()) {
        // keep demo-directory sessions; clear only when nothing is cached
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("scoms-auth-changed", handleAuthEvent);
    };
  }, [buildProfile]);

  // "View as" role preview: only platform admins may preview other roles; everyone else is
  // pinned to the role on their account (prevents client-side privilege escalation).
  const guardedSetActiveRole = useCallback((role: ScomsRole) => {
    const own = user?.role;
    if (!own) return;
    if (ADMIN_ROLES.includes(own) || role === own) setActiveRole(role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        activeRole,
        setActiveRole: guardedSetActiveRole,
        loginAsUser,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
