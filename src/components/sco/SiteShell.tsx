import { Instrument_Serif, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/app/sco/sco.css";
import Chrome from "./Chrome";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const scoFontVars = `${display.variable} ${body.variable} ${mono.variable}`;

/** Shared public-site shell (fonts + header/footer/transitions) for `/` and `/sco/*`. */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`sco ${scoFontVars}`}>
      <Chrome>{children}</Chrome>
    </div>
  );
}
