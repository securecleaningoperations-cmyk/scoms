"use client";

import Link from "next/link";
import {
  Shield, CheckCircle2, ArrowRight, Building2, Users,
  PhoneCall, FileText, Calendar, Lock, BarChart3,
  Sparkles, Award, ClipboardCheck, ArrowUpRight,
  Headphones, Layers, Check, ExternalLink
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* ── Top Announcement Banner ──────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-blue-900/60 border-b border-blue-500/20 px-4 py-2 text-center text-xs font-medium text-blue-200 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>SCOMS v4.0 Master Enterprise System Active</span>
        <span className="text-blue-400 hidden sm:inline">•</span>
        <span className="hidden sm:inline">CMMC Level 2 &amp; GBAC Star Certified Operations</span>
      </div>

      {/* ── Navigation Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5 font-display">
                SCOMS
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
                  ENTERPRISE
                </span>
              </span>
              <p className="text-[11px] text-slate-400 tracking-wider font-medium uppercase">
                Secure Cleaning Operations
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#modules" className="hover:text-white transition-colors">Core Engines</a>
            <a href="#sectors" className="hover:text-white transition-colors">Industries</a>
            <a href="#compliance" className="hover:text-white transition-colors">Security &amp; Compliance</a>
            <a href="#portals" className="hover:text-white transition-colors">Portals</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/portal/login"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-700/60 hover:border-slate-600 transition-colors"
            >
              Client Portal
            </Link>
            <Link
              href="/employee/login"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-700/60 hover:border-slate-600 transition-colors"
            >
              Field App
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 mb-8 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-400" />
            <span>Secure Cleaning Operations Inc. • Enterprise Platform v4.0</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
            Enterprise Facility Operations,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
              Workforce, Accounting &amp; AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The mission-critical operations management system combining ERP, field dispatch,
            immutable accounting, Twilio voice intelligence, electronic records, and government-grade CMMC compliance.
          </p>

          {/* Primary Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Access Operations Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#modules"
              className="inline-flex items-center gap-2 text-base font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white px-7 py-4 rounded-xl border border-slate-700/80 transition-all"
            >
              <span>Explore Master Spec</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Operational Metrics Bar */}
          <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono">99.8%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">GPS Geofenced Clock-In Accuracy</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Reversal-Only Immutable Ledger</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono">24/7</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Twilio AI Phone Receptionist</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono">Level 2</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">CMMC &amp; DoD Readiness</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Master Architecture Pillars ──────────────────────────────── */}
      <section id="modules" className="py-20 bg-slate-900/50 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-3">
              <Layers className="w-4 h-4" />
              <span>Full Enterprise Coverage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Consolidated Enterprise Engines
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              SCOMS replaces disjointed third-party software with one interconnected system of record for Secure Cleaning Operations Inc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Engine 1: Workforce */}
            <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Workforce &amp; GPS Attendance</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Geofence-verified mobile clock-in, automated route optimization, skill matrix tracking, OSHA certifications, and payroll hour calculation.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Geofenced clock-in validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Skills &amp; biohazard certifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Real-time crew dispatch &amp; route telemetry</span>
                </li>
              </ul>
            </div>

            {/* Engine 2: Accounting */}
            <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Full Accounting &amp; Ledger</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                QuickBooks-level general ledger with double-entry rules, reversal-only immutability, automated invoice generation, and real-time job costing.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>Zero manual ledger overrides (reversal only)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>Gross margin &amp; profitability scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>Automated 3-way invoice reconciliation</span>
                </li>
              </ul>
            </div>

            {/* Engine 3: AI Phone Agent */}
            <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Phone Agent (Twilio Voice)</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                24/7 intelligent business receptionist handling inbound customer triage, applicant screening, employee schedule calls, and vendor inquiries.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Automatic caller ID (client, staff, applicant)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Live transcription &amp; intent routing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Automated appointment &amp; walkthrough booking</span>
                </li>
              </ul>
            </div>

            {/* Engine 4: Document Office */}
            <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Enterprise Document Center</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                SCOMS v6.1 digital filing cabinet preserving employee, client, vendor, corporate, financial, and operations records with official cover sheets.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Official company letterheads &amp; cover sheets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Audit-proof electronic signature logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Configurable retention &amp; legal archival</span>
                </li>
              </ul>
            </div>

            {/* Engine 5: Lead Intelligence & Bidding */}
            <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lead Intelligence &amp; Bidding</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Commercial opportunity pipeline tracking from prospect to site walkthrough, AI scope-of-work generation, and precision bid calculations.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span>Full 10-stage commercial lead pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span>Facility square footage &amp; scope estimator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span>Silver/Gold/Platinum proposal generator</span>
                </li>
              </ul>
            </div>

            {/* Engine 6: Quality, CAPA & Defense */}
            <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quality &amp; CAPA Compliance</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Hospital-grade and cleanroom inspection protocols, digital ATP surface swabs, incident escalation, and Corrective Action (CAPA) tracking.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>ATP swab validation &amp; QA pass rate audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>Closed-loop CAPA mitigation workflows</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>OSHA, EPA &amp; DoD CMMC ready</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Targeted Industries & Readiness ─────────────────────────── */}
      <section id="sectors" className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Designed for High-Consequence Facilities
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Secure Cleaning Operations Inc. delivers high-compliance cleaning for clients requiring background clearances, sterile protocol adherence, and audit verification.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Healthcare & Surgical", desc: "Hospital-grade terminal cleaning & infection control (OSHA 1910.1030)." },
              { title: "Commercial Cleanrooms", desc: "ISO Class 5-8 sterile airlock & gowning protocol compliance." },
              { title: "Defense & Cleared Sites", desc: "DoD Secret & CMMC Level 2 facility escorted egress execution." },
              { title: "Corporate Class A", desc: "Multi-tenant office headquarters, LEED and GBAC Star certifications." },
            ].map((sector) => (
              <div key={sector.title} className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
                <Building2 className="w-6 h-6 text-blue-400 mb-3" />
                <h4 className="text-base font-semibold text-white mb-1.5">{sector.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{sector.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Portals Section ─────────────────────────────────────── */}
      <section id="portals" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Integrated Multi-Stakeholder Portals
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Role-tailored interfaces ensure executives, field cleaners, and facility managers access the right tools securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ops Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400 mb-5">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Executive &amp; Operations ERP</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  For administrators, supervisors, dispatchers, and accountants. Full access to job dispatch, finance, documents, and compliance engines.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20"
              >
                <span>Launch Operations Suite</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Employee Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Field Staff Mobile App</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  For field cleaners and route technicians. Geofenced GPS clock-in, job task checklists, chemical safety SDS sheets, and inspection uploads.
                </p>
              </div>
              <Link
                href="/employee/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition-all"
              >
                <span>Employee Mobile Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Client Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-5">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Client Self-Service Portal</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  For commercial property managers. Live inspection pass rates, cleaning schedule tracking, on-demand work requests, and invoice payment.
                </p>
              </div>
              <Link
                href="/portal/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition-all"
              >
                <span>Client Portal Access</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Corporate Footer ─────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Secure Cleaning Operations Inc.</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Commercial cleaning &amp; facility management operations platform. Built for compliance, security, and enterprise scale.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Corporate Office</h5>
              <p>Secure Cleaning Operations Inc.</p>
              <p>Dallas – Fort Worth Regional Headquarters</p>
              <p>Office Hours: Mon – Fri, 10:00 AM – 5:30 PM</p>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">System Portals</h5>
              <ul className="space-y-1.5">
                <li><Link href="/login" className="hover:text-blue-400">Operations Sign In</Link></li>
                <li><Link href="/employee/login" className="hover:text-blue-400">Field Employee App</Link></li>
                <li><Link href="/portal/login" className="hover:text-blue-400">Client Portal</Link></li>
                <li><Link href="/signup" className="hover:text-blue-400">Request Enterprise Access</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Compliance &amp; Security</h5>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">CMMC Level 2 Ready</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">OSHA 1910.1030</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">GBAC Star Master</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">SOC 2 Aligned</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>&copy; {new Date().getFullYear()} Secure Cleaning Operations Inc. All rights reserved.</p>
            <p className="font-mono text-[11px]">SCOMS Platform Architecture v4.0 &bull; Release 6.1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
