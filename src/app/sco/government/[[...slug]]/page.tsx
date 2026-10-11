import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, Reveal, CtaBand } from "@/components/sco/templates";
import RequestPage from "@/components/sco/RequestPage";
import { capabilitySteps } from "@/components/sco/forms-config";

const pages: Record<string, { title: string; lead: string; points: string[] }> = {
  "": { title: "Government Services", lead: "Structured, documented facility service for public-sector requirements.", points: ["Defined scope and schedules", "Service documentation", "Inspection records", "Procurement-ready information"] },
  procurement: { title: "Procurement", lead: "Information for procurement professionals evaluating facility-service providers.", points: ["Capability information on request", "Clear points of contact", "Defined service standards"] },
  "contract-support": { title: "Contract Support", lead: "Scope, schedules and standards defined clearly from the start.", points: ["Scope-of-work alignment", "Service-level expectations", "Reporting and documentation approach"] },
  capability: { title: "Request Our Capability Information", lead: "Tell us about your organization and requirement and we will send appropriate capability information.", points: [] },
  "vendor-information": { title: "Vendor Information", lead: "Vendor details for onboarding and registration. Contact us to request current information.", points: ["Company name: Secure Cleaning Operations Inc.", "Service areas: PA, MD, VA, DC", "Additional vendor details provided on request"] },
  compliance: { title: "Compliance", lead: "Documented processes and standards. We make no claims beyond what we can document.", points: ["Documented procedures", "Inspection and corrective-action approach", "Documentation available on request"] },
};

export function generateStaticParams() { return Object.keys(pages).map((k) => ({ slug: k ? [k] : [] })); }

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const key = slug?.[0] ?? "";
  const p = pages[key];
  if (!p || (slug && slug.length > 1)) notFound();
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Government & Procurement", href: "/sco/government" }, ...(key ? [{ label: p.title }] : [])]} eyebrow="Government & Procurement" title={p.title} lead={p.lead} scene="government" clean={0.85}
        cta={key === "capability" ? undefined : { href: "/sco/government/capability", label: "Request Capability Information" }} />
      {p.points.length > 0 && (
        <Reveal className="section" as="section"><div className="wrap two"><div><p className="eyebrow" data-in>Overview</p></div><ul className="cap-list" data-in style={{ gridTemplateColumns: "1fr" }}>{p.points.map((x) => <li key={x}>{x}</li>)}</ul></div></Reveal>
      )}
      {key === "" && (
        <Reveal className="section dark" as="section"><div className="wrap"><div className="gov-grid" style={{ marginTop: 0 }}>
          {Object.entries(pages).filter(([k]) => k).map(([k, v]) => <Link key={k} className="gov-c" href={`/sco/government/${k}`} data-in><div><h3>{v.title}</h3><p>{v.lead}</p></div></Link>)}
        </div></div></Reveal>
      )}
      {key === "capability" && (
        <Reveal className="section" as="section"><div className="wrap" data-in>
          <RequestPage id="capability" title="Capability information" steps={capabilitySteps} submitLabel="Request Capability Information" successTitle="Procurement inquiry sent." successBody="Thank you. We'll respond with the capability information appropriate to your requirement." next={{ href: "/sco/government", label: "Government & Procurement" }} />
        </div></Reveal>
      )}
      {key !== "capability" && <CtaBand title="Start a procurement conversation." label="Request Capability Information" href="/sco/government/capability" />}
    </>
  );
}
