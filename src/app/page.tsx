"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, Calendar, Users, FileText, CheckCircle2, ChevronRight,
  Video, Phone, Sparkles, DollarSign, MapPin, Award, Layers,
  ArrowRight, Clock, Star, Play, Check, AlertCircle, Building2, Truck, BookOpen
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"dispatch" | "phone" | "accounting" | "video" | "academy">("dispatch");
  const [crewSize, setCrewSize] = useState(30);
  const [monthlyRevenue, setMonthlyRevenue] = useState(150000);

  // Calculations for ROI Calculator
  const payrollSavings = Math.round(crewSize * 180 * 12); // ~180/cleaner/mo saved from buddy punching & GPS geofencing
  const dispatchSavings = Math.round(monthlyRevenue * 0.045); // 4.5% efficiency boost in routing
  const totalAnnualSavings = payrollSavings + dispatchSavings;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-display selection:bg-blue-600 selection:text-white">
      {/* Top Quick Role Access Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">SCOMS v4.0 & v6.1 Production Suite</span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline text-slate-400">Direct Role Access:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <Link
              href="/dashboard/executive"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 font-semibold transition"
            >
              👔 Executive / Admin
            </Link>
            <Link
              href="/dashboard/operations"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-semibold transition"
            >
              🚜 Operations & Dispatch
            </Link>
            <Link
              href="/dashboard/communications/meetings"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 font-semibold transition"
            >
              📹 Video Meetings (Jitsi)
            </Link>
            <Link
              href="/dashboard/phone-agent"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold transition"
            >
              📞 AI Phone Agent
            </Link>
            <Link
              href="/dashboard/academy"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-semibold transition"
            >
              🎓 SCOMS Academy
            </Link>
            <Link
              href="/employee/dashboard"
              className="px-2.5 py-1 rounded-md bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 font-semibold transition"
            >
              📱 Cleaner Portal
            </Link>
            <Link
              href="/portal/dashboard"
              className="px-2.5 py-1 rounded-md bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 font-semibold transition"
            >
              🏢 Client Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-lg sticky top-[37px] z-40">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                SCOMS <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">v4.0 & v6.1</span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">Secure Cleaning Operations Management System</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#showcase" className="hover:text-white transition">Platform Engines</a>
            <a href="#video-meetings" className="hover:text-white transition">Jitsi Video</a>
            <a href="#phone-agent" className="hover:text-white transition">AI Twilio Receptionist</a>
            <a href="#academy" className="hover:text-white transition">SCOMS Academy</a>
            <a href="#accounting" className="hover:text-white transition">GAAP Accounting</a>
            <a href="#roi-calculator" className="hover:text-white transition">ROI Calculator</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-900/40 transition hover:scale-[1.02]"
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Glow gradients in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-semibold text-blue-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Complete Enterprise Operations · ERP + FSM + HR + GAAP Accounting + AI + Video</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
            The Enterprise Operating System for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
              Commercial Cleaning & Facility Services
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Consolidating workforce dispatch, geofenced GPS clock-ins, GAAP double-entry ledger, 24/7 AI Twilio voice receptionist, open-source Jitsi video walkthroughs, and 30-course compliance training into a unified multi-tenant platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2 transition hover:scale-105"
            >
              <span>Launch Enterprise ERP Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard/communications/meetings"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <Video className="w-4 h-4 text-blue-400" />
              <span>Enter Video Meeting Room</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { value: "$4.8M+", label: "Managed Annual Cleaning Volume", highlight: "text-blue-400" },
              { value: "0% Fraud", label: "Geofenced GPS Clock-In Accuracy", highlight: "text-emerald-400" },
              { value: "100% Audit", label: "CMMC L2 & OSHA Regulatory Ready", highlight: "text-purple-400" },
              { value: "24/7", label: "AI Business Receptionist Active", highlight: "text-amber-400" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
                <p className={`text-2xl sm:text-3xl font-black ${stat.highlight}`}>{stat.value}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Platform Engine Showcase */}
      <section id="showcase" className="py-20 bg-slate-950/60 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Interactive Core Engines</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Experience SCOMS in Action</h2>
            <p className="text-sm sm:text-base text-slate-400">
              Click through the operational engines powering real commercial cleaning operations.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
            {[
              { id: "dispatch", label: "1. Real-Time GPS Dispatch", icon: MapPin },
              { id: "phone", label: "2. AI Twilio Voice Agent", icon: Phone },
              { id: "accounting", label: "3. GAAP Double-Entry Ledger", icon: DollarSign },
              { id: "video", label: "4. Jitsi Video Walkthroughs", icon: Video },
              { id: "academy", label: "5. SCOMS 30-Course Academy", icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Screen Display */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* 1. DISPATCH TAB */}
            {activeTab === "dispatch" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Geofence GPS Active
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Zero Timecard Fraud with Geofenced Shift Verification
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Cleaners can only clock in when their mobile device is verified within the client facility geofence perimeter (150-meter radius). Buddy punching and remote clock-ins are completely blocked.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      "Automated route optimization with Leaflet routing machine",
                      "Instant conflict detection when crews are double-booked",
                      "Automated push notifications for emergency callback shifts",
                      "Live GPS telemetry feed to operations dispatch dashboard"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/dashboard/operations"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Open Live Dispatch Map <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Card Mockup */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-emerald-400 font-bold">● ACTIVE CREW TRACKER</span>
                    <span className="text-slate-500">RADIUS: 150m</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">Elena Rostova (Crew Lead)</p>
                        <p className="text-[11px] text-slate-500 font-sans">Apex Logistics Center · Night Clean</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Verified Geofence
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">Marcus Vance</p>
                        <p className="text-[11px] text-slate-500 font-sans">St. Jude Medical · Surgery Suite Sanitization</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        In Progress
                      </span>
                    </div>

                    <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-800/40 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">Unauthorized Device</p>
                        <p className="text-[11px] text-rose-400 font-sans">Blocked clock-in: 1.4 miles outside perimeter</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                        ACCESS REJECTED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PHONE TAB */}
            {activeTab === "phone" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Phone className="w-3.5 h-3.5" />
                    Twilio Voice Powered Receptionist
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    24/7 AI Business Phone Agent & Department Routing
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Never miss a commercial cleaning contract or emergency client call. The AI receptionist answers professionally, collects facility square footage, budget, and cleaning frequency, and automatically routes or schedules walkthroughs.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      "Automated qualification of commercial office & medical facility leads",
                      "Real-time Twilio transcription, audio recordings, and CRM ingestion",
                      "Emergency callback detection with escalation to on-call supervisor",
                      "Integrated calendar booking for virtual site walkthroughs"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/dashboard/phone-agent"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Open Phone Agent Console <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Call Simulation Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-amber-400 font-bold text-xs font-mono">CALL RECORD #TW-88941</span>
                    <span className="text-emerald-400 text-xs font-mono">03:24 · INBOUND</span>
                  </div>
                  <div className="space-y-3 text-xs font-sans">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-blue-400">Caller: Commercial Property Mgr</p>
                      <p className="text-slate-300 italic">"We need five-day-a-week janitorial for our 45,000 sq ft tech building in downtown."</p>
                    </div>

                    <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-800/40 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-amber-400">SCOMS AI Business Voice Agent</p>
                      <p className="text-slate-200">"Thank you for calling Secure Cleaning Operations Inc. For 45,000 sq ft, we offer standard commercial disinfection and our Gold Tier sanitization package. May I book your virtual walkthrough for Thursday at 10:00 AM?"</p>
                    </div>

                    <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/40 text-[11px] text-emerald-300 font-mono">
                      ✓ Lead Created: Apex Tech Plaza ($6,800/mo potential) · Walkthrough Scheduled
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ACCOUNTING TAB */}
            {activeTab === "accounting" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                    <DollarSign className="w-3.5 h-3.5" />
                    Double-Entry General Ledger (QuickBooks Alternative)
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Audit-Grade Accounting & Real-Time Job Profitability
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Designed specifically for high-volume commercial cleaning contracts. Automated payroll calculated strictly from verified geofenced attendance, immutable journal entries, and real-time margin analysis.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      "Immutable ledger with strict reversal-only accounting rules",
                      "Job completion verification required prior to invoice generation",
                      "Automated overtime, holiday pay, and multi-tier wage calculations",
                      "One-click CPA export formats and tax liability breakdowns"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/dashboard/gl"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Explore General Ledger <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Ledger Snapshot Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-blue-400 font-bold">DOUBLE-ENTRY JOURNAL BATCH</span>
                    <span className="text-slate-500">GAAP BALANCED: $148,250.00</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-300">1010 - Cash / Operating Checking</span>
                      <span className="text-emerald-400 font-bold">+$48,200.00 [DR]</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-300">1200 - Accounts Receivable</span>
                      <span className="text-slate-400">-$48,200.00 [CR]</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-300">5010 - Direct Field Janitorial Labor</span>
                      <span className="text-emerald-400 font-bold">+$18,450.00 [DR]</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-300">5030 - Chemical & Disinfectant Supplies</span>
                      <span className="text-emerald-400 font-bold">+$3,210.00 [DR]</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-800/40 flex justify-between items-center text-blue-300">
                    <span>Average Contract Gross Margin:</span>
                    <span className="font-bold text-sm">41.8% (Target: 38%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. VIDEO MEETINGS TAB */}
            {activeTab === "video" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                    <Video className="w-3.5 h-3.5" />
                    Open-Source Jitsi Meet Integration
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    HD Encrypted Video Conferences & Virtual Walkthroughs
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Powered by open-source Jitsi Meet. Host virtual facility walkthroughs, review cleaning inspections with commercial clients, conduct pre-shift crew safety huddles, and assign live action items inside the call.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      "Instant 1-click room creation with encrypted peer connections",
                      "In-meeting scope checklist, live call notes, and task assignments",
                      "Zero downloads or browser extensions required for clients or staff",
                      "Direct integration with SCOMS Calendar and client portal"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/dashboard/communications/meetings"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Schedule Video Meeting <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Video Room Mockup */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="aspect-video bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400 animate-pulse">
                        <Video className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm text-white">SCOMS-Walkthrough-MetroCenter</p>
                      <p className="text-[11px] text-slate-400">Jitsi Meet HD Conference · 2 Participants</p>
                    </div>

                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-slate-300">
                      Operations Director (Host)
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-slate-300">
                      Facility Client
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Screen Share: Available</span>
                    <span>Chat: Active</span>
                    <span className="text-emerald-400 font-bold">End-to-End Encrypted</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ACADEMY TAB */}
            {activeTab === "academy" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                    <Award className="w-3.5 h-3.5" />
                    30-Course Professional Curriculum
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    SCOMS Academy: Video Training & Certification Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Mandatory professional training across 7 core series: OSHA safety, PPE, chemical dilution, CMMC physical security badges, restroom sanitization, and supervisor leadership with interactive quizzes and verifiable certificates.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      "HD instructional training video player with chapter breakdowns",
                      "Interactive 5-question certification exams with instant 80% passing validation",
                      "Official verifiable Certificate of Completion generation",
                      "Automated assignment tracking and regulatory compliance records"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/dashboard/academy"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Enter SCOMS Academy <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Academy Preview Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-sky-400 font-bold text-xs">CERTIFICATION MODULE</span>
                    <span className="text-slate-400 text-xs font-mono">SERIES 2: SAFETY</span>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 text-sm">Personal Protective Equipment & Chemical Safety</h4>
                      <span className="text-emerald-400 font-bold text-xs">80% Passing</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      OSHA SDS standards, quaternary ammonium dwell times, and chemical hazard prevention.
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">20 Mins · Interactive Video & Quiz</span>
                      <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] font-bold">
                        Certificate Issued
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
                    <Award className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Includes printable official certificate with unique validation hash ID.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ROI & Labor Savings Calculator */}
      <section id="roi-calculator" className="py-20 bg-[#060911] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Commercial Operations ROI</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Calculate Your Annual Operational Savings</h2>
            <p className="text-sm text-slate-400">
              See how much SCOMS saves your facility management company by eliminating timecard padding and automating route dispatch.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-2xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Active Field Cleaners & Supervisors
                  </label>
                  <span className="text-base font-bold text-blue-400">{crewSize} staff</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={crewSize}
                  onChange={e => setCrewSize(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">Average cleaning labor force size</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Monthly Contract Billing Volume
                  </label>
                  <span className="text-base font-bold text-emerald-400">
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
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">Total active recurring commercial contracts</p>
              </div>
            </div>

            {/* Savings Display */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="space-y-1 border-b border-slate-800 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Annual Labor Savings</span>
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  ${totalAnnualSavings.toLocaleString()} / year
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>GPS Timecard Padding Elimination:</span>
                  <span className="text-slate-200 font-bold">${payrollSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispatch & Route Efficiency Gain:</span>
                  <span className="text-slate-200 font-bold">${dispatchSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CMMC Compliance Audit Defense:</span>
                  <span className="text-emerald-400 font-bold">100% Covered</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  Deploy SCOMS to Your Organization
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Roles & Portals Quick Access */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Multi-Tenant Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Built for Every Operational Role</h2>
            <p className="text-sm text-slate-400">
              Each stakeholder accesses an interface tailored specifically to their daily responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Executive & Franchise Owners</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete financial transparency: P&L by building, double-entry general ledger, CAPA compliance audits, and multi-unit franchise royalty reconciliation.
              </p>
              <Link
                href="/dashboard/executive"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                Enter Executive Suite <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Field Cleaners & Supervisors</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mobile-first shift view with geofenced GPS clock-in, interactive inspection checklists, route navigation, and SCOMS Academy safety video modules.
              </p>
              <Link
                href="/employee/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                Enter Mobile Cleaner Hub <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Commercial Facility Clients</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Self-service portal for property directors: request special cleaning, review electronic inspection scores, and join live Jitsi video walkthroughs.
              </p>
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                Enter Client Portal <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-slate-900 py-12 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-bold text-slate-300">Secure Cleaning Operations Inc.</p>
              <p className="text-[11px] text-slate-500">SCOMS v4.0 & v6.1 Master Specification System</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-300 transition">Executive ERP</Link>
            <Link href="/dashboard/communications/meetings" className="hover:text-slate-300 transition">Jitsi Video</Link>
            <Link href="/dashboard/phone-agent" className="hover:text-slate-300 transition">Twilio Phone AI</Link>
            <Link href="/dashboard/academy" className="hover:text-slate-300 transition">Training Academy</Link>
            <Link href="/employee/login" className="hover:text-slate-300 transition">Staff Login</Link>
            <Link href="/portal/login" className="hover:text-slate-300 transition">Client Login</Link>
          </div>

          <p className="text-[11px]">© 2026 Secure Cleaning Operations Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
