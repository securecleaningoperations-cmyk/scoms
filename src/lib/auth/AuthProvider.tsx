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
}

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
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
  executive: ["Overview", "Operations", "Finance", "Clients & Sales", "Analytics", "Quality & Compliance"],
  operations_manager: ["Overview", "Operations", "Workforce", "Clients & Sales", "Quality & Compliance", "Communications"],
  supervisor: ["Overview", "Operations", "Workforce", "Quality & Compliance", "Communications"],
  hr_manager: ["Overview", "Workforce", "Academy", "Documents", "Communications"],
  finance_admin: ["Overview", "Finance", "Clients & Sales", "Documents"],
  payroll_admin: ["Overview", "Finance", "Workforce"],
  sales_manager: ["Overview", "Clients & Sales", "Communications", "Documents"],
  scheduler: ["Overview", "Operations"],
  compliance_officer: ["Overview", "Quality & Compliance", "Documents", "Analytics"],
  quality_manager: ["Overview", "Operations", "Quality & Compliance"],
  franchise_admin: ["Overview", "Operations", "Workforce", "Finance", "Quality & Compliance", "Organization"],
  vendor_manager: ["Overview", "Documents"],
  field_employee: ["Operations"],
  client_admin: ["Overview"],
  client_user: ["Overview"],
};

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || "field_employee";

  const isAdmin = ADMIN_ROLES.includes(role);
  const allowedGroups = ROLE_NAV_ACCESS[role] || ["Overview"];
  const canAccessGroup = (group: string) => isAdmin || allowedGroups.includes("ALL") || allowedGroups.includes(group);

  return {
    role,
    isAdmin,
    canAccessGroup,
    canCreate: !["field_employee", "client_admin", "client_user"].includes(role),
    canApprove: ["super_admin", "corporate_admin", "executive", "operations_manager", "finance_admin", "hr_manager"].includes(role),
    canDelete: isAdmin,
    canExport: !["field_employee", "client_user"].includes(role),
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

  const buildProfile = useCallback(async (authUser: User): Promise<UserProfile> => {
    // Try metadata first, then DB
    let role: ScomsRole = "field_employee";
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
      // Table may not exist or user not in it — use metadata
    }

    return {
      id: authUser.id,
      email: authUser.email || "",
      firstName: firstName || authUser.user_metadata?.first_name || "",
      lastName: lastName || authUser.user_metadata?.last_name || "",
      role,
      tenantId,
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await buildProfile(authUser);
      setUser(profile);
    }
  }, [buildProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          const profile = await buildProfile(currentSession.user);
          if (mounted) setUser(profile);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      if (newSession?.user) {
        const profile = await buildProfile(newSession.user);
        if (mounted) setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [buildProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
