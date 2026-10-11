import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Sign in | SCOMS — Secure Cleaning Operations",
  robots: { index: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
