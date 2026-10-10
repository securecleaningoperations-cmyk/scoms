import Link from "next/link";
import { LogoMark } from "@/components/sco/Logo";

export const metadata = { title: "How can we help?", robots: { index: false } };

const opts = [["Client Login", "/login"], ["Employee Access", "/login"], ["Careers", "/sco/careers"], ["Request Service", "/sco/request/service"], ["Contact", "/sco/contact"], ["Mobile App", "/sco/qr#app"]];

export default function QR() {
  return (
    <main className="qr dark">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}><LogoMark /><span style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>Secure Cleaning Operations</span></div>
      <h1 style={{ fontSize: "clamp(2.6rem, 11vw, 4rem)", margin: "56px 0 28px" }}>How can we <em>help?</em></h1>
      <nav aria-label="Quick links" style={{ borderTop: "1px solid rgba(255,255,255,.16)" }}>
        {opts.map(([l, h]) => <Link key={l} href={h} className="qr-opt"><span>{l}</span><span aria-hidden="true">→</span></Link>)}
      </nav>
      <p id="app" style={{ marginTop: "auto", paddingTop: 40, opacity: 0.55, fontSize: ".85rem" }}>The mobile app link will appear here when available.</p>
    </main>
  );
}
