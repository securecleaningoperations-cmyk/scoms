import type { StepDef } from "./MultiStepForm";
import { services, careerSteps } from "@/lib/sco/content";

const svcOpts = services.map((s) => s.title);
const facilityTypes = ["Corporate office", "Government / public", "Healthcare", "Education", "Hospitality", "Industrial / warehouse", "Entertainment / venue", "Construction project", "Retail", "Other"];
const freq = ["One-time", "Daily", "Several times per week", "Weekly", "Bi-weekly", "Monthly", "To be determined"];
const sizes = ["Under 5,000 sq ft", "5,000 – 25,000", "25,000 – 100,000", "100,000+", "Not sure"];
const contactPrefs = ["Email", "Phone", "Either"];
const states = ["Pennsylvania", "Maryland", "Virginia", "Washington, DC", "Other"];

const contact = (): StepDef => ({ title: "Contact", blurb: "Who should we speak with?", fields: [
  { name: "name", label: "Full name", required: true }, { name: "organization", label: "Organization", required: true },
  { name: "email", label: "Business email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel" },
  { name: "contactPref", label: "Preferred contact method", type: "select", options: contactPrefs },
] });

export const serviceSteps: StepDef[] = [
  contact(),
  { title: "Facility", blurb: "Tell us about the facility.", fields: [
    { name: "facilityName", label: "Facility name" }, { name: "address", label: "Address or ZIP", required: true },
    { name: "state", label: "State", type: "select", options: states, required: true },
    { name: "facilityType", label: "Facility type", type: "select", options: facilityTypes, required: true },
    { name: "size", label: "Approximate size", type: "select", options: sizes },
  ] },
  { title: "Service", blurb: "What do you need?", fields: [
    { name: "service", label: "Service required", type: "select", options: svcOpts, required: true },
    { name: "frequency", label: "Frequency", type: "select", options: freq }, { name: "start", label: "Preferred start", type: "date" },
    { name: "provider", label: "Current provider (if applicable)" }, { name: "scope", label: "Scope", type: "textarea", full: true },
  ] },
  { title: "Details", blurb: "Anything else that helps.", fields: [
    { name: "message", label: "Message", type: "textarea" }, { name: "attachment", label: "Attachment", type: "file" },
  ] },
];

export const consultationSteps: StepDef[] = [
  { title: "Organization", fields: [{ name: "organization", label: "Organization", required: true }, { name: "facilityType", label: "Facility type", type: "select", options: facilityTypes, required: true }] },
  { title: "Contact", fields: [{ name: "name", label: "Full name", required: true }, { name: "email", label: "Business email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel" }] },
  { title: "Facility & service", fields: [
    { name: "location", label: "Location (city, ZIP or state)", required: true }, { name: "service", label: "Service", type: "select", options: svcOpts },
    { name: "frequency", label: "Frequency", type: "select", options: freq }, { name: "size", label: "Facility size", type: "select", options: sizes }, { name: "start", label: "Preferred start date", type: "date" },
  ] },
  { title: "Message", fields: [{ name: "message", label: "Message", type: "textarea" }, { name: "attachment", label: "Attachment", type: "file" }] },
];

export const proposalSteps: StepDef[] = [
  contact(),
  { title: "Facility & location", fields: [{ name: "facilityName", label: "Facility name" }, { name: "location", label: "Location", required: true }, { name: "facilityType", label: "Facility type", type: "select", options: facilityTypes }, { name: "sqft", label: "Square footage", type: "number", min: 0 }] },
  { title: "Scope", fields: [{ name: "service", label: "Service", type: "select", options: svcOpts, required: true }, { name: "frequency", label: "Frequency", type: "select", options: freq }, { name: "start", label: "Preferred start", type: "date" }, { name: "scope", label: "Scope", type: "textarea", full: true }] },
  { title: "Solicitation", blurb: "If this is a formal solicitation.", fields: [{ name: "solicitation", label: "Solicitation number" }, { name: "deadline", label: "Response deadline", type: "date" }, { name: "attachment", label: "Attachments", type: "file" }, { name: "message", label: "Message", type: "textarea" }] },
];

export const capabilitySteps: StepDef[] = [
  { title: "Your details", fields: [{ name: "name", label: "Name", required: true }, { name: "organization", label: "Organization", required: true }, { name: "email", label: "Business email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel" }, { name: "orgType", label: "Organization type", type: "select", options: ["Federal", "State", "Local / municipal", "Education", "Prime contractor", "Other"] }] },
  { title: "Requirement", fields: [{ name: "interest", label: "Procurement interest", type: "select", options: ["Capability information", "Vendor onboarding", "Contract support", "Bid / solicitation"] }, { name: "service", label: "Service requirement", type: "select", options: svcOpts }, { name: "location", label: "Location" }, { name: "message", label: "Message", type: "textarea" }, { name: "attachment", label: "Attachment", type: "file" }] },
];

export const contactPaths = [
  { key: "service", label: "Request Service", href: "/sco/request/service" },
  { key: "procurement", label: "Procurement", href: "/sco/government/capability" },
  { key: "careers", label: "Careers", href: "/sco/careers" },
  { key: "media", label: "Media", href: "#media" },
  { key: "contact", label: "General Contact", href: "#general" },
];
export const generalSteps: StepDef[] = [{ title: "Message", fields: [{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "topic", label: "Topic", type: "select", options: ["General question", "Media inquiry", "Location not listed", "Other"] }, { name: "message", label: "Message", type: "textarea", required: true }] }];

const sectionFields: Record<string, StepDef["fields"]> = {
  Account: [{ name: "email", label: "Email", type: "email", required: true }, { name: "password", label: "Create a password", type: "text", placeholder: "Set on submission" }],
  Personal: [{ name: "firstName", label: "First name", required: true }, { name: "lastName", label: "Last name", required: true }, { name: "phone", label: "Phone", type: "tel", required: true }, { name: "city", label: "City / ZIP" }],
  Position: [{ name: "position", label: "Position of interest", type: "select", options: ["Cleaner", "Lead Cleaner", "Floor Care Technician", "Supervisor", "Quality Manager", "Operations Manager", "Other"], required: true }],
  "Work Location": [{ name: "state", label: "Preferred state", type: "select", options: states.slice(0, 4) }, { name: "radius", label: "Willing to travel (miles)", type: "number", min: 0 }],
  "Employment History": [{ name: "lastEmployer", label: "Most recent employer" }, { name: "lastTitle", label: "Title" }, { name: "lastDates", label: "Dates" }, { name: "lastDuties", label: "Responsibilities", type: "textarea" }],
  Education: [{ name: "education", label: "Highest education", type: "select", options: ["High school / GED", "Some college", "Associate", "Bachelor", "Trade / technical", "Other"] }],
  "Cleaning & Facility Experience": [{ name: "years", label: "Years of experience", type: "number", min: 0 }, { name: "envs", label: "Environments", type: "checks", options: ["Office", "Healthcare", "School", "Hotel", "Industrial", "Construction"] }],
  "Skills & Equipment": [{ name: "equip", label: "Equipment experience", type: "checks", options: ["Auto scrubber", "Burnisher", "Floor stripping", "Carpet extractor", "Window cleaning", "Backpack vacuum"] }],
  Languages: [{ name: "languages", label: "Languages", type: "checks", options: ["English", "Español", "Other"] }],
  Availability: [{ name: "shift", label: "Preferred shift", type: "select", options: ["Day", "Evening", "Overnight", "Flexible"] }, { name: "startDate", label: "Earliest start date", type: "date" }],
  Transportation: [{ name: "transport", label: "Reliable transportation?", type: "select", options: ["Yes", "No", "Sometimes"] }, { name: "license", label: "Driver's license?", type: "select", options: ["Yes", "No"] }],
  Credentials: [{ name: "creds", label: "Credentials", type: "checks", options: ["OSHA training", "Floor care certification", "First aid", "Other"] }],
  Documents: [{ name: "resume", label: "Résumé", type: "file" }, { name: "docs", label: "Supporting documents", type: "file" }],
  References: [{ name: "refName", label: "Reference name" }, { name: "refPhone", label: "Reference phone", type: "tel" }],
  Review: [{ name: "notes", label: "Anything you'd like us to know?", type: "textarea" }],
  Submit: [{ name: "consent", label: "I confirm the information is accurate", type: "select", options: ["I confirm"], required: true }],
};
export const applicationSteps: StepDef[] = careerSteps.map((t) => ({ title: t, fields: sectionFields[t] ?? [] }));
