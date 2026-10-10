import Link from "next/link";
import Environment from "@/components/sco/Environment";
import { PageHero, Reveal, CtaBand } from "@/components/sco/templates";
import { industries } from "@/lib/sco/content";

export const metadata = { title: "Industries" };

export default function Industries() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "Industries" }]} eyebrow="Industries" title={<>One identity. <em>Many environments.</em></>} lead="The atmosphere changes with the facility. The standard does not." scene="healthcare" />
      <Reveal className="section" as="section">
        <div className="wrap card-grid">
          {industries.map((i) => (
            <Link key={i.slug} href={`/sco/industries/${i.slug}`} className="card" data-in data-cursor="Explore"><Environment variant={i.scene} style={{ ["--clean" as string]: 0.92 }} /><div className="shade" /><div className="card-b"><h3>{i.title}</h3><p>{i.line}</p></div></Link>
          ))}
        </div>
      </Reveal>
      <CtaBand />
    </>
  );
}
