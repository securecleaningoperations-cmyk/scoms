import Link from "next/link";
import { PageHero, Reveal, CtaBand } from "@/components/sco/templates";
import { regions } from "@/lib/sco/content";

export const metadata = { title: "Locations" };

export default function Locations() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Locations" }]} eyebrow="Locations" title={<>Serving the <em>Mid-Atlantic.</em></>} lead="Pennsylvania, Maryland, Virginia and Washington, DC." scene="government" cta={{ href: "/sco/find-services", label: "Find Your Service Area" }} />
      <Reveal className="section loc" as="section">
        <div className="wrap"><div className="loc-list" style={{ marginTop: 0 }}>
          {regions.map((r) => <Link key={r.slug} href={`/sco/locations/${r.slug}`} className="loc-row" data-in data-cursor="View"><span className="abbr">{r.short}</span><h3>{r.name}</h3><span className="tlink">View →</span></Link>)}
        </div></div>
      </Reveal>
      <CtaBand />
    </>
  );
}
