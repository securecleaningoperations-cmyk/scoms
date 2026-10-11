import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import RoleGate from "@/components/auth/RoleGate";

export const metadata: Metadata = {
  title: "Customer Portal | SCOMS",
  description: "Secure Cleaning Operations — Customer Self-Service Portal",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans antialiased bg-slate-50 text-slate-900">
      <AuthProvider>
        <RoleGate workspace="client" loginPath="/portal/login">{children}</RoleGate>
      </AuthProvider>
    </div>
  );
}
