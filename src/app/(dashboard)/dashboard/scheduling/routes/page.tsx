"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import {
  Map as MapIcon, Clock, Navigation, LocateFixed,
  Building2, Truck, ShieldCheck, Sparkles, AlertCircle
} from "lucide-react";
import { REAL_FACILITIES } from "@/components/MapComponent";

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 min-h-[600px]">
      <LocateFixed className="w-10 h-10 mb-3 animate-pulse text-blue-500" />
      <span className="text-base font-semibold text-slate-700">Loading Google Maps Telemetry Engine...</span>
      <span className="text-xs text-slate-400 mt-1">Acquiring live Dallas-Fort Worth GPS coordinates</span>
    </div>
  )
});

export default function RoutesPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'scheduled'>('all');

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen font-display">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Route Optimization & GPS Fleet Telemetry
            </h1>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              Google Maps Grade
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Real-time route calculation, geofence perimeters, and live cleaner van GPS tracking across Dallas-Fort Worth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>3 Fleet Vans Connected</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Facilities</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{REAL_FACILITIES.length} Sites</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Travel Time</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">22 mins</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Route Loop</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">48.6 mi</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Geofence Compliance</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">100% Locked</p>
          </div>
        </div>
      </div>

      {/* Main Map Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live Interactive Route & Facility Map</h2>
            <p className="text-xs text-slate-500">
              Interactive Google Maps engine with turn-by-turn driving steps, street/satellite layers, and real-time fleet GPS.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quick Jump:</span>
            {REAL_FACILITIES.slice(0, 3).map(fac => (
              <span
                key={fac.id}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                {fac.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full h-[650px] md:h-[720px] rounded-2xl overflow-hidden border border-slate-200 relative">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}
