"use client";

import { supabase } from "@/lib/supabase";
import type { UserProfile, ScomsRole } from "./AuthProvider";
import { EMAIL_RE, demoEnabled, normalizeRole, passwordIssues, sha256, supabaseConfigured } from "./roles";

/**
 * Single authentication service used by every login surface (corporate, client portal,
 * field app), sign-up, and password recovery.
 *
 *  • Supabase Auth is the source of truth whenever it is configured.
 *  • A local *demo* directory exists only for presentations (NEXT_PUBLIC_DEMO_MODE, default on
 *    outside production). Demo passwords are stored as SHA-256 digests, there is no master
 *    password, and the role always comes from the account — never from a UI tab.
 */

export type AuthResult = { ok: true; profile: UserProfile } | { ok: false; error: string; code?: "not_found" | "bad_password" | "unconfirmed" | "invalid" | "network" };

const ORG_NAME = "Secure Cleaning Operations Inc.";
const ORG_CODE = "ORG-SCOMS-7749";
const STORE = "scoms_registered_users_v2";
const RESET = "scoms_demo_reset_tokens";

interface DemoAccount { email: string; employeeId: string; username: string; firstName: string; lastName: string; role: ScomsRole; department: string; hash: string; organizationName: string; organizationCode: string }

/** Built-in demo personas (hash of the shown demo password). */
const DEMO_SEED: (Omit<DemoAccount, "hash" | "organizationName" | "organizationCode"> & { password: string })[] = [
  { email: "admin@securecleaningoperations.com", employeeId: "EMP-0001", username: "@david.vance", firstName: "David", lastName: "Vance", role: "super_admin", department: "Executive Platform Ownership", password: "Admin2026!" },
  { email: "ops.manager@securecleaningoperations.com", employeeId: "EMP-1042", username: "@marcus.v", firstName: "Marcus", lastName: "Vance", role: "operations_manager", department: "Operations Field Dispatch", password: "Manager2026!" },
  { email: "cleaner.lead@securecleaningoperations.com", employeeId: "EMP-3015", username: "@carlos.tech", firstName: "Carlos", lastName: "Rodriguez", role: "field_employee", department: "Commercial Cleaning Crew", password: "Cleaner2026!" },
  { email: "client@apexlogistics.com", employeeId: "CLI-8092", username: "@apex.facility", firstName: "Apex", lastName: "Logistics", role: "client_admin", department: "Client Facility Operations", password: "Client2026!" },
];
export const DEMO_ACCOUNTS = DEMO_SEED.map(({ email, password, role, firstName, lastName }) => ({ email, password, role, name: `${firstName} ${lastName}` }));

function readStore(): DemoAccount[] {
  try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; }
}
function writeStore(list: DemoAccount[]) { localStorage.setItem(STORE, JSON.stringify(list)); }

async function demoDirectory(): Promise<DemoAccount[]> {
  const seeded = await Promise.all(DEMO_SEED.map(async ({ password, ...a }) => ({ ...a, hash: await sha256(password), organizationName: ORG_NAME, organizationCode: ORG_CODE })));
  const custom = readStore();
  // registered accounts override seeded ones with the same email
  return [...seeded.filter((s) => !custom.some((c) => c.email === s.email)), ...custom];
}

const toProfile = (a: DemoAccount): UserProfile => ({
  id: `usr-${a.employeeId.toLowerCase()}`, email: a.email, firstName: a.firstName, lastName: a.lastName, role: a.role,
  employeeId: a.employeeId, username: a.username, department: a.department, organizationName: a.organizationName, organizationCode: a.organizationCode,
});

export const authMode = (): "supabase" | "demo" | "unavailable" =>
  supabaseConfigured() ? "supabase" : demoEnabled() ? "demo" : "unavailable";

/* ───────────────────────────── sign in ───────────────────────────── */

export async function signIn(identifier: string, password: string): Promise<AuthResult> {
  const id = identifier.trim().toLowerCase();
  if (!id || !password) return { ok: false, error: "Enter your work email (or Employee ID) and password.", code: "invalid" };

  if (supabaseConfigured() && EMAIL_RE.test(id)) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: id, password });
      if (!error && data.session?.user) {
        const u = data.session.user;
        const m = u.user_metadata || {};
        let role = normalizeRole(m.role, "field_employee");
        try {
          const { data: row } = await supabase.from("users").select("role, first_name, last_name").eq("id", u.id).maybeSingle();
          if (row?.role) role = normalizeRole(row.role, role);
          if (row?.first_name) m.first_name = row.first_name;
          if (row?.last_name) m.last_name = row.last_name;
        } catch { /* users table optional */ }
        return { ok: true, profile: {
          id: u.id, email: u.email || id, role,
          firstName: m.first_name || (u.email || id).split("@")[0], lastName: m.last_name || "",
          employeeId: m.employee_id, username: m.username, department: m.department,
          organizationName: m.organization_name || ORG_NAME, organizationCode: m.organization_code || ORG_CODE,
        } };
      }
      if (error && /confirm/i.test(error.message)) return { ok: false, error: "Please confirm your email address first — check your inbox for the verification link.", code: "unconfirmed" };
      if (error && !demoEnabled()) return { ok: false, error: "Incorrect email or password.", code: "bad_password" };
    } catch {
      if (!demoEnabled()) return { ok: false, error: "We couldn't reach the sign-in service. Check your connection and try again.", code: "network" };
    }
  }

  if (!demoEnabled()) return { ok: false, error: "Sign-in is not configured for this environment.", code: "invalid" };

  const dir = await demoDirectory();
  const acct = dir.find((a) => a.email === id || a.employeeId.toLowerCase() === id || a.username.toLowerCase() === id);
  if (!acct) return { ok: false, error: "No account matches that email or Employee ID. Check the spelling or create an account.", code: "not_found" };
  if (acct.hash !== (await sha256(password))) return { ok: false, error: "That password is incorrect. Try again or reset your password.", code: "bad_password" };
  return { ok: true, profile: toProfile(acct) };
}

/* ───────────────────────────── sign up ───────────────────────────── */

export interface SignUpInput { fullName: string; email: string; password: string; role: ScomsRole; orgCode: string; orgName: string }

export async function signUp(input: SignUpInput): Promise<AuthResult & { needsConfirmation?: boolean }> {
  const email = input.email.trim().toLowerCase();
  const [firstName, ...rest] = input.fullName.trim().split(/\s+/);
  const lastName = rest.join(" ");
  if (!firstName) return { ok: false, error: "Enter your full name.", code: "invalid" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid work email address.", code: "invalid" };
  const issues = passwordIssues(input.password);
  if (issues.length) return { ok: false, error: `Password needs ${issues.join(", ")}.`, code: "invalid" };
  if (!/^ORG-[A-Z0-9-]{3,}$/.test(input.orgCode.trim().toUpperCase())) return { ok: false, error: "Enter the organization code provided by your administrator (e.g. ORG-XXXX-0000).", code: "invalid" };

  const employeeId = `${input.role.startsWith("client") ? "CLI" : "EMP"}-${Math.floor(1000 + Math.random() * 9000)}`;
  const username = `@${firstName.toLowerCase()}${lastName ? "." + lastName[0].toLowerCase() : ""}`;
  const department = input.role.startsWith("client") ? "Client Facility Operations" : input.role === "field_employee" ? "Field Operations" : "Operations Management";

  if (supabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password: input.password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${location.origin}/login?verified=1` : undefined,
          data: { first_name: firstName, last_name: lastName, role: input.role, employee_id: employeeId, username, department, organization_name: input.orgName, organization_code: input.orgCode.toUpperCase() },
        },
      });
      if (error) return { ok: false, error: /registered|exists/i.test(error.message) ? "An account with this email already exists. Sign in or reset your password." : error.message, code: "invalid" };
      const profile: UserProfile = { id: data.user?.id || email, email, firstName, lastName, role: input.role, employeeId, username, department, organizationName: input.orgName, organizationCode: input.orgCode.toUpperCase() };
      return { ok: true, profile, needsConfirmation: !data.session };
    } catch {
      if (!demoEnabled()) return { ok: false, error: "We couldn't reach the registration service. Try again shortly.", code: "network" };
    }
  }

  if (!demoEnabled()) return { ok: false, error: "Registration is not configured for this environment.", code: "invalid" };
  const dir = await demoDirectory();
  if (dir.some((a) => a.email === email)) return { ok: false, error: "An account with this email already exists. Sign in or reset your password.", code: "invalid" };
  const acct: DemoAccount = { email, employeeId, username, firstName, lastName, role: input.role, department, hash: await sha256(input.password), organizationName: input.orgName, organizationCode: input.orgCode.toUpperCase() };
  writeStore([...readStore(), acct]);
  return { ok: true, profile: toProfile(acct) };
}

/* ─────────────────────────── password recovery ─────────────────────────── */

/**
 * Always resolves with the same neutral message so the form can't be used to discover which
 * emails have accounts. In demo mode a one-time reset link is returned for display since no
 * email is actually sent.
 */
export async function requestPasswordReset(emailRaw: string): Promise<{ ok: boolean; error?: string; demoLink?: string }> {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (supabaseConfigured()) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password` });
      if (error && /rate/i.test(error.message)) return { ok: false, error: "Too many requests. Please wait a minute and try again." };
      return { ok: true };
    } catch {
      if (!demoEnabled()) return { ok: false, error: "We couldn't send the reset email right now. Try again shortly." };
    }
  }
  if (!demoEnabled()) return { ok: false, error: "Password reset is not configured for this environment." };
  const dir = await demoDirectory();
  if (!dir.some((a) => a.email === email)) return { ok: true };
  const token = crypto.randomUUID();
  const tokens = JSON.parse(localStorage.getItem(RESET) || "{}");
  tokens[token] = { email, exp: Date.now() + 30 * 60_000 };
  localStorage.setItem(RESET, JSON.stringify(tokens));
  return { ok: true, demoLink: `/reset-password?demo_token=${token}` };
}

/** Completes a reset. Supabase: the recovery link already created a session. Demo: validates token. */
export async function completePasswordReset(newPassword: string, demoToken?: string | null): Promise<{ ok: boolean; error?: string; email?: string }> {
  const issues = passwordIssues(newPassword);
  if (issues.length) return { ok: false, error: `Password needs ${issues.join(", ")}.` };

  if (demoToken) {
    const tokens = JSON.parse(localStorage.getItem(RESET) || "{}");
    const t = tokens[demoToken];
    if (!t || t.exp < Date.now()) return { ok: false, error: "This reset link has expired or was already used. Request a new one." };
    const dir = await demoDirectory();
    const acct = dir.find((a) => a.email === t.email);
    if (!acct) return { ok: false, error: "Account not found." };
    const hash = await sha256(newPassword);
    const store = readStore().filter((a) => a.email !== acct.email);
    writeStore([...store, { ...acct, hash }]);
    delete tokens[demoToken];
    localStorage.setItem(RESET, JSON.stringify(tokens));
    return { ok: true, email: acct.email };
  }

  if (!supabaseConfigured()) return { ok: false, error: "This reset link is invalid. Request a new one." };
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { ok: false, error: "This reset link has expired or was already used. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  await supabase.auth.signOut();
  return { ok: true, email: data.session.user.email };
}

/* ───────────────────────────── session helpers ───────────────────────────── */

export const SESSION_KEY = "scoms_active_user";

export function persistSession(profile: UserProfile, remember: boolean) {
  const raw = JSON.stringify(profile);
  // "remember me" keeps the session across browser restarts; otherwise it lives for this tab only.
  if (remember) { localStorage.setItem(SESSION_KEY, raw); sessionStorage.removeItem(SESSION_KEY); }
  else { sessionStorage.setItem(SESSION_KEY, raw); localStorage.removeItem(SESSION_KEY); }
}

export function readSession(): UserProfile | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    const p = raw ? JSON.parse(raw) : null;
    return p && p.role ? p : null;
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/** Only allow same-origin relative redirects (prevents open-redirect via ?next=). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
