import Link from "next/link";
import { notFound } from "next/navigation";
import Environment from "@/components/sco/Environment";
import { PageHero, Reveal, EmptyState, CtaBand } from "@/components/sco/templates";
import RequestPage from "@/components/sco/RequestPage";
import { applicationSteps } from "@/components/sco/forms-config";

const roles = [
  { id: "cleaner", t: "Cleaner", d: "Perform defined cleaning services as part of a professional facility team.", uniform: "Blue company shirt, black tactical pants" },
  { id: "lead", t: "Lead Cleaner", d: "Guide a cleaning team and keep service to standard.", uniform: "Blue company shirt, black tactical pants" },
  { id: "floor", t: "Floor Care Technician", d: "Operate scrubbers and burnishers across commercial floors.", uniform: "Blue company shirt, black tactical pants" },
  { id: "sup", t: "Supervisor / Quality Manager", d: "Inspect, verify and document completed work.", uniform: "White company shirt, black tactical pants" },
  { id: "ops", t: "Operational Manager", d: "Oversee sites, people and performance.", uniform: "Black company shirt, black tactical pants" },
];
const paths = [["Cleaner", "Lead Cleaner", "Supervisor / Quality Manager", "Operational Manager"]];
const dash = [["Application status", "Under review"], ["Position", "Cleaner"], ["Location", "Maryland"], ["Progress", "Step 3 of 5"]];

export function generateStaticParams() { return [[], ["positions"], ["paths"], ["apply"], ["dashboard"]].map((slug) => ({ slug })); }

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const key = slug?.[0] ?? "";
  if (slug && slug.length > 1) notFound();
  const crumbs = [{ label: "Home", href: "/" }, { label: "Careers", href: "/sco/careers" }];

  if (key === "apply") return (
    <>
      <PageHero crumbs={[...crumbs, { label: "Apply" }]} eyebrow="Application" title={<>Start your <em>application.</em></>} lead="Sixteen short steps. Your progress saves automatically on this device so you can finish later." scene="education" clean={0.8} />
      <Reveal className="section" as="section"><div className="wrap" data-in><RequestPage id="careers" title="Application" steps={applicationSteps} submitLabel="Submit Application" successTitle="Application submitted." successBody="Thank you for applying. You can follow your application status in the applicant dashboard." next={{ href: "/sco/careers/dashboard", label: "Open Applicant Dashboard" }} /></div></Reveal>
    </>
  );

  if (key === "dashboard") return (
    <>
      <PageHero crumbs={[...crumbs, { label: "Applicant" }]} eyebrow="Applicant" title={<>Your <em>application.</em></>} lead="A preview of the applicant experience. Sign-in connects once the applicant system is enabled." scene="education" clean={0.7} />
      <Reveal className="section" as="section"><div className="wrap">
        <p className="alert" data-in>Preview mode — sample content only. Live applicant data requires the applicant backend to be connected.</p>
        <div className="gov-grid" style={{ marginTop: 28, background: "var(--line)", borderColor: "var(--line)" }}>{dash.map(([a, b]) => <div key={a} className="gov-c" style={{ gridColumn: "span 3", background: "var(--paper)", color: "var(--ink)", minHeight: 150 }} data-in><span className="n">{a}</span><h3>{b}</h3></div>)}</div>
        <div className="two" style={{ marginTop: 56 }}>
          <div data-in><h3 className="h-md">Missing information</h3><div style={{ marginTop: 18 }}><span className="badge warn">Action needed</span><p style={{ marginTop: 12, opacity: 0.75 }}>Upload a reference contact to complete your application.</p></div></div>
          <div data-in><h3 className="h-md">Documents &amp; messages</h3><EmptyState title="No messages yet" body="When our team writes to you or schedules an interview, it will appear here." /></div>
        </div>
      </div></Reveal>
    </>
  );

  if (key === "positions") return (
    <>
      <PageHero crumbs={[...crumbs, { label: "Open Positions" }]} eyebrow="Open positions" title={<>Find your <em>role.</em></>} lead="Role categories are shown below; open requisitions will list here when posted." scene="education" />
      <Reveal className="section" as="section"><div className="wrap">
        <div style={{ display: "grid", gap: 0, borderTop: "1px solid var(--ink)" }}>
          {roles.map((r) => (
            <Link key={r.id} href={`/sco/careers/apply`} className="loc-row" style={{ gridTemplateColumns: "1fr 1.2fr auto" }} data-in data-cursor="Apply"><h3 style={{ fontSize: "clamp(1.5rem,3vw,2.6rem)" }}>{r.t}</h3><p style={{ opacity: 0.75 }}>{r.d}</p><span className="tlink">Apply →</span></Link>
          ))}
        </div>
        <p style={{ marginTop: 32, opacity: 0.6, fontSize: ".9rem" }}>Specific openings and locations are confirmed during application.</p>
      </div></Reveal>
    </>
  );

  if (key === "paths") return (
    <>
      <PageHero crumbs={[...crumbs, { label: "Career Paths" }]} eyebrow="Career paths" title={<>Grow with <em>SCO.</em></>} lead="Defined roles, visible next steps." scene="education" />
      <Reveal className="section" as="section"><div className="wrap"><ol style={{ listStyle: "none", padding: 0, display: "grid", gap: 0 }}>
        {paths[0].map((p, i) => <li key={p} data-in style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 20, padding: "28px 0", borderBottom: "1px solid var(--line)", alignItems: "baseline" }}><span className="eyebrow" style={{ opacity: .6 }}>{String(i + 1).padStart(2, "0")}</span><h3 className="h-lg">{p}</h3></li>)}
      </ol></div></Reveal>
    </>
  );

  if (key !== "") notFound();
  return (
    <>
      <PageHero crumbs={[...crumbs]} eyebrow="Careers" title={<>Join <em>Secure Cleaning Operations.</em></>} lead="Build a career in professional facility services." scene="education" cta={{ href: "/sco/careers/positions", label: "View Open Positions" }} cta2={{ href: "/sco/careers/apply", label: "Start an Application" }} />
      <Reveal className="section" as="section"><div className="wrap two">
        <div><p className="eyebrow" data-in>Roles</p><h2 className="h-lg" style={{ marginTop: 18 }} data-in>Who you&apos;ll <em>work as.</em></h2></div>
        <div data-in>{roles.map((r) => <div key={r.id} style={{ padding: "20px 0", borderBottom: "1px solid var(--line)" }}><h3 className="h-md">{r.t}</h3><p style={{ opacity: .7, marginTop: 6 }}>{r.d}</p><p className="eyebrow" style={{ marginTop: 10, fontSize: 10.5 }}>{r.uniform}</p></div>)}</div>
      </div></Reveal>
      <Reveal className="section dark" as="section"><div className="wrap two"><div><p className="eyebrow" data-in>Applicant experience</p><h2 className="h-lg" style={{ marginTop: 18 }} data-in>From application to <em>interview.</em></h2></div>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }} data-in>{["Create an account", "Complete your application", "Track status in your dashboard", "Schedule an interview", "Upload documents"].map((s, i) => <li key={s} style={{ padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,.18)", display: "flex", gap: 18 }}><span className="eyebrow">{i + 1}</span>{s}</li>)}</ol></div></Reveal>
      <CtaBand title="Ready to apply?" label="Start an Application" href="/sco/careers/apply" />
      <span hidden><Environment /></span>
    </>
  );
}
