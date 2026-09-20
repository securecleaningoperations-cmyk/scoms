"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, Calendar, Users, FileText, CheckCircle2, ChevronRight,
  Video, Phone, Sparkles, DollarSign, MapPin, Award, Layers,
  ArrowRight, Clock, Star, Play, Check, AlertCircle, Building2, Truck, BookOpen,
  Radio, Compass, Shield
} from "lucide-react";

export default function LandingPage() {
  const [activePreview, setActivePreview] = useState<"map" | "meeting" | "phone" | "accounting" | "academy">("map");
  const [crewSize, setCrewSize] = useState(30);
  const [monthlyRevenue, setMonthlyRevenue] = useState(150000);

  // Dynamic ROI calculations
  const payrollSavings = Math.round(crewSize * 180 * 12);
  const dispatchSavings = Math.round(monthlyRevenue * 0.045);
  const totalAnnualSavings = payrollSavings + dispatchSavings;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-display antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Quick Role Access Strip */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">SCOMS v4.0 &amp; v6.1 Production Suite</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">Direct Role Access:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <Link
              href="/dashboard/executive"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold transition"
            >
              👔 Executive / Admin
            </Link>
            <Link
              href="/dashboard/operations"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold transition"
            >
              🚜 Operations &amp; Dispatch
            </Link>
            <Link
              href="/dashboard/communications/meetings"
              className="px-2.5 py-1 rounded-md bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 font-bold transition flex items-center gap-1"
            >
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>Company All-Hands</span>
            </Link>
            <Link
              href="/dashboard/phone-agent"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold transition"
            >
              📞 AI Phone Agent
            </Link>
            <Link
              href="/dashboard/academy"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold transition"
            >
              🎓 Training Academy
            </Link>
            <Link
              href="/employee/dashboard"
              className="px-2.5 py-1 rounded-md bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 font-semibold transition"
            >
              📱 Cleaner Portal
            </Link>
            <Link
              href="/portal/dashboard"
              className="px-2.5 py-1 rounded-md bg-blue-900/60 hover:bg-blue-800 text-blue-200 font-semibold transition"
            >
              🏢 Client Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-[37px] z-40">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                SCOMS <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">v4.0 &amp; v6.1</span>
              </span>
              <p className="text-[10px] text-slate-500 hidden sm:block">Secure Cleaning Operations Management System</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#modules" className="hover:text-blue-600 transition">Core Modules</a>
            <a href="#interactive-preview" className="hover:text-blue-600 transition">Live System Preview</a>
            <a href="#roi-calculator" className="hover:text-blue-600 transition">ROI Calculator</a>
            <Link href="/dashboard/communications/meetings" className="hover:text-blue-600 transition text-emerald-600 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>All-Hands Video</span>
            </Link>
            <Link href="/dashboard/academy" className="hover:text-blue-600 transition">Academy</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-900/20 transition hover:scale-[1.02]"
            >
              Launch Enterprise Suite
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-8 max-w-7xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Unified Enterprise Platform · FSM + ERP + HR + Accounting + Video + AI</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 max-w-5xl mx-auto tracking-tight leading-[1.1]">
          The Complete Operating System for{" "}
          <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">
            Commercial Cleaning &amp; Facilities
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Unify Google Maps-grade route dispatch, geofenced GPS clock-ins, GAAP double-entry ledger, 24/7 AI Twilio voice receptionist, open-source Jitsi video meetings, and 30-course compliance training into one platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition hover:scale-105"
          >
            <span>Enter Operations Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard/communications/meetings"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base rounded-2xl shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Video className="w-4 h-4 text-emerald-600" />
            <span>Join Company All-Hands Video Hall</span>
          </Link>
        </div>

        {/* Real Metrics Strip */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          {[
            { value: "$4.8M+", label: "Managed Annual Cleaning Volume", desc: "100% GAAP Balanced" },
            { value: "0% Fraud", label: "GPS Geofenced Timecards", desc: "150m Perimeter Lock" },
            { value: "30 Courses", label: "SCOMS Training Academy", desc: "OSHA & CMMC Verified" },
            { value: "24/7 Live", label: "AI Business Receptionist", desc: "Twilio Voice Automated" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold text-slate-700">{stat.label}</p>
              <p className="text-[11px] text-slate-400 font-medium">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Modules Grid (The 6 Engines of SCOMS) */}
      <section id="modules" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Engine Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Six Integrated Production Engines</h2>
            <p className="text-sm text-slate-500">
              Replacing fragmented third-party software with one connected operational workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Routes & Google Maps */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-blue-300 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Google Maps-Grade Dispatch</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time Leaflet &amp; Carto routing engine with street and satellite views, turn-by-turn driving steps, 150m geofenced shift validation, and live fleet van telemetry.
                </p>
              </div>
              <Link
                href="/dashboard/scheduling/routes"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-2"
              >
                Launch Route Optimizer <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Jitsi Video Meetings */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-emerald-300 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Open-Source Jitsi Video Meetings</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Permanent Company-Wide All-Hands Video Hall (`SCOMS-All-Hands-Company-Wide`), instant room creation, in-call scope checklists, live task dispatch, and client walkthroughs.
                </p>
              </div>
              <Link
                href="/dashboard/communications/meetings"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-2"
              >
                Enter Video Meetings Hub <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: AI Twilio Receptionist */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-amber-300 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">AI Phone Agent &amp; Twilio Voice</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  24/7 commercial receptionist: answers calls professionally, identifies callers, extracts square footage and cleaning frequency, and routes leads directly into CRM workflows.
                </p>
              </div>
              <Link
                href="/dashboard/phone-agent"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 pt-2"
              >
                Open AI Voice Console <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: SCOMS Academy */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-sky-300 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Training Academy &amp; Video Quizzes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  30-course curriculum across 7 Series: OSHA safety, chemical dilution, CMMC badges, and restroom sanitization with video player, 5-question exams, and verifiable certificates.
                </p>
              </div>
              <Link
                href="/dashboard/academy"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 pt-2"
              >
                Explore 30 Modules <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 5: Accounting */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-purple-300 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">GAAP Double-Entry Ledger</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full QuickBooks replacement level: immutable ledger, reversal-only rules, payroll verified strictly from GPS attendance, and real-time building profit margin scores.
                </p>
              </div>
              <Link
                href="/dashboard/gl"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 pt-2"
              >
                Inspect General Ledger <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 6: Franchise Governance */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 hover:border-teal-300 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Franchise Multi-Unit Governance</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Branch royalty tracking (Dallas, Phoenix, Atlanta, Austin, Chicago), automated CAPA compliance audits, quality scorecards, and permanent document repository.
                </p>
              </div>
              <Link
                href="/dashboard/franchise"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 pt-2"
              >
                View Franchise Hub <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live System Showcase */}
      <section id="interactive-preview" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Interactive Preview Console</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Test Core Platform Workflows</h2>
            <p className="text-sm text-slate-500">
              Click tabs to preview real operational tools before launching the platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "map", label: "🗺️ Google Maps Telemetry", link: "/dashboard/scheduling/routes" },
              { id: "meeting", label: "📹 Company All-Hands Hall", link: "/dashboard/communications/meetings" },
              { id: "phone", label: "📞 AI Twilio Receptionist", link: "/dashboard/phone-agent" },
              { id: "accounting", label: "💵 GAAP General Ledger", link: "/dashboard/gl" },
              { id: "academy", label: "🎓 SCOMS Academy Video & Quiz", link: "/dashboard/academy" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePreview(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activePreview === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Display Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 max-w-5xl mx-auto">
            {activePreview === "map" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Live GPS Dispatch Map · Dallas-Fort Worth</h3>
                    <p className="text-xs text-slate-500">Street, Satellite &amp; Turn-by-Turn Navigation active</p>
                  </div>
                  <Link
                    href="/dashboard/scheduling/routes"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    Open Live Interactive Map →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <span className="font-bold text-blue-600 block">Apex Logistics Center</span>
                    <span className="text-slate-500">8645 Commerce Blvd · 85,000 sq ft</span>
                    <span className="text-emerald-600 font-bold block mt-1">● Crew A Verified Geofence</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <span className="font-bold text-blue-600 block">St. Jude Medical Center</span>
                    <span className="text-slate-500">1200 Healthcare Way · 42,000 sq ft</span>
                    <span className="text-blue-600 font-bold block mt-1">● Bio-Safety Team En Route</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <span className="font-bold text-blue-600 block">Metro Tech Tower (24 Fl)</span>
                    <span className="text-slate-500">400 Downtown Plaza · 210,000 sq ft</span>
                    <span className="text-amber-600 font-bold block mt-1">● Shift Starts 7:00 PM</span>
                  </div>
                </div>
              </div>
            )}

            {activePreview === "meeting" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Company-Wide All-Hands Video Hall</h3>
                    <p className="text-xs text-slate-500">Powered by Open-Source Jitsi Meet · Zero cut-off full viewport</p>
                  </div>
                  <Link
                    href="/dashboard/communications/meetings"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Enter All-Hands Hall →</span>
                  </Link>
                </div>
                <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-emerald-400">ROOM: SCOMS-All-Hands-Company-Wide</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">LIVE NOW</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Host: Corporate Leadership · Open to Super Admins, Field Cleaners, Franchise Operators, and Clients.
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Features: HD video tiles, screen share, scope checklist, and in-call task dispatch.
                  </p>
                </div>
              </div>
            )}

            {activePreview === "phone" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Twilio AI Phone Agent · Inbound Qualification</h3>
                    <p className="text-xs text-slate-500">Autonomous caller intent detection &amp; CRM lead creation</p>
                  </div>
                  <Link
                    href="/dashboard/phone-agent"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    Launch Voice Agent →
                  </Link>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border space-y-2 text-xs">
                  <p className="font-bold text-slate-900">Caller: Apex Logistics Property Director</p>
                  <p className="text-slate-600 italic">"We need five-day-a-week sanitization for our 85,000 sq ft distribution facility."</p>
                  <p className="font-bold text-blue-600 mt-2">SCOMS AI Receptionist:</p>
                  <p className="text-slate-700">"Thank you for calling Secure Cleaning Operations Inc. For 85,000 sq ft, we offer our Gold Tier commercial package. I have scheduled your virtual walkthrough with Marcus Vance for Thursday at 10:00 AM."</p>
                </div>
              </div>
            )}

            {activePreview === "accounting" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Double-Entry General Ledger</h3>
                    <p className="text-xs text-slate-500">Immutable ledger entries balanced in real time</p>
                  </div>
                  <Link
                    href="/dashboard/gl"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    View General Ledger →
                  </Link>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between border">
                    <span>1010 - Cash / Operating Checking</span>
                    <span className="font-bold text-emerald-600">+$48,200.00 [DR]</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between border">
                    <span>5010 - Direct Field Janitorial Labor</span>
                    <span className="font-bold text-slate-800">+$18,450.00 [DR]</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between border">
                    <span>Average Contract Gross Margin</span>
                    <span className="font-bold text-blue-600">41.8% Target</span>
                  </div>
                </div>
              </div>
            )}

            {activePreview === "academy" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">SCOMS Academy · Video Player &amp; Quizzes</h3>
                    <p className="text-xs text-slate-500">30 Modules with instant certification exams</p>
                  </div>
                  <Link
                    href="/dashboard/academy"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    Take Course Exam →
                  </Link>
                </div>
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-900 space-y-1">
                  <p className="font-bold text-sm">Series 2: Personal Protective Equipment &amp; Chemical Safety</p>
                  <p>Includes OSHA HazCom standards, quaternary ammonium dwell times, and 5-question exam with 80% passing validation.</p>
                  <p className="font-bold text-emerald-700 mt-2">✓ Verifiable Digital Certificate of Completion Generated</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ROI & Labor Savings Calculator */}
      <section id="roi-calculator" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Commercial Cleaning ROI</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Calculate Your Annual Operational Savings</h2>
            <p className="text-sm text-slate-500">
              See how much SCOMS saves your janitorial enterprise by eliminating timecard padding and optimizing crew routes.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 sm:p-10 rounded-3xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Active Field Cleaners
                  </label>
                  <span className="text-base font-bold text-blue-600">{crewSize} staff</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={crewSize}
                  onChange={e => setCrewSize(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Monthly Contract Billing Volume
                  </label>
                  <span className="text-base font-bold text-emerald-600">
                    ${monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="1000000"
                  step="25000"
                  value={monthlyRevenue}
                  onChange={e => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Annual Operational Savings</span>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">
                ${totalAnnualSavings.toLocaleString()} / year
              </p>
              <div className="space-y-1.5 text-xs text-slate-500 border-t pt-3 font-mono">
                <p>• Timecard padding eliminated: <strong>${payrollSavings.toLocaleString()}</strong></p>
                <p>• Route dispatch efficiency: <strong>${dispatchSavings.toLocaleString()}</strong></p>
                <p>• CMMC Audit Readiness: <strong>100% Covered</strong></p>
              </div>
              <Link
                href="/dashboard"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center transition"
              >
                Deploy SCOMS to Your Organization
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <div>
              <p className="font-bold text-white">Secure Cleaning Operations Inc.</p>
              <p className="text-[11px] text-slate-400">SCOMS v4.0 &amp; v6.1 Master Specification System</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition">Operations ERP</Link>
            <Link href="/dashboard/scheduling/routes" className="hover:text-white transition">Google Maps Route</Link>
            <Link href="/dashboard/communications/meetings" className="hover:text-white transition">All-Hands Hall</Link>
            <Link href="/dashboard/academy" className="hover:text-white transition">Academy</Link>
            <Link href="/employee/login" className="hover:text-white transition">Cleaner Login</Link>
            <Link href="/portal/login" className="hover:text-white transition">Client Portal</Link>
          </div>

          <p className="text-[11px]">© 2026 Secure Cleaning Operations Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
