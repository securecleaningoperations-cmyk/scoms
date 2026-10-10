// Approved-content only. No invented clients, contracts, certifications, offices or statistics.

export type SceneVariant =
  | "office" | "healthcare" | "industrial" | "education"
  | "hospitality" | "government" | "construction" | "entertainment";

export interface Service {
  slug: string;
  title: string;
  short: string;
  scene: SceneVariant;
  action: "glass" | "floor" | "vacuum" | "wipe" | "polish" | "construction";
  capabilities: string[];
  facilities: string[];
  faqs: { q: string; a: string }[];
}

const commonFaq = (name: string) => [
  { q: `How do I request ${name.toLowerCase()}?`, a: "Use Request a Consultation. We review the facility, scope, frequency and location, then follow up with next steps." },
  { q: "Do you serve my location?", a: "We serve Pennsylvania, Maryland, Virginia and Washington, DC. Use Find Your Service Area to check a ZIP, city or county." },
  { q: "Can service be tailored to my facility?", a: "Yes. Scope, schedule and standards are defined with you during the consultation." },
];

export const services: Service[] = [
  { slug: "commercial-cleaning", title: "Commercial Cleaning", scene: "office", action: "vacuum",
    short: "Structured daily and periodic care for offices and shared commercial spaces.",
    capabilities: ["Office areas", "Common areas", "Restrooms", "Breakrooms", "High-touch surfaces", "Waste & recycling", "Floors", "Inspection"],
    facilities: ["Corporate offices", "Multi-tenant buildings", "Lobbies", "Retail centers"], faqs: commonFaq("Commercial cleaning") },
  { slug: "janitorial-services", title: "Janitorial Services", scene: "office", action: "wipe",
    short: "Recurring janitorial programs delivered to a defined scope and schedule.",
    capabilities: ["Nightly or daytime service", "Restroom care", "Trash removal", "Dusting & wiping", "Supply restocking", "Checklists"],
    facilities: ["Offices", "Schools", "Medical offices", "Mixed-use buildings"], faqs: commonFaq("Janitorial services") },
  { slug: "facility-services", title: "Facility Services", scene: "office", action: "polish",
    short: "Broader facility support coordinated alongside your cleaning program.",
    capabilities: ["Facility support coordination", "Scheduled & on-call tasks", "Supply management", "Service documentation"],
    facilities: ["Corporate", "Enterprise", "Multi-site portfolios"], faqs: commonFaq("Facility services") },
  { slug: "government-facility-services", title: "Government Facility Services", scene: "government", action: "wipe",
    short: "Structured, documented service for public-sector facility requirements.",
    capabilities: ["Defined scope & schedules", "Service documentation", "Inspection records", "Procurement-ready information"],
    facilities: ["Administrative buildings", "Public-facing facilities", "Office environments"], faqs: commonFaq("Government facility services") },
  { slug: "industrial-cleaning", title: "Industrial Cleaning", scene: "industrial", action: "floor",
    short: "Large-scale, safety-conscious cleaning for warehouses and manufacturing floors.",
    capabilities: ["Warehouse floors", "Auto-scrubbing", "Production-area cleaning", "Equipment-area cleaning", "Safety-conscious procedures"],
    facilities: ["Warehouses", "Manufacturing", "Distribution", "Industrial campuses"], faqs: commonFaq("Industrial cleaning") },
  { slug: "healthcare-cleaning", title: "Healthcare Cleaning", scene: "healthcare", action: "wipe",
    short: "Meticulous, calm, high-touch focused cleaning for care environments.",
    capabilities: ["High-touch surfaces", "Patient-area cleaning", "Restrooms", "Waiting areas", "Floors", "Documented checks"],
    facilities: ["Medical offices", "Clinics", "Outpatient facilities"], faqs: commonFaq("Healthcare cleaning") },
  { slug: "education-cleaning", title: "School & Education Cleaning", scene: "education", action: "vacuum",
    short: "Welcoming, dependable cleaning for classrooms, campuses and administration.",
    capabilities: ["Classrooms", "Administrative spaces", "Restrooms", "Common areas", "High-traffic areas", "Floor care"],
    facilities: ["Schools", "Universities", "Training centers"], faqs: commonFaq("Education cleaning") },
  { slug: "hospitality-cleaning", title: "Hospitality & Hotel Cleaning", scene: "hospitality", action: "polish",
    short: "Presentation-driven cleaning for hotels, event spaces and guest areas.",
    capabilities: ["Common areas", "Back-of-house", "Restrooms", "Event spaces", "Floor care"],
    facilities: ["Hotels", "Conference centers", "Event venues"], faqs: commonFaq("Hospitality cleaning") },
  { slug: "entertainment-cleaning", title: "Theater & Entertainment Cleaning", scene: "entertainment", action: "vacuum",
    short: "Fast turnover and post-event care for theaters, venues and lobbies.",
    capabilities: ["Seating areas", "Lobbies", "Restrooms", "Event turnover", "Post-event cleaning", "High-traffic areas"],
    facilities: ["Theaters", "Venues", "Arenas", "Lobbies"], faqs: commonFaq("Entertainment cleaning") },
  { slug: "post-construction-cleaning", title: "Post-Construction Cleaning", scene: "construction", action: "construction",
    short: "From construction complete to move-in ready: dust, glass, surfaces and floors.",
    capabilities: ["Dust removal", "Protective material removal", "Glass cleaning", "Surface finishing", "Floor transformation", "Final presentation check"],
    facilities: ["New builds", "Tenant fit-outs", "Renovations"], faqs: commonFaq("Post-construction cleaning") },
  { slug: "floor-care", title: "Floor Care", scene: "office", action: "floor",
    short: "Scrubbing, stripping, waxing, finishing, buffing and burnishing for hard floors.",
    capabilities: ["Floor scrubbing", "Stripping", "Waxing", "Finishing", "Buffing", "Burnishing", "Auto-scrubbing", "Hard-floor maintenance"],
    facilities: ["Lobbies", "Corridors", "Retail", "Healthcare", "Education"], faqs: commonFaq("Floor care") },
  { slug: "specialty-cleaning", title: "Specialty Cleaning", scene: "industrial", action: "wipe",
    short: "Project-based and specialized cleaning scoped to your requirement.",
    capabilities: ["Deep cleaning", "Periodic projects", "Detail work", "Custom scope"],
    facilities: ["Commercial", "Industrial", "Institutional"], faqs: commonFaq("Specialty cleaning") },
  { slug: "disinfection-high-touch", title: "Disinfection & High-Touch Cleaning", scene: "healthcare", action: "wipe",
    short: "Focused attention on frequently touched surfaces across your facility.",
    capabilities: ["Door hardware", "Elevator buttons", "Railings", "Shared surfaces", "Restrooms", "Scheduled rounds"],
    facilities: ["Offices", "Schools", "Medical offices", "Public facilities"], faqs: commonFaq("High-touch cleaning") },
];

export interface Industry { slug: string; title: string; line: string; scene: SceneVariant; services: string[]; }

export const industries: Industry[] = [
  { slug: "commercial", title: "Commercial", line: "Offices and shared buildings that must be ready every morning.", scene: "office", services: ["commercial-cleaning", "janitorial-services", "floor-care"] },
  { slug: "government", title: "Government", line: "Controlled, structured and documented service.", scene: "government", services: ["government-facility-services", "janitorial-services", "disinfection-high-touch"] },
  { slug: "industrial", title: "Industrial", line: "Large-scale, durable, safety-conscious operations.", scene: "industrial", services: ["industrial-cleaning", "floor-care", "specialty-cleaning"] },
  { slug: "healthcare", title: "Healthcare", line: "Bright, calm and meticulous care environments.", scene: "healthcare", services: ["healthcare-cleaning", "disinfection-high-touch", "floor-care"] },
  { slug: "education", title: "Education", line: "Professional, welcoming learning spaces.", scene: "education", services: ["education-cleaning", "floor-care", "janitorial-services"] },
  { slug: "hospitality", title: "Hospitality", line: "Polished, presentation-driven guest environments.", scene: "hospitality", services: ["hospitality-cleaning", "floor-care", "post-construction-cleaning"] },
  { slug: "entertainment", title: "Entertainment", line: "Dramatic venues, fast turnovers.", scene: "entertainment", services: ["entertainment-cleaning", "floor-care", "janitorial-services"] },
  { slug: "corporate", title: "Corporate", line: "Headquarters and campuses held to one standard.", scene: "office", services: ["commercial-cleaning", "facility-services", "floor-care"] },
  { slug: "construction", title: "Construction", line: "Complete projects, ready for occupancy.", scene: "construction", services: ["post-construction-cleaning", "floor-care", "specialty-cleaning"] },
  { slug: "enterprise", title: "Enterprise", line: "Multi-site programs with consistent accountability.", scene: "office", services: ["facility-services", "commercial-cleaning", "janitorial-services"] },
];

export interface Region { slug: string; name: string; short: string; markets: string[]; }

export const regions: Region[] = [
  { slug: "pennsylvania", name: "Pennsylvania", short: "PA", markets: ["Statewide service area"] },
  { slug: "maryland", name: "Maryland", short: "MD", markets: ["Statewide service area"] },
  { slug: "virginia", name: "Virginia", short: "VA", markets: ["Statewide service area"] },
  { slug: "washington-dc", name: "Washington, DC", short: "DC", markets: ["District-wide service area"] },
];

export const pillars = [
  { key: "people", label: "People", line: "Professional SCO personnel, trained and identifiable, become part of your environment." },
  { key: "process", label: "Process", line: "The service workflow is defined, assigned and visible from plan to improvement." },
  { key: "quality", label: "Quality", line: "Inspection and verification confirm the work before it is considered complete." },
  { key: "technology", label: "Technology", line: "Operational information supports the physical work, quietly and accurately." },
  { key: "accountability", label: "Accountability", line: "Completion is verified and documented, so the standard can be demonstrated." },
] as const;

export const processSteps = [
  { label: "Plan", line: "Understand the facility." },
  { label: "Assign", line: "Deploy appropriate people and resources." },
  { label: "Execute", line: "Perform defined services." },
  { label: "Verify", line: "Inspect completion and quality." },
  { label: "Document", line: "Record appropriate service information." },
  { label: "Measure", line: "Monitor performance." },
  { label: "Improve", line: "Improve service delivery." },
];

export const needOptions = [
  "Commercial Cleaning", "Facility Services", "Government Services", "Industrial Cleaning",
  "Healthcare Cleaning", "Education", "Hospitality", "Post-Construction", "Floor Care", "Specialty Cleaning",
];

export const needToSlug: Record<string, string> = {
  "Commercial Cleaning": "commercial-cleaning", "Facility Services": "facility-services",
  "Government Services": "government-facility-services", "Industrial Cleaning": "industrial-cleaning",
  "Healthcare Cleaning": "healthcare-cleaning", Education: "education-cleaning", Hospitality: "hospitality-cleaning",
  "Post-Construction": "post-construction-cleaning", "Floor Care": "floor-care", "Specialty Cleaning": "specialty-cleaning",
};

export const resources = [
  { slug: "insights", title: "Insights", line: "Perspective on facility operations and accountable service." },
  { slug: "cleaning-resources", title: "Cleaning Resources", line: "Guides on routine, periodic and specialty cleaning." },
  { slug: "facility-resources", title: "Facility Resources", line: "Planning aids for facility and procurement teams." },
  { slug: "faqs", title: "FAQs", line: "Quick answers about working with SCO." },
];

export const careerSteps = [
  "Account", "Personal", "Position", "Work Location", "Employment History", "Education",
  "Cleaning & Facility Experience", "Skills & Equipment", "Languages", "Availability",
  "Transportation", "Credentials", "Documents", "References", "Review", "Submit",
];

export const searchIndex = [
  ...services.map((s) => ({ group: "Services", title: s.title, href: `/sco/services/${s.slug}`, text: s.short })),
  ...industries.map((i) => ({ group: "Industries", title: i.title, href: `/sco/industries/${i.slug}`, text: i.line })),
  ...regions.map((r) => ({ group: "Locations", title: r.name, href: `/sco/locations/${r.slug}`, text: `${r.name} service area` })),
  { group: "Careers", title: "Careers", href: "/sco/careers", text: "Join Secure Cleaning Operations" },
  { group: "Careers", title: "Apply", href: "/sco/careers/apply", text: "Application experience" },
  { group: "Resources", title: "Resources", href: "/sco/resources", text: "Insights, guides and FAQs" },
  { group: "FAQs", title: "Frequently asked questions", href: "/sco/resources#faqs", text: "Answers about service and areas" },
];

export const COMPANY = {
  name: "Secure Cleaning Operations",
  inc: "Secure Cleaning Operations Inc.",
  headline: "Professional Commercial Cleaning & Facility Services Built for Critical Environments.",
};
