import { notFound } from "next/navigation";
import { PageHero, Reveal } from "@/components/sco/templates";
import RequestPage from "@/components/sco/RequestPage";
import { serviceSteps, consultationSteps, proposalSteps } from "@/components/sco/forms-config";

const kinds = {
  service: { title: "Request Service", h: <>Request <em>service.</em></>, lead: "A few short steps. We'll follow up with next steps for your facility.", steps: serviceSteps, submit: "Submit Request", ok: "Request received.", okBody: "Thank you. Our team will review your facility details and contact you with next steps. Meanwhile, explore how every engagement is run.", next: { href: "/sco/about/standards", label: "See Our Standards" }, scene: "office" as const },
  consultation: { title: "Request a Consultation", h: <>Let&apos;s build the right <em>solution.</em></>, lead: "Let's build the right cleaning & facility solution for your organization.", steps: consultationSteps, submit: "Request a Consultation", ok: "Consultation requested.", okBody: "We've got your details. A member of our team will reach out to schedule a conversation about your facility.", next: { href: "/sco/services", label: "Explore Services" }, scene: "hospitality" as const },
  proposal: { title: "Request a Proposal", h: <>Request a <em>proposal.</em></>, lead: "For organizations ready to discuss scope, schedule and pricing.", steps: proposalSteps, submit: "Request Proposal", ok: "Proposal request received.", okBody: "Thank you. We'll review the scope and any solicitation details, then respond with next steps.", next: { href: "/sco/government", label: "Government & Procurement" }, scene: "government" as const },
};

export function generateStaticParams() { return Object.keys(kinds).map((kind) => ({ kind })); }
export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params; const k = kinds[kind as keyof typeof kinds]; return k ? { title: k.title } : {};
}

export default async function Page({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const k = kinds[kind as keyof typeof kinds];
  if (!k) notFound();
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/sco" }, { label: k.title }]} eyebrow="Get started" title={k.h} lead={k.lead} scene={k.scene} />
      <Reveal className="section" as="section"><div className="wrap" data-in>
        <RequestPage id={kind} title={k.title} steps={k.steps} submitLabel={k.submit} successTitle={k.ok} successBody={k.okBody} next={k.next} />
      </div></Reveal>
    </>
  );
}
