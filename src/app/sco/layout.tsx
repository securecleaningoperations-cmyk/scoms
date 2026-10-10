import type { Metadata } from "next";
import { Instrument_Serif, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./sco.css";
import Chrome from "@/components/sco/Chrome";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Secure Cleaning Operations | Commercial Cleaning & Facility Services", template: "%s | Secure Cleaning Operations" },
  description: "Professional commercial cleaning and facility services built for critical environments across Pennsylvania, Maryland, Virginia and Washington, DC.",
};

export default function ScoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`sco ${display.variable} ${body.variable} ${mono.variable}`}>
      <Chrome>{children}</Chrome>
    </div>
  );
}
