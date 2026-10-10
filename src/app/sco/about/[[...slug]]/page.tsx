import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, Reveal, CtaBand } from "@/components/sco/templates";
import { pillars } from "@/lib/sco/content";

const pages: Record<string, { title: string; lead: string; body: string[] }> = {
  "": { title: "About Secure Cleaning Operations", lead: "A commercial cleaning and facility-services company built around people, process, quality, technology and accountability.", body: ["Secure Cleaning Operations Inc. provides professional commercial cleaning and facility services for critical environments across Pennsylvania, Maryland, Virginia and Washington, DC.", "Our approach is structured: plan the work, assign the right people, execute to a defined scope, verify the result, document it, measure it and keep improving."] },
  leadership: { title: "Leadership", lead: "Leadership profiles will be added once approved for publication.", body: ["We do not publish unverified names, titles or biographies. Leadership information appears here when provided and approved."] },
  standards: { title: "Our Standards", lead: "Five commitments shape every engagement.", body: [] },
  "safety-quality": { title: "Safety & Quality", lead: "Safe work and verified results.", body: ["Safety culture and PPE · Chemical handling and SDS · Equipment safety · Training · Inspections · Documentation · Incident reporting · Corrective action · Continuous improvement.", "We keep claims factual and specific. Detailed procedures are available on request."] },
  technology: { title: "Technology", lead: "Technology supports the operation. It is not the product.", body: ["Assignment, service completion, inspection and documentation are recorded so that quality can be reviewed and performance measured.", "Technology works quietly in the background so people can focus on the physical work."] },
};

export function generateStaticParams() { return Object.keys(pages).map((k) => ({ slug: k ? [k] : [] })); }

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const key = slug?.[0] ?? "";
  const p = pages[key];
  if (!p || (slug && slug.length > 1)) notFound();
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "About", href: "/sco/about" }, ...(key ? [{ label: p.title }] : [])]} eyebrow="About" title={p.title} lead={p.lead} scene="office" />
      {p.body.length > 0 && <Reveal className="section" as="section"><div className="wrap two"><div><p className="eyebrow" data-in>Overview</p></div><div data-in style={{ display: "grid", gap: 22 }}>{p.body.map((b) => <p key={b} className="lead" style={{ maxWidth: "none", opacity: 1 }}>{b}</p>)}</div></div></Reveal>}
      {key === "standards" && (
        <Reveal className="section dark" as="section"><div className="wrap">{pillars.map((x, i) => (
          <div key={x.key} data-in style={{ display: "grid", gridTemplateColumns: "80px 1fr 1.2fr", gap: 24, padding: "36px 0", borderTop: "1px solid rgba(255,255,255,.18)", alignItems: "baseline" }}>
            <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span><h3 className="h-lg">{x.label}<em>.</em></h3><p className="lead">{x.line}</p>
          </div>
        ))}</div></Reveal>
      )}
      {key === "" && <Reveal className="section dark" as="section"><div className="wrap"><p className="eyebrow" data-in>Explore</p><div style={{ marginTop: 24 }}>{[["Leadership", "/sco/about/leadership"], ["Our Standards", "/sco/about/standards"], ["Safety & Quality", "/sco/about/safety-quality"], ["Technology", "/sco/about/technology"], ["Careers", "/sco/careers"]].map(([l, h]) => <Link key={l} href={h} className="mega-link" style={{ fontSize: "1.6rem", padding: "22px 0", color: "#fff", borderColor: "rgba(255,255,255,.18)" }} data-in>{l}<span>→</span></Link>)}</div></div></Reveal>}
      <CtaBand />
    </>
  );
}
