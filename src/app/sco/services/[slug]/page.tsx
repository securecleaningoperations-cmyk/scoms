import Link from "next/link";
import { notFound } from "next/navigation";
import Environment from "@/components/sco/Environment";
import { PageHero, Reveal, Accordion, CtaBand } from "@/components/sco/templates";
import { services, industries, processSteps, regions } from "@/lib/sco/content";

export function generateStaticParams() { return services.map((s) => ({ slug: s.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.short } : {};
}

const actionLabel: Record<string, string> = { glass: "Glass cleaning", floor: "Floor machine", vacuum: "Vacuum pass", wipe: "Surface wipe", polish: "Polish & finish", construction: "Post-construction" };

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const related = services.filter((x) => x.slug !== s.slug && (x.scene === s.scene || x.action === s.action)).slice(0, 3);
  const inds = industries.filter((i) => i.services.includes(s.slug));

  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "Services", href: "/sco/services" }, { label: s.title }]} eyebrow={actionLabel[s.action]} title={s.title} lead={s.short} scene={s.scene}
        cta={{ href: `/sco/request/consultation?service=${s.slug}`, label: "Request a Consultation" }} cta2={{ href: "/sco/find-services", label: "Find Your Service Area" }} />

      <Reveal className="section" as="section">
        <div className="wrap two">
          <div><p className="eyebrow" data-in>Overview</p><h2 className="h-lg" style={{ marginTop: 18 }} data-in>What this service <em>covers.</em></h2></div>
          <ul className="cap-list" data-in>{s.capabilities.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </Reveal>

      <Reveal className="section dark" as="section">
        <div className="wrap two">
          <div><p className="eyebrow" data-in>Facility types</p><h2 className="h-lg" style={{ marginTop: 18 }} data-in>Where it is <em>delivered.</em></h2></div>
          <div data-in>
            <div className="chips" style={{ marginTop: 0 }}>{s.facilities.map((f) => <span className="chip" key={f}>{f}</span>)}</div>
            {inds.length > 0 && <p style={{ marginTop: 32, opacity: 0.8 }}>Industries: {inds.map((i, k) => <span key={i.slug}>{k > 0 && ", "}<Link className="tlink" href={`/sco/industries/${i.slug}`}>{i.title}</Link></span>)}</p>}
          </div>
        </div>
      </Reveal>

      <Reveal className="section" as="section">
        <div className="wrap">
          <p className="eyebrow" data-in>Process</p>
          <h2 className="h-lg" style={{ margin: "18px 0 40px" }} data-in>How every service is <em>run.</em></h2>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24 }}>
            {processSteps.map((p, i) => <li key={p.label} data-in style={{ borderTop: "1px solid var(--ink)", paddingTop: 14 }}><span className="eyebrow" style={{ fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span><h3 className="h-md" style={{ margin: "10px 0 6px" }}>{p.label}</h3><p style={{ opacity: 0.7, fontSize: ".9rem" }}>{p.line}</p></li>)}
          </ol>
        </div>
      </Reveal>

      <Reveal className="section" as="section" style={{ background: "var(--paper2)" }}>
        <div className="wrap two">
          <div><p className="eyebrow" data-in>Service areas</p><h2 className="h-lg" style={{ marginTop: 18 }} data-in>Where we <em>serve.</em></h2></div>
          <div data-in style={{ display: "grid", gap: 0 }}>{regions.map((r) => <Link key={r.slug} href={`/sco/locations/${r.slug}`} className="mega-link" style={{ fontSize: "1.4rem", padding: "18px 0" }}>{r.name}<span>→</span></Link>)}</div>
        </div>
      </Reveal>

      <Reveal className="section" as="section">
        <div className="wrap two">
          <div><p className="eyebrow" data-in>FAQs</p><h2 className="h-lg" style={{ marginTop: 18 }} data-in>Common <em>questions.</em></h2></div>
          <div data-in><Accordion items={s.faqs} /></div>
        </div>
      </Reveal>

      {related.length > 0 && (
        <Reveal className="section" as="section" style={{ paddingTop: 0 }}>
          <div className="wrap"><p className="eyebrow" data-in style={{ marginBottom: 28 }}>Related services</p>
            <div className="card-grid">{related.map((r) => (
              <Link key={r.slug} href={`/sco/services/${r.slug}`} className="card" data-in data-cursor="Explore"><Environment variant={r.scene} style={{ ["--clean" as string]: 0.92 }} /><div className="shade" /><div className="card-b"><h3>{r.title}</h3></div></Link>
            ))}</div>
          </div>
        </Reveal>
      )}
      <CtaBand title={`Talk to us about ${s.title.toLowerCase()}.`} href={`/sco/request/consultation?service=${s.slug}`} />
    </>
  );
}
