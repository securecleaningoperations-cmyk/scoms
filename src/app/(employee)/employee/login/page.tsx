import { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/SignInForm";

export default function EmployeeLoginPage() {
  return (
    <>
      <AuthShell
        title="Field Team sign-in"
        subtitle="Shifts, clock-in, checklists, safety sheets and training for Secure Cleaning Operations team members."
        clip="floor"
        panelTitle={<>Your shift,<br />in your pocket.</>}
        panelBody="See today's assignments, clock in on site, complete checklists and report issues from any device."
        footer={<div className="space-y-2"><p>Sign in with your work email or Employee ID (e.g. EMP-0000).</p><p className="text-[12px] text-slate-500">Manager or office staff? <Link href="/login" className="font-medium text-slate-700 hover:underline">Corporate sign-in</Link></p></div>}
      >
        <Suspense fallback={<div className="h-80" />}><SignInForm expect="field" /></Suspense>
      </AuthShell>
    </>
  );
}
