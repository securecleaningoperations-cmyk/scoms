import Link from "next/link";
import Environment from "@/components/sco/Environment";
import { PageHero, Reveal, Accordion, EmptyState, CtaBand } from "@/components/sco/templates";
import { resources, services } from "@/lib/sco/content";

export const metadata = { title: "Resources" };

const faqs = [
  { q: "Where do you provide service?", a: "Pennsylvania, Maryland, Virginia and Washington, DC. Use Find Your Service Area to check your location." },
  { q: "How do I request service or a consultation?", a: "Use Request Service or Request a Consultation. We will follow up with next steps." },
  { q: "Can you work with a procurement process?", a: "Yes. Use the Government & Procurement section to request capability information." },
  { q: "Do you offer post-construction cleaning?", a: "Yes. See Post-Construction Cleaning, then request a proposal." },
];

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]} eyebrow="Resources" title={<>Guides, insights &amp; <em>answers.</em></>} lead="Planning aids for facility and procurement teams." scene="hospitality" />
      <Reveal className="section" as="section"><div className="wrap">
        <div className="card-grid">{resources.map((r, i) => <a key={r.slug} href={`#${r.slug}`} className="card" data-in data-cursor="Open"><Environment variant={(["office", "healthcare", "government", "hospitality"] as const)[i]} style={{ ["--clean" as string]: 0.9 }} /><div className="shade" /><div className="card-b"><h3>{r.title}</h3><p>{r.line}</p></div></a>)}</div>
      </div></Reveal>
      <Reveal className="section" as="section" style={{ background: "var(--paper2)" }}><div className="wrap" id="insights">
        <p className="eyebrow" data-in>Insights &amp; guides</p>
        <EmptyState title="No articles published yet" body="Articles and downloadable resources will appear here once approved. In the meantime, explore our services." cta={{ href: "/sco/services", label: "Explore Services" }} />
        <p style={{ textAlign: "center", opacity: 0.6, fontSize: ".9rem" }}>{services.length} services · 4 service areas</p>
      </div></Reveal>
      <Reveal className="section" as="section"><div className="wrap two" id="faqs"><div><p className="eyebrow" data-in>FAQs</p><h2 className="h-lg" style={{ marginTop: 18 }} data-in>Quick <em>answers.</em></h2></div><div data-in><Accordion items={faqs} /></div></div></Reveal>
      <CtaBand />
    </>
  );
}
