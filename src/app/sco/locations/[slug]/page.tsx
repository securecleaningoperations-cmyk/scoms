import Link from "next/link";
import { notFound } from "next/navigation";
import Environment from "@/components/sco/Environment";
import { PageHero, Reveal, CtaBand } from "@/components/sco/templates";
import { regions, services, industries } from "@/lib/sco/content";

export function generateStaticParams() { return regions.map((r) => ({ slug: r.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const r = regions.find((x) => x.slug === slug);
  return r ? { title: `Commercial Cleaning in ${r.name}` } : {};
}

/** Reusable State template. County / City / Market / Service-Area pages reuse this layout with different `name`. */
export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = regions.find((x) => x.slug === slug);
  if (!r) notFound();
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "Locations", href: "/sco/locations" }, { label: r.name }]} eyebrow="Service area" title={<>Facility services in <em>{r.name}.</em></>} lead={`Commercial cleaning and facility services for organizations in ${r.name}. Contact us to confirm availability for your location.`} scene="government"
        cta={{ href: `/sco/request/consultation?location=${encodeURIComponent(r.name)}`, label: "Request Service in " + r.short }} />
      <Reveal className="section" as="section">
        <div className="wrap two">
          <div><p className="eyebrow" data-in>Available services</p><h2 className="h-lg" style={{ marginTop: 18 }} data-in>What we deliver in <em>{r.short}.</em></h2></div>
          <div data-in>{services.map((s) => <Link key={s.slug} href={`/sco/services/${s.slug}`} className="mega-link" style={{ fontSize: "1.15rem" }}>{s.title}<span>→</span></Link>)}</div>
        </div>
      </Reveal>
      <Reveal className="section dark" as="section">
        <div className="wrap">
          <p className="eyebrow" data-in>Industries</p>
          <div className="card-grid" style={{ marginTop: 28 }}>{industries.slice(0, 6).map((i) => <Link key={i.slug} href={`/sco/industries/${i.slug}`} className="card" data-in data-cursor="Explore"><Environment variant={i.scene} style={{ ["--clean" as string]: 0.9 }} /><div className="shade" /><div className="card-b"><h3>{i.title}</h3></div></Link>)}</div>
        </div>
      </Reveal>
      <CtaBand title={`Need service in ${r.name}?`} href={`/sco/request/consultation?location=${encodeURIComponent(r.name)}`} />
    </>
  );
}
