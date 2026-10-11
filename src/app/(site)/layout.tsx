import type { Metadata } from "next";
import SiteShell from "@/components/sco/SiteShell";

export const metadata: Metadata = {
  title: "Secure Cleaning Operations | Commercial Cleaning & Facility Services",
  description: "Structured, inspected and documented commercial cleaning and facility services for offices, healthcare, education, industrial and government facilities across PA, MD, VA and DC.",
  openGraph: { images: ["/assets/images/hero-poster.webp"] },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
