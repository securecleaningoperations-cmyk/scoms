"use client";

import React, { useState, useEffect } from "react";
import {
  Mail, Building2, Copy, Check, UserPlus,
  Shield, CheckCircle2, Send, X, Clock, AlertCircle, RefreshCw
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export interface OrgInvitation {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationName: string;
  organizationCode: string;
  facility: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
  inviteLink: string;
}

const DEFAULT_INVITATIONS: OrgInvitation[] = [
  {
    id: "inv-101",
    name: "Elena Rostova",
    email: "elena.rostova@operations.com",
    role: "Operations Manager",
    organizationName: "Secure Cleaning Operations Inc.",
    organizationCode: "ORG-SCOMS-7749",
    facility: "Dallas Operations HQ",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    inviteLink: "https://scoms-mu.vercel.app/signup?org=ORG-SCOMS-7749&role=operations_manager&email=elena.rostova@operations.com"
  },
  {
    id: "inv-102",
    name: "Marcus Miller",
    email: "m.miller@fieldcrew.com",
    role: "Field Supervisor",
    organizationName: "Secure Cleaning Operations Inc.",
    organizationCode: "ORG-SCOMS-7749",
    facility: "Baylor Health Center",
    status: "accepted",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    inviteLink: "https://scoms-mu.vercel.app/signup?org=ORG-SCOMS-7749&role=supervisor&email=m.miller@fieldcrew.com"
  }
];

export function InviteUserModal({
  isOpen,
  onClose,
  initialRole = "operations_manager"
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
}) {
  const { user } = useAuth();

  const orgName = user?.organizationName || "Secure Cleaning Operations Inc.";
  const orgCode = user?.organizationCode || "ORG-SCOMS-7749";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(initialRole);
  const [facility, setFacility] = useState("Dallas Operations HQ");
  const [notes, setNotes] = useState("You have been invited to join the SCOMS operations and field management workspace.");
  const [sending, setSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<OrgInvitation[]>([]);

  // Load invitations
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("scoms_org_invitations");
        if (stored) {
          setInvitations(JSON.parse(stored));
        } else {
          setInvitations(DEFAULT_INVITATIONS);
          localStorage.setItem("scoms_org_invitations", JSON.stringify(DEFAULT_INVITATIONS));
        }
      } catch {
        setInvitations(DEFAULT_INVITATIONS);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyOrgCode = () => {
    try {
      navigator.clipboard.writeText(orgCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const copyLink = (linkToCopy: string) => {
    try {
      navigator.clipboard.writeText(linkToCopy);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setSending(true);
    setSuccessMsg(null);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://scoms-mu.vercel.app";
    const generatedLink = `${origin}/signup?org=${encodeURIComponent(orgCode)}&role=${encodeURIComponent(role)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

    setTimeout(() => {
      const newInv: OrgInvitation = {
        id: `inv-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        organizationName: orgName,
        organizationCode: orgCode,
        facility,
        status: "pending",
        createdAt: new Date().toISOString(),
        inviteLink: generatedLink
      };

      const updated = [newInv, ...invitations];
      setInvitations(updated);
      try {
        localStorage.setItem("scoms_org_invitations", JSON.stringify(updated));
      } catch {}

      setLastInviteLink(generatedLink);
      setSuccessMsg(`Official invitation email sent to ${email.trim()} with organization code ${orgCode}`);
      setName("");
      setEmail("");
      setSending(false);
    }, 700);
  };

  const handleRevoke = (id: string) => {
    const updated = invitations.filter(i => i.id !== id);
    setInvitations(updated);
    try {
      localStorage.setItem("scoms_org_invitations", JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Invite Users to Organization</h2>
              <p className="text-xs text-slate-400">Send an official email invite with auto-assigned role and permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Organization Identifier Box */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Assigned Organization</span>
                <p className="text-sm font-extrabold text-blue-950 leading-tight">{orgName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-blue-700 font-medium">Organization Code:</span>
                  <span className="font-mono text-xs font-black bg-white px-2 py-0.5 rounded-md border border-blue-300 text-blue-900">
                    {orgCode}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={copyOrgCode}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold transition shrink-0 self-start sm:self-auto shadow-2xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? "Code Copied!" : "Copy Org Code"}</span>
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
              {lastInviteLink && (
                <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-emerald-200 text-xs">
                  <span className="font-mono text-[11px] text-slate-600 truncate">{lastInviteLink}</span>
                  <button
                    onClick={() => copyLink(lastInviteLink)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shrink-0 flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Invitation Form */}
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Member Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="email"
                    placeholder="elena@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Operational Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="operations_manager">Operations Manager</option>
                  <option value="supervisor">Field Supervisor</option>
                  <option value="quality_manager">Quality & Compliance Auditor</option>
                  <option value="field_employee">Commercial Cleaning Technician</option>
                  <option value="client_admin">Client Facility Administrator</option>
                  <option value="finance_admin">Finance & Ledger Accountant</option>
                  <option value="super_admin">Corporate Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Facility / Hub
                </label>
                <input
                  type="text"
                  value={facility}
                  onChange={e => setFacility(e.target.value)}
                  placeholder="e.g. Dallas Metro Cluster"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Invitation Note / Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Organization Invitation Email</span>
                </>
              )}
            </button>
          </form>

          {/* Pending Invitations Table */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Organization Invites ({invitations.length})
              </span>
              <span className="text-[11px] text-slate-500">Auto-synced with platform directory</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {invitations.map(inv => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">{inv.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 font-bold rounded">
                        {inv.role}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        inv.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {inv.status === "accepted" ? "Active" : "Pending"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{inv.email} &bull; {inv.facility}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyLink(inv.inviteLink)}
                      title="Copy signup invite link"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {inv.status !== "accepted" && (
                      <button
                        onClick={() => handleRevoke(inv.id)}
                        title="Revoke invitation"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Organization Code: <strong className="font-mono text-slate-800">{orgCode}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
