import type { Metadata } from "next";
import SiteShell from "@/components/sco/SiteShell";

export const metadata: Metadata = {
  title: { default: "Secure Cleaning Operations | Commercial Cleaning & Facility Services", template: "%s | Secure Cleaning Operations" },
  description: "Professional commercial cleaning and facility services built for critical environments across Pennsylvania, Maryland, Virginia and Washington, DC.",
};

export default function ScoLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
