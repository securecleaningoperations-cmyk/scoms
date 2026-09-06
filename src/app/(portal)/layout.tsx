import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Portal | SCOMS",
  description: "Secure Cleaning Operations — Customer Self-Service Portal",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans antialiased bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
