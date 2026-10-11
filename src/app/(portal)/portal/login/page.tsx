import { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/SignInForm";

export default function PortalLoginPage() {
  return (
    <>
      <AuthShell
        title="Client Portal"
        subtitle="Service requests, schedules, inspection reports, documents and billing for your facilities."
        clip="closing"
        panelTitle={<>Your facilities,<br />always in view.</>}
        panelBody="Track service visits, approve walkthroughs, review inspections and manage invoices with Secure Cleaning Operations."
        footer={<div className="space-y-2"><p>Need portal access? Ask your account manager for an invitation, or <Link href="/sco/contact" className="font-semibold text-blue-600 hover:text-blue-700">contact us</Link>.</p><p className="text-[12px] text-slate-500">Staff member? <Link href="/login" className="font-medium text-slate-700 hover:underline">Corporate sign-in</Link></p></div>}
      >
        <Suspense fallback={<div className="h-80" />}><SignInForm expect="client" /></Suspense>
      </AuthShell>
    </>
  );
}
