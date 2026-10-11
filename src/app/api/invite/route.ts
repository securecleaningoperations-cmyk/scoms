import { NextResponse } from "next/server";
import { verifyRole } from "@/lib/rbac";

const ADMIN_ROLES = ["super_admin", "corporate_admin", "operations_manager", "hr_manager", "executive"];
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Sends an organization invitation email (Resend REST API — set RESEND_API_KEY and optionally INVITE_FROM_EMAIL).
 * With Supabase configured the caller must be an admin; in demo mode (no Supabase) it is allowed so demos work.
 * Without an email key the invite link is still returned so the admin can share it manually.
 */
export async function POST(req: Request) {
  try {
    const supabaseOn = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseOn && req.headers.get("authorization")) {
      const auth = await verifyRole(req, ADMIN_ROLES);
      if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const { to, name, role, orgName, orgCode, facility, note, link, invitedBy } = await req.json();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || !link) {
      return NextResponse.json({ error: "A valid recipient email and invite link are required." }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      return NextResponse.json({ success: true, emailed: false, note: "Email provider not configured (set RESEND_API_KEY). Share the invite link manually." });
    }

    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
      <h2 style="margin:0 0 8px">You're invited to ${esc(orgName || "SCOMS")}</h2>
      <p>Hi ${esc(name || "there")}, ${esc(invitedBy || "your administrator")} invited you as <b>${esc(role || "team member")}</b>${facility ? ` at <b>${esc(facility)}</b>` : ""}.</p>
      ${note ? `<p style="color:#475569">${esc(note)}</p>` : ""}
      <p>Organization code: <code style="background:#eff6ff;padding:2px 8px;border-radius:6px">${esc(orgCode || "")}</code></p>
      <p><a href="${esc(link)}" style="display:inline-block;background:#1b63c4;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Accept invitation</a></p>
      <p style="font-size:12px;color:#64748b">If the button doesn't work, paste this link: ${esc(link)}</p></div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.INVITE_FROM_EMAIL || "SCOMS <onboarding@resend.dev>",
        to: [to], subject: `You're invited to join ${orgName || "SCOMS"}`, html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ success: false, emailed: false, error: `Email provider rejected the message: ${detail.slice(0, 200)}` }, { status: 502 });
    }
    return NextResponse.json({ success: true, emailed: true });
  } catch (e) {
    console.error("invite error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
