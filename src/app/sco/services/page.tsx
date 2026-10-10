import Link from "next/link";
import Environment from "@/components/sco/Environment";
import { PageHero, Reveal, CtaBand } from "@/components/sco/templates";
import { services } from "@/lib/sco/content";

export const metadata = { title: "Services" };

export default function Services() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "Services" }]} eyebrow="Services" title={<>Thirteen service lines. <em>One standard.</em></>} lead="From daily commercial care to post-construction transformation — each service shares the same people, process and accountability." scene="office" />
      <Reveal className="section" as="section">
        <div className="wrap card-grid">
          {services.map((s) => (
            <Link key={s.slug} href={`/sco/services/${s.slug}`} className="card" data-in data-cursor="Explore">
              <Environment variant={s.scene} style={{ ["--clean" as string]: 0.92 }} /><div className="shade" />
              <div className="card-b"><h3>{s.title}</h3><p>{s.short}</p></div>
            </Link>
          ))}
        </div>
      </Reveal>
      <CtaBand />
    </>
  );
}
