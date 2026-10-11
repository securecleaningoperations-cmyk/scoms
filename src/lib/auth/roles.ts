import type { ScomsRole } from "./AuthProvider";

/** Human labels for every SCOMS role. */
export const ROLE_LABELS: Record<ScomsRole, string> = {
  super_admin: "Executive Super Admin",
  corporate_admin: "Corporate Admin",
  executive: "Executive",
  operations_manager: "Operations Manager",
  supervisor: "Field Supervisor",
  hr_manager: "HR Manager",
  finance_admin: "Finance Admin",
  payroll_admin: "Payroll Admin",
  sales_manager: "Sales Manager",
  scheduler: "Scheduler / Dispatcher",
  compliance_officer: "Compliance Officer",
  quality_manager: "Quality Manager",
  franchise_admin: "Franchise Admin",
  vendor_manager: "Vendor Manager",
  field_employee: "Field Cleaning Technician",
  client_admin: "Client Facility Admin",
  client_user: "Client User",
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as ScomsRole[];

/**
 * Roles that grant platform-wide or financial authority. They can never be self-selected at
 * sign-up — they must arrive through an administrator's invite link (which pre-sets the role).
 */
export const PRIVILEGED_ROLES: ScomsRole[] = [
  "super_admin", "corporate_admin", "executive", "finance_admin", "payroll_admin", "franchise_admin",
];

/** Roles a person may pick for themselves when joining with an organization code. */
export const SELF_SIGNUP_ROLES: ScomsRole[] = [
  "field_employee", "supervisor", "scheduler", "operations_manager", "quality_manager",
  "sales_manager", "hr_manager", "compliance_officer", "vendor_manager", "client_admin", "client_user",
];

export type Workspace = "corporate" | "client" | "field";

export function workspaceFor(role: ScomsRole): Workspace {
  if (role === "client_admin" || role === "client_user") return "client";
  if (role === "field_employee") return "field";
  return "corporate";
}

/** Where a user lands after authenticating — always derived from the *actual* role. */
export function homeFor(role: ScomsRole): string {
  const w = workspaceFor(role);
  return w === "client" ? "/portal/dashboard" : w === "field" ? "/employee/dashboard" : "/dashboard";
}

export function normalizeRole(raw: unknown, fallback: ScomsRole = "field_employee"): ScomsRole {
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  const r = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return (ALL_ROLES as string[]).includes(r) ? (r as ScomsRole) : fallback;
}

/** Password policy shared by sign-up and reset. */
export function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 8) issues.push("at least 8 characters");
  if (!/[a-z]/i.test(pw)) issues.push("a letter");
  if (!/\d/.test(pw)) issues.push("a number");
  return issues;
}

export function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^a-z0-9]/i.test(pw)) s++;
  return Math.min(4, s) as 0 | 1 | 2 | 3 | 4;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** SHA-256 hex digest (used for the local demo account store so plaintext passwords are never kept). */
export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** True when Supabase is configured with real (non-placeholder) credentials. */
export const supabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return !!url && !!key && !url.includes("your-project") && key !== "your-anon-key";
};

/** Demo accounts are shown only when explicitly enabled (defaults on outside production). */
export const demoEnabled = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE ? process.env.NEXT_PUBLIC_DEMO_MODE === "true" : process.env.NODE_ENV !== "production";
