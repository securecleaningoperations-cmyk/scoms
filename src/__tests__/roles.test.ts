import { describe, it, expect } from "vitest";
import { homeFor, normalizeRole, passwordIssues, passwordStrength, PRIVILEGED_ROLES, SELF_SIGNUP_ROLES, workspaceFor } from "@/lib/auth/roles";

describe("auth roles", () => {
  it("routes every role to the right workspace", () => {
    expect(homeFor("super_admin")).toBe("/dashboard");
    expect(homeFor("operations_manager")).toBe("/dashboard");
    expect(homeFor("client_admin")).toBe("/portal/dashboard");
    expect(homeFor("client_user")).toBe("/portal/dashboard");
    expect(homeFor("field_employee")).toBe("/employee/dashboard");
    expect(workspaceFor("supervisor")).toBe("corporate");
  });

  it("normalizes role strings and rejects unknown roles", () => {
    expect(normalizeRole("Operations Manager")).toBe("operations_manager");
    expect(normalizeRole("super-admin")).toBe("super_admin");
    expect(normalizeRole("root", "client_user")).toBe("client_user");
    expect(normalizeRole(undefined)).toBe("field_employee");
  });

  it("never lets privileged roles be self-selected", () => {
    for (const r of PRIVILEGED_ROLES) expect(SELF_SIGNUP_ROLES).not.toContain(r);
  });

  it("enforces the password policy", () => {
    expect(passwordIssues("short1")).toContain("at least 8 characters");
    expect(passwordIssues("longpassword")).toContain("a number");
    expect(passwordIssues("12345678")).toContain("a letter");
    expect(passwordIssues("Cleaner2026")).toEqual([]);
    expect(passwordStrength("Cleaner2026!xyz")).toBeGreaterThanOrEqual(3);
  });
});
