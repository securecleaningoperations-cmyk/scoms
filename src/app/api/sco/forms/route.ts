import { NextResponse } from "next/server";

/**
 * Intake endpoint for the public website forms.
 * Validates and accepts submissions. Persistence/notification (CRM lead, email, Supabase insert)
 * still requires backend credentials — see SCO_WEBSITE.md. Until configured, submissions are only
 * logged server-side and the response says so via `stored: false`.
 */
const FORMS = new Set(["service", "consultation", "proposal", "capability", "procurement", "contact", "careers"]);

export async function POST(req: Request) {
  let data: { form?: string; values?: Record<string, string> };
  try { data = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!data.form || !FORMS.has(data.form) || typeof data.values !== "object" || !data.values) {
    return NextResponse.json({ error: "Unknown form" }, { status: 400 });
  }
  const email = data.values.email;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  console.info("[sco-form]", data.form, Object.keys(data.values).length, "fields");
  return NextResponse.json({ ok: true, stored: false });
}
