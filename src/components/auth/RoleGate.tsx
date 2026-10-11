"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { homeFor, workspaceFor, type Workspace } from "@/lib/auth/roles";

/**
 * Client-side workspace guard.
 *  - Unauthenticated → workspace login with ?next= so the user returns where they were.
 *  - Authenticated in the wrong workspace → their own home (a client can't open /dashboard).
 * Login pages inside a guarded area are always allowed through.
 */
export default function RoleGate({ workspace, loginPath, children }: { workspace: Workspace; loginPath: string; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";
  const isLogin = pathname === loginPath;
  const wrongWorkspace = !!user && workspaceFor(user.role) !== workspace;

  useEffect(() => {
    if (isLogin || isLoading) return;
    if (!user) router.replace(`${loginPath}?next=${encodeURIComponent(pathname)}`);
    else if (wrongWorkspace) router.replace(homeFor(user.role));
  }, [isLogin, isLoading, user, wrongWorkspace, router, loginPath, pathname]);

  if (isLogin) return <>{children}</>;
  if (isLoading || !user || wrongWorkspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Checking access…</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
