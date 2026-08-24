"use client";

import Link from "next/link";
import { ShieldCheck, Calendar, Users, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cloud flex flex-col font-display">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-cloud/80 backdrop-blur-md border-b border-hairline h-[64px] flex items-center justify-between px-8 md:px-12 max-w-[1200px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-signal-blue" />
          <span className="text-xl font-bold tracking-tight text-ink-navy">SCOMS</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="cal-btn-ghost text-sm">Features</Link>
          <Link href="#compliance" className="cal-btn-ghost text-sm">Compliance</Link>
          <Link href="#enterprise" className="cal-btn-ghost text-sm">Enterprise</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="cal-btn-ghost text-sm">Log in</Link>
          <Link href="/login" className="cal-btn-dark text-sm px-4 py-2">Get started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-8 md:px-12 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Left */}
          <div className="space-y-8 relative z-10">
            <div className="cal-badge mb-4">
              <span className="mr-2">🎉</span> Master PRD v1.2 Released
            </div>
            <h1 className="text-[50px] md:text-[68px] lg:text-[80px] font-bold text-ink-navy leading-[1.1] tracking-tight">
              Secure Cleaning Operations Management System
            </h1>
            <p className="text-[20px] text-slate-gray leading-relaxed max-w-xl">
              AI-powered enterprise platform for cleaning and facility services. Built for multi-tenant, offline-first, scalable operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login" className="cal-btn-primary flex items-center justify-center gap-2">
                Launch Platform
              </Link>
              <Link href="#demo" className="cal-btn-ghost flex items-center justify-center border border-ink-navy/20 rounded-lg px-6 py-2.5">
                View Demo
              </Link>
            </div>
          </div>

          {/* Hero Right - Product Mockup */}
          <div className="relative">
            {/* Decorative Blobs */}
            <div className="absolute top-10 -left-10 w-72 h-72 bg-sky-cyan rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-20 -right-10 w-72 h-72 bg-coral-magenta rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            
            {/* Widget Card */}
            <div className="cal-product-card p-6 h-[480px] flex flex-col relative z-10 bg-white/90 backdrop-blur">
              <div className="flex items-center justify-between border-b border-hairline pb-4 mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-signal-blue/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-signal-blue" />
                   </div>
                   <div>
                     <p className="font-semibold text-ink-navy">CMMC L2 Readiness</p>
                     <p className="text-sm text-slate-gray">Last assessment: 2 days ago</p>
                   </div>
                 </div>
                 <div className="cal-badge bg-soft-mint text-vivid-green">
                    94% Ready
                 </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-4 bg-pebble rounded-md w-3/4"></div>
                <div className="h-4 bg-pebble rounded-md w-1/2"></div>
                <div className="h-4 bg-pebble rounded-md w-5/6"></div>
                
                <div className="mt-8 border border-hairline rounded-xl p-4">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-ink-navy">AC.L2-3.1.1</span>
                     <CheckCircle2 className="w-5 h-5 text-signal-blue" />
                   </div>
                   <p className="text-sm text-slate-gray">Authorize access to information systems.</p>
                </div>
                
                <div className="border border-hairline rounded-xl p-4">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-ink-navy">AC.L2-3.1.2</span>
                     <CheckCircle2 className="w-5 h-5 text-signal-blue" />
                   </div>
                   <p className="text-sm text-slate-gray">Limit system access to authorized users.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      {/* Trust Strip */}
      <section className="border-y border-hairline bg-paper py-10 mt-12">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12">
          <p className="text-center text-sm font-semibold text-mist-gray uppercase tracking-widest mb-6">Trusted by Top Facility Services</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale">
            <span className="text-2xl font-bold text-slate-gray font-display">ABM</span>
            <span className="text-2xl font-bold text-slate-gray font-display">Sodexo</span>
            <span className="text-2xl font-bold text-slate-gray font-display">ISS</span>
            <span className="text-2xl font-bold text-slate-gray font-display">ServiceMaster</span>
            <span className="text-2xl font-bold text-slate-gray font-display">JLL</span>
          </div>
        </div>
      </section>

      {/* Feature Section 1 (Text Left, Product Right) */}
      <section id="features" className="py-24 bg-cloud max-w-[1200px] mx-auto px-8 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[38px] md:text-[50px] font-bold text-ink-navy leading-[1.2] mb-4">Command your compliance posture</h2>
          <p className="text-[18px] text-slate-gray">
            Automate evidence collection, map controls across multiple frameworks, and continuously monitor your CMMC readiness from a single source of truth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="border-b border-hairline pb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-8 rounded-full bg-signal-blue/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-signal-blue" />
                </div>
                <h3 className="text-[20px] font-semibold text-ink-navy">Continuous Monitoring</h3>
              </div>
              <p className="text-slate-gray pl-12">Real-time alerts when configurations drift out of compliance boundaries, ensuring audit-readiness 24/7.</p>
            </div>
            
            <div className="border-b border-hairline pb-6 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-8 rounded-full bg-mist-gray/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-mist-gray" />
                </div>
                <h3 className="text-[20px] font-semibold text-slate-gray">Automated Evidence</h3>
              </div>
              <p className="text-mist-gray pl-12">Connect your cloud infrastructure to automatically gather and map evidence directly to NIST 800-171 controls.</p>
            </div>
            
            <div className="pb-6 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-8 rounded-full bg-mist-gray/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-mist-gray" />
                </div>
                <h3 className="text-[20px] font-semibold text-slate-gray">Auditor Portal</h3>
              </div>
              <p className="text-mist-gray pl-12">Secure, scoped access for third-party assessors (C3PAOs) to review your system security plan without touching production data.</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-coral-magenta rounded-full mix-blend-multiply blur-3xl opacity-20"></div>
            <div className="cal-product-card p-8 h-[360px] bg-white relative z-10">
              <div className="flex justify-between items-center border-b border-hairline pb-4 mb-6">
                 <span className="font-semibold text-ink-navy">Control Map: SC.L2-3.13.2</span>
                 <span className="cal-badge bg-pebble text-deep-cobalt">Implemented</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-cloud rounded-lg border border-hairline flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-navy">AWS Security Hub</span>
                  <span className="text-xs text-signal-blue font-semibold">Passing</span>
                </div>
                <div className="p-4 bg-cloud rounded-lg border border-hairline flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-navy">Microsoft Intune</span>
                  <span className="text-xs text-signal-blue font-semibold">Passing</span>
                </div>
                <div className="p-4 bg-[#fff0f0] rounded-lg border border-[#ffcccc] flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-navy">CrowdStrike Falcon</span>
                  <span className="text-xs text-[#ef4444] font-semibold">1 Warning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 (Product Left, Text Right) */}
      <section id="compliance" className="py-24 bg-paper border-y border-hairline">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="relative order-2 lg:order-1">
              <div className="absolute top-10 -left-10 w-64 h-64 bg-sky-cyan rounded-full mix-blend-multiply blur-3xl opacity-20"></div>
              <div className="cal-product-card p-8 h-[360px] bg-white relative z-10 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-xl font-bold text-ink-navy">SPR Score</span>
                   <span className="text-3xl font-bold text-signal-blue">+110</span>
                </div>
                <div className="flex-1 bg-pebble rounded-xl border border-hairline flex items-end justify-center pb-4 px-4 gap-4">
                   <div className="w-8 bg-signal-blue rounded-t-sm h-1/4"></div>
                   <div className="w-8 bg-signal-blue rounded-t-sm h-2/4"></div>
                   <div className="w-8 bg-signal-blue rounded-t-sm h-3/4"></div>
                   <div className="w-8 bg-signal-blue rounded-t-sm h-full"></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-[38px] md:text-[50px] font-bold text-ink-navy leading-[1.2]">Visualize your readiness</h2>
              <p className="text-[18px] text-slate-gray">
                Generate real-time executive reports, track your SPRS score dynamically, and forecast the financial impact of compliance gaps before they become liabilities.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-signal-blue mt-0.5 shrink-0" />
                  <span className="text-ink-navy font-medium">Dynamic System Security Plans (SSP)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-signal-blue mt-0.5 shrink-0" />
                  <span className="text-ink-navy font-medium">Automated Plan of Action & Milestones (POA&M)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-signal-blue mt-0.5 shrink-0" />
                  <span className="text-ink-navy font-medium">C-Suite Financial Risk Dashboards</span>
                </li>
              </ul>
              <div className="pt-6">
                <Link href="/login" className="cal-btn-dark inline-block">
                  Explore Dashboards
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="py-24 bg-cloud max-w-[1200px] mx-auto px-8 md:px-12 text-center">
        <h2 className="text-[38px] md:text-[50px] font-bold text-ink-navy leading-[1.2] mb-6">Ready for the DIB</h2>
        <p className="text-[18px] text-slate-gray max-w-2xl mx-auto mb-10">
          Built on a secure, single-tenant isolated architecture to meet the strict data residency and access requirements of the Defense Industrial Base.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="cal-card p-8">
            <ShieldCheck className="w-8 h-8 text-signal-blue mb-4" />
            <h3 className="text-xl font-bold text-ink-navy mb-2">FedRAMP Ready</h3>
            <p className="text-slate-gray text-sm">Deployed on AWS GovCloud with full encryption at rest and in transit.</p>
          </div>
          <div className="cal-card p-8">
            <Users className="w-8 h-8 text-signal-blue mb-4" />
            <h3 className="text-xl font-bold text-ink-navy mb-2">Role-Based Access</h3>
            <p className="text-slate-gray text-sm">Granular permissions with support for SSO, MFA, and strict session management.</p>
          </div>
          <div className="cal-card p-8">
            <Calendar className="w-8 h-8 text-signal-blue mb-4" />
            <h3 className="text-xl font-bold text-ink-navy mb-2">Audit Logging</h3>
            <p className="text-slate-gray text-sm">Immutable tracking of every system change, ready for C3PAO review.</p>
          </div>
        </div>
        <div className="mt-16">
          <Link href="/login" className="cal-btn-primary inline-block text-lg px-8 py-4">
            Start your free assessment
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-cloud py-12 border-t border-hairline mt-auto">
         <div className="max-w-[1200px] mx-auto px-8 md:px-12 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <ShieldCheck className="w-6 h-6 text-mist-gray" />
               <span className="text-mist-gray font-semibold">SCOMS © 2026</span>
            </div>
            <div className="flex gap-6">
               <Link href="#" className="text-sm text-slate-gray hover:text-ink-navy">Privacy</Link>
               <Link href="#" className="text-sm text-slate-gray hover:text-ink-navy">Terms</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}
