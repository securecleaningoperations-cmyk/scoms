import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import RoleGate from "@/components/auth/RoleGate";

export const metadata: Metadata = {
  title: "Employee Portal | SCOMS",
  description: "Secure Cleaning Operations — Employee Self-Service Portal",
};

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans antialiased bg-slate-50 text-slate-900">
      <AuthProvider>
        <RoleGate workspace="field" loginPath="/employee/login">{children}</RoleGate>
      </AuthProvider>
    </div>
  );
}
