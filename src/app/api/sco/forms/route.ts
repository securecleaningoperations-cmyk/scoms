import { NextResponse } from "next/server";
import { jevJudgePhoneCall } from "@/lib/typesafe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Intake endpoint for every public website form.
 *
 * 1. Validates the payload (known form, email format, honeypot, size limits, basic rate limit).
 * 2. Uses Jev (TypeSafe System One) to triage the enquiry — the same routing engine as the
 *    AI phone agent — so a website message lands in the right SCOMS workflow
 *    (sales lead / service ticket / recruiting / urgent). Jev is advisory: the routing is stored
 *    with the record for human review and never triggers commitments.
 * 3. Sales-type submissions are written to `leads` when Supabase service credentials exist.
 *    If storage is unavailable the response says so honestly (`stored: false`).
 */
const FORMS = new Set(["service", "consultation", "proposal", "capability", "procurement", "contact", "careers", "quick"]);
const SALES_FORMS = new Set(["service", "consultation", "proposal", "capability", "procurement", "quick"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

const storageReady = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many submissions. Please wait a minute and try again." }, { status: 429 });

  let data: { form?: string; values?: Record<string, unknown> };
  try { data = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!data.form || !FORMS.has(data.form) || typeof data.values !== "object" || !data.values) {
    return NextResponse.json({ error: "Unknown form" }, { status: 400 });
  }

  // normalise to trimmed strings, cap sizes
  const v: Record<string, string> = {};
  for (const [k, raw] of Object.entries(data.values)) {
    if (k === "password") continue; // never store or forward credentials from public forms
    const s = Array.isArray(raw) ? raw.join(", ") : typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
    v[k] = s.trim().slice(0, 4000);
  }
  if (v.website) return NextResponse.json({ ok: true, stored: false }); // honeypot — silently accept bots
  if (v.email && !EMAIL.test(v.email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });

  // ── Jev triage ──
  const transcript = [
    `Website form: ${data.form}`,
    v.service && `Service requested: ${v.service}`,
    v.facilityType && `Facility type: ${v.facilityType}`,
    (v.size || v.sqft) && `Facility size: ${v.size || v.sqft}`,
    v.frequency && `Frequency: ${v.frequency}`,
    (v.location || v.address || v.state) && `Location: ${[v.location, v.address, v.state].filter(Boolean).join(", ")}`,
    v.topic && `Topic: ${v.topic}`,
    v.position && `Position of interest: ${v.position}`,
    (v.message || v.scope) && `Message: ${v.message || v.scope}`,
  ].filter(Boolean).join("\n");

  let triage: Awaited<ReturnType<typeof jevJudgePhoneCall>> | null = null;
  try {
    triage = await jevJudgePhoneCall({ transcript, callerHistory: { name: v.name || v.firstName } });
  } catch (e) {
    console.warn("[sco-form] Jev triage unavailable", e);
  }
  const route = data.form === "careers" ? "applicant_screening" : triage?.departmentRoute ?? (SALES_FORMS.has(data.form) ? "sales_lead" : "general_routing");
  const urgent = !!triage?.isEmergency || (triage?.urgencyRating ?? 0) >= 3;

  // ── Persist sales enquiries as leads ──
  let stored = false;
  if (storageReady() && (SALES_FORMS.has(data.form) || route === "sales_lead")) {
    const notes = [
      `[Website · ${data.form}]`,
      v.service && `Service: ${v.service}`,
      v.facilityType && `Facility: ${v.facilityType}`,
      (v.size || v.sqft) && `Size: ${v.size || v.sqft}`,
      v.frequency && `Frequency: ${v.frequency}`,
      (v.location || v.address) && `Location: ${v.location || v.address}${v.state ? ", " + v.state : ""}`,
      v.start && `Preferred start: ${v.start}`,
      (v.message || v.scope) && `Message: ${v.message || v.scope}`,
      triage && `Jev route: ${triage.departmentRoute} · urgency ${triage.urgencyRating}/4 (${triage.isLiveModel ? "live" : "calibrated fallback"})`,
    ].filter(Boolean).join("\n");
    try {
      const { error } = await supabaseAdmin.from("leads").insert([{
        company_name: v.organization || v.facilityName || v.name || "Website enquiry",
        contact_name: v.name || [v.firstName, v.lastName].filter(Boolean).join(" ") || null,
        email: v.email || null,
        phone: v.phone || null,
        source: "Website",
        status: "Prospect",
        notes,
      }]);
      stored = !error;
      if (error) console.warn("[sco-form] lead insert failed:", error.message);
    } catch (e) {
      console.warn("[sco-form] lead insert error", e);
    }
  }

  console.info("[sco-form]", data.form, Object.keys(v).length, "fields →", route, urgent ? "(urgent)" : "", stored ? "stored" : "not stored");

  const next =
    route === "applicant_screening" ? "Our recruiting team reviews every application and will contact you about next steps."
    : route === "service_ticket" ? "This looks like a service request for an existing site — it will be routed to the responsible supervisor."
    : route === "employee_support" ? "Employee requests are routed to operations management."
    : route === "sales_lead" ? "A member of our team will contact you to arrange a walkthrough and define scope."
    : "We'll review your message and reply by email during office hours (Mon–Fri, 10:00 AM – 5:30 PM).";

  return NextResponse.json({ ok: true, stored, route, urgent, next, ai: triage ? (triage.isLiveModel ? "jev" : "jev-fallback") : "none" });
}
