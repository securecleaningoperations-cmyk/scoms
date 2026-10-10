import Link from "next/link";
import { notFound } from "next/navigation";
import Environment from "@/components/sco/Environment";
import { PageHero, Reveal, CtaBand } from "@/components/sco/templates";
import { industries, services } from "@/lib/sco/content";

export function generateStaticParams() { return industries.map((i) => ({ slug: i.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const i = industries.find((x) => x.slug === slug);
  return i ? { title: `${i.title} Cleaning`, description: i.line } : {};
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = industries.find((x) => x.slug === slug);
  if (!ind) notFound();
  const svcs = ind.services.map((s) => services.find((x) => x.slug === s)!).filter(Boolean);
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "Industries", href: "/sco/industries" }, { label: ind.title }]} eyebrow="Industry" title={<>{ind.title} <em>solutions.</em></>} lead={ind.line} scene={ind.scene}
        cta={{ href: `/sco/request/consultation?industry=${ind.slug}`, label: `Explore ${ind.title} Solutions` }} />
      <Reveal className="section" as="section">
        <div className="wrap">
          <p className="eyebrow" data-in>Related services</p>
          <h2 className="h-lg" style={{ margin: "18px 0 40px" }} data-in>Services built for <em>{ind.title.toLowerCase()}.</em></h2>
          <div className="card-grid">{svcs.map((s) => (
            <Link key={s.slug} href={`/sco/services/${s.slug}`} className="card" data-in data-cursor="Explore"><Environment variant={s.scene} style={{ ["--clean" as string]: 0.92 }} /><div className="shade" /><div className="card-b"><h3>{s.title}</h3><p>{s.short}</p></div></Link>
          ))}</div>
        </div>
      </Reveal>
      <CtaBand title={`Let's discuss your ${ind.title.toLowerCase()} facility.`} href={`/sco/request/consultation?industry=${ind.slug}`} />
    </>
  );
}
