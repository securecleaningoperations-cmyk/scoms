import { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/SignInForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to SCOMS"
      subtitle="One sign-in for corporate staff, field teams and client facility accounts. You'll be taken to the workspace for your role."
      clip="team"
      footer={
        <div className="space-y-3">
          <p>New to SCOMS? <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">Create an account</Link> with your organization code.</p>
          <p className="text-[12px] text-slate-500">Prefer a dedicated entrance? <Link href="/portal/login" className="font-medium text-slate-700 hover:text-slate-900 underline-offset-2 hover:underline">Client Portal</Link> · <Link href="/employee/login" className="font-medium text-slate-700 hover:text-slate-900 underline-offset-2 hover:underline">Field Team</Link></p>
        </div>
      }
    >
      <Suspense fallback={<div className="h-80" />}><SignInForm /></Suspense>
    </AuthShell>
  );
}
