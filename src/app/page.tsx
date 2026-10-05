"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, CheckCircle2, ArrowRight, Building2, Users,
  PhoneCall, FileText, Calendar, Lock, BarChart3,
  Sparkles, Award, ClipboardCheck, ArrowUpRight,
  Headphones, Layers, Check, ExternalLink, MapPin,
  Bot, Clock, ShieldCheck, ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const [user, setUser] = useState<{ firstName: string; lastName: string; role: string; employeeId?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("scoms_active_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.firstName) {
            setUser(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to read user session:", e);
      }
    }
  }, []);

  const signOut = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("scoms_active_user");
        setUser(null);
        window.location.reload();
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* ── Top Announcement Banner ──────────────────────────────────── */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-center text-xs font-semibold text-blue-900 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>SCOMS v4.0 Master Enterprise System Active</span>
        <span className="text-blue-300 hidden sm:inline">•</span>
        <span className="hidden sm:inline">CMMC Level 2 &amp; GBAC Star Certified Operations</span>
        <span className="text-blue-300 hidden sm:inline">•</span>
        <span className="hidden md:inline font-mono text-[11px] text-blue-700">Official Hours: Mon–Fri 10:00 AM – 5:30 PM</span>
      </div>

      {/* ── Navigation Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5 font-display">
                SCOMS
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                  ENTERPRISE
                </span>
              </span>
              <p className="text-[11px] text-slate-500 tracking-wider font-semibold uppercase">
                Secure Cleaning Operations Inc.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#platform" className="hover:text-blue-600 transition-colors">Platform</a>
            <a href="#modules" className="hover:text-blue-600 transition-colors">Core Engines</a>
            <a href="#illustration" className="hover:text-blue-600 transition-colors">Facility Operations</a>
            <a href="#sectors" className="hover:text-blue-600 transition-colors">Industries</a>
            <a href="#portals" className="hover:text-blue-600 transition-colors">Portals</a>
          </nav>

          {/* Auth Actions (Dynamic based on Logged In Session) */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-500">Active:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[120px]">{user.firstName} {user.lastName}</span>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {user.employeeId || "EMP-0001"}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-slate-500 hover:text-rose-600 font-semibold px-2 py-1 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/portal/login"
                  className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-colors"
                >
                  Client Portal
                </Link>
                <Link
                  href="/employee/login"
                  className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-colors"
                >
                  Field App
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section (White / Light Theme) ────────────────────────── */}
      <section id="platform" className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 mb-8 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span>Secure Cleaning Operations Inc. • Enterprise Platform v4.0 &bull; Release 6.1</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.12]">
            Enterprise Facility Operations,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 mt-1">
              Workforce, Accounting &amp; AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            The mission-critical operations management system combining ERP, real-time field dispatch,
            immutable double-entry accounting, Twilio voice AI receptionist, electronic records, and government-grade CMMC compliance.
          </p>

          {/* Primary Call to Actions */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Resume Workspace ({user.firstName} • {user.employeeId || "Active"})</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard/onboarding"
                  className="inline-flex items-center gap-2 text-base font-bold bg-white hover:bg-slate-50 text-slate-800 px-6 py-3.5 rounded-xl border border-slate-300 shadow-xs transition-all"
                >
                  <span>Enterprise Onboarding</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Operations Portal</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-base font-bold bg-white hover:bg-slate-50 text-slate-800 px-7 py-3.5 rounded-xl border border-slate-300 shadow-xs transition-all"
                >
                  <span>Administrator Sign In</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </>
            )}
          </div>

          {/* ── Bespoke Enterprise Cleaning Hero Illustration ─────────── */}
          <div id="illustration" className="relative mt-14 max-w-5xl mx-auto">
            {/* Ambient subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-teal-400/10 rounded-3xl blur-2xl -z-10" />

            <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-2xl shadow-slate-900/10 transition-all">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src="/images/cleaning-hero-illustration.jpg"
                  alt="Secure Cleaning Operations Inc. Modern Enterprise Facility Operations and Commercial Cleaning"
                  className="w-full h-auto object-cover max-h-[520px] transition-transform duration-700 hover:scale-[1.01]"
                  loading="eager"
                />

                {/* Floating Chips on Illustration (Anti-Slop, High-Utility Telemetry) */}
                <div className="absolute top-4 left-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-xs font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Facility Operations Live</span>
                </div>

                <div className="absolute top-4 right-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-xs font-bold text-blue-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>GBAC Star &amp; CMMC Certified</span>
                </div>

                <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-xs font-semibold text-slate-700">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Twilio Voice AI Phone Agent: Active (24/7)</span>
                </div>

                <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-xs font-semibold text-slate-700">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Double-Entry Immutable General Ledger</span>
                </div>
              </div>

              {/* Caption Bar */}
              <div className="mt-3 px-3 py-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100">
                <span className="font-medium">Secure Cleaning Operations Inc. &bull; Architectural Commercial Facility Operations</span>
                <span className="font-mono text-[11px] font-semibold text-blue-700">ISO Class 5-8 Sterile Cleanroom &amp; Corporate Class A Ready</span>
              </div>
            </div>
          </div>

          {/* Operational Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">99.8%</div>
              <div className="text-xs text-slate-600 mt-1 font-semibold">GPS Geofenced Clock-In Accuracy</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">100%</div>
              <div className="text-xs text-slate-600 mt-1 font-semibold">Reversal-Only Immutable Ledger</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">24/7</div>
              <div className="text-xs text-slate-600 mt-1 font-semibold">Twilio AI Phone Receptionist</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">Level 2</div>
              <div className="text-xs text-slate-600 mt-1 font-semibold">CMMC &amp; DoD Readiness</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Master Architecture Pillars (White / Light Theme) ───────── */}
      <section id="modules" className="py-20 bg-slate-50/60 border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-blue-200">
              <Layers className="w-3.5 h-3.5" />
              <span>Full Enterprise Coverage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Consolidated Enterprise Engines
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              SCOMS replaces disjointed third-party software with one interconnected system of record for Secure Cleaning Operations Inc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Engine 1: Workforce */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Workforce &amp; GPS Attendance</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Geofence-verified mobile clock-in, automated route optimization, skill matrix tracking, OSHA certifications, and payroll hour calculation.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Geofenced clock-in validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Skills &amp; biohazard certifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Real-time crew dispatch &amp; route telemetry</span>
                </li>
              </ul>
            </div>

            {/* Engine 2: Accounting */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Full Accounting &amp; Ledger</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                QuickBooks-level general ledger with double-entry rules, reversal-only immutability, automated invoice generation, and real-time job costing.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Zero manual ledger edits (reversal only)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Gross margin &amp; profitability scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Automated 3-way invoice reconciliation</span>
                </li>
              </ul>
            </div>

            {/* Engine 3: AI Phone Agent */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Phone Agent (Twilio Voice)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                24/7 intelligent business receptionist handling customer triage, applicant screening, employee schedule calls, and vendor inquiries.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Automatic caller ID (client, staff, applicant)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Live transcription &amp; intent routing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Automated walkthrough &amp; callback booking</span>
                </li>
              </ul>
            </div>

            {/* Engine 4: Document Office */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enterprise Document Center</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SCOMS v6.1 digital filing cabinet preserving employee, client, vendor, corporate, financial, and operations records with official cover sheets.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Official company letterheads &amp; cover sheets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Audit-proof electronic signature logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Configurable retention &amp; legal archival</span>
                </li>
              </ul>
            </div>

            {/* Engine 5: Lead Intelligence & Bidding */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Lead Intelligence &amp; Bidding</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Commercial opportunity pipeline tracking from prospect to site walkthrough, AI scope-of-work generation, and precision bid calculations.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Full 10-stage commercial lead pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Facility square footage &amp; scope estimator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Silver/Gold/Platinum proposal generator</span>
                </li>
              </ul>
            </div>

            {/* Engine 6: Quality, CAPA & Defense */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quality &amp; CAPA Compliance</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hospital-grade and cleanroom inspection protocols, digital ATP surface swabs, incident escalation, and Corrective Action (CAPA) tracking.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>ATP swab validation &amp; QA pass rate audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Closed-loop CAPA mitigation workflows</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>OSHA, EPA &amp; DoD CMMC ready</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Targeted Industries & Readiness ─────────────────────────── */}
      <section id="sectors" className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for High-Consequence Facilities
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Secure Cleaning Operations Inc. delivers high-compliance cleaning for clients requiring background clearances, sterile protocol adherence, and audit verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { title: "Healthcare & Surgical", desc: "Hospital-grade terminal cleaning & infection control (OSHA 1910.1030)." },
              { title: "Commercial Cleanrooms", desc: "ISO Class 5-8 sterile airlock & gowning protocol compliance." },
              { title: "Defense & Cleared Sites", desc: "DoD Secret & CMMC Level 2 facility escorted egress execution." },
              { title: "Corporate Class A", desc: "Multi-tenant office headquarters, LEED and GBAC Star certifications." },
            ].map((sector) => (
              <div key={sector.title} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                <Building2 className="w-6 h-6 text-blue-600 mb-3" />
                <h4 className="text-base font-bold text-slate-900 mb-1.5">{sector.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{sector.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Portals Section (Light Theme) ────────────────────────── */}
      <section id="portals" className="py-20 bg-slate-50/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Integrated Multi-Stakeholder Portals
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Role-tailored interfaces ensure executives, field cleaners, and facility managers access the right tools securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ops Card */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all">
              <div>
                <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600 mb-5 border border-blue-200">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Executive &amp; Operations ERP</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  For administrators, supervisors, dispatchers, and accountants. Full access to job dispatch, finance, documents, and compliance engines.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20"
              >
                <span>Launch Operations Suite</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Employee Card */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all">
              <div>
                <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-5 border border-emerald-200">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Field Staff Mobile App</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  For field cleaners and route technicians. Geofenced GPS clock-in, job task checklists, chemical safety SDS sheets, and inspection uploads.
                </p>
              </div>
              <Link
                href="/employee/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold border border-slate-300 transition-all"
              >
                <span>Employee Mobile Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Client Card */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all">
              <div>
                <div className="p-3 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-5 border border-indigo-200">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Client Self-Service Portal</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  For commercial property managers. Live inspection pass rates, cleaning schedule tracking, on-demand work requests, and invoice payment.
                </p>
              </div>
              <Link
                href="/portal/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold border border-slate-300 transition-all"
              >
                <span>Client Portal Access</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Corporate Footer (Clean Light Theme) ─────────────────────── */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Secure Cleaning Operations Inc.</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Commercial cleaning &amp; facility management enterprise platform. Built for compliance, security, and mission-critical scale.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Corporate Office</h5>
              <p className="text-slate-600">Secure Cleaning Operations Inc.</p>
              <p className="text-slate-600">Dallas – Fort Worth Regional Headquarters</p>
              <p className="text-slate-600 font-semibold">Office Hours: Mon – Fri, 10:00 AM – 5:30 PM</p>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">System Portals</h5>
              <ul className="space-y-1.5 font-medium">
                <li><Link href="/login" className="hover:text-blue-600">Operations Sign In</Link></li>
                <li><Link href="/employee/login" className="hover:text-blue-600">Field Employee App</Link></li>
                <li><Link href="/portal/login" className="hover:text-blue-600">Client Portal</Link></li>
                <li><Link href="/signup" className="hover:text-blue-600">Request Enterprise Access</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Compliance &amp; Certifications</h5>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs">CMMC Level 2 Ready</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs">OSHA 1910.1030</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs">GBAC Star Master</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs">Twilio Voice AI</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>&copy; {new Date().getFullYear()} Secure Cleaning Operations Inc. All rights reserved.</p>
            <p className="font-mono text-[11px] text-slate-500">SCOMS Platform Architecture v4.0 &bull; Release 6.1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
