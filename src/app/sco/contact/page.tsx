import Link from "next/link";
import { PageHero, Reveal } from "@/components/sco/templates";
import RequestPage from "@/components/sco/RequestPage";
import { generalSteps } from "@/components/sco/forms-config";

export const metadata = { title: "Contact" };

const paths = [
  ["Request Service", "Tell us about your facility.", "/sco/request/service"],
  ["Request a Proposal", "Ready to discuss scope and pricing.", "/sco/request/proposal"],
  ["Procurement", "Government and procurement inquiries.", "/sco/government/capability"],
  ["Careers", "Applications and open positions.", "/sco/careers"],
];

export default function Page() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: "Contact" }]} eyebrow="Contact" title={<>Choose the <em>right path.</em></>} lead="Different needs deserve different conversations." scene="office" />
      <Reveal className="section" as="section">
        <div className="wrap">
          <div className="gov-grid" style={{ marginTop: 0, background: "var(--line)", borderColor: "var(--line)" }}>
            {paths.map(([t, d, h]) => <Link key={t} href={h} className="gov-c" style={{ gridColumn: "span 3", background: "var(--paper)", color: "var(--ink)" }} data-in><div><h3>{t}</h3><p>{d}</p></div><span className="tlink">Go →</span></Link>)}
          </div>
        </div>
      </Reveal>
      <Reveal className="section" as="section" style={{ background: "var(--paper2)" }}>
        <div className="wrap two" id="general">
          <div><p className="eyebrow" data-in>General &amp; media</p><h2 className="h-lg" style={{ marginTop: 18 }} id="media" data-in>Send us a <em>message.</em></h2></div>
          <div data-in><RequestPage id="contact" title="Contact" steps={generalSteps} submitLabel="Send Message" successTitle="Message sent." successBody="Thanks for reaching out. We'll reply as soon as we can." next={{ href: "/sco", label: "Back to Home" }} /></div>
        </div>
      </Reveal>
    </>
  );
}
