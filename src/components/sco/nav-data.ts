import { services, industries, regions } from "@/lib/sco/content";
import type { SceneVariant } from "@/lib/sco/content";

export interface NavGroup {
  key: string; label: string; href: string; blurb: string; scene: SceneVariant;
  cols: 2 | 3; links: { label: string; href: string }[];
}

export const nav: NavGroup[] = [
  { key: "about", label: "About", href: "/sco/about", blurb: "An operating approach built on five commitments.", scene: "office", cols: 2, links: [
    { label: "About SCO", href: "/sco/about" }, { label: "Leadership", href: "/sco/about/leadership" },
    { label: "Our Standards", href: "/sco/about/standards" }, { label: "Safety & Quality", href: "/sco/about/safety-quality" },
    { label: "Technology", href: "/sco/about/technology" }, { label: "Careers", href: "/sco/careers" },
  ] },
  { key: "services", label: "Services", href: "/sco/services", blurb: "Thirteen service lines, one accountable standard.", scene: "office", cols: 3,
    links: services.map((s) => ({ label: s.title, href: `/sco/services/${s.slug}` })) },
  { key: "industries", label: "Industries", href: "/sco/industries", blurb: "One identity. Environments that change around it.", scene: "healthcare", cols: 2,
    links: industries.map((i) => ({ label: i.title, href: `/sco/industries/${i.slug}` })) },
  { key: "locations", label: "Locations", href: "/sco/locations", blurb: "Serving Pennsylvania, Maryland, Virginia and Washington, DC.", scene: "government", cols: 2,
    links: [...regions.map((r) => ({ label: r.name, href: `/sco/locations/${r.slug}` })), { label: "Find Your Service Area", href: "/sco/find-services" }] },
  { key: "gov", label: "Government & Procurement", href: "/sco/government", blurb: "A procurement-ready entry point.", scene: "government", cols: 2, links: [
    { label: "Government Services", href: "/sco/government" }, { label: "Procurement", href: "/sco/government/procurement" },
    { label: "Contract Support", href: "/sco/government/contract-support" }, { label: "Capability Information", href: "/sco/government/capability" },
    { label: "Vendor Information", href: "/sco/government/vendor-information" }, { label: "Compliance", href: "/sco/government/compliance" },
  ] },
  { key: "careers", label: "Careers", href: "/sco/careers", blurb: "Join Secure Cleaning Operations.", scene: "education", cols: 2, links: [
    { label: "Careers", href: "/sco/careers" }, { label: "Open Positions", href: "/sco/careers/positions" },
    { label: "Career Paths", href: "/sco/careers/paths" }, { label: "Apply", href: "/sco/careers/apply" },
    { label: "Applicant Login", href: "/sco/careers/dashboard" },
  ] },
  { key: "resources", label: "Resources", href: "/sco/resources", blurb: "Guides, insights and answers.", scene: "hospitality", cols: 2, links: [
    { label: "Insights", href: "/sco/resources" }, { label: "Cleaning Resources", href: "/sco/resources" },
    { label: "Facility Resources", href: "/sco/resources" }, { label: "FAQs", href: "/sco/resources#faqs" },
  ] },
  { key: "contact", label: "Contact", href: "/sco/contact", blurb: "Choose the right path.", scene: "office", cols: 2, links: [
    { label: "Request Service", href: "/sco/request/service" }, { label: "Request Consultation", href: "/sco/request/consultation" },
    { label: "Request Proposal", href: "/sco/request/proposal" }, { label: "General Contact", href: "/sco/contact" },
    { label: "Media", href: "/sco/contact#media" }, { label: "Procurement", href: "/sco/government/procurement" },
  ] },
];
