"use client";

import { Map as MapIcon, Clock, Navigation, LocateFixed } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { supabase } from "@/lib/supabase";

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
      <LocateFixed className="w-8 h-8 mb-2 animate-pulse text-blue-400" />
      <span className="text-sm font-medium">Loading Map...</span>
    </div>
  )
});

export default function RoutesPage() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase.from('jobs').select('*').in('status', ['Created', 'In Progress', 'Accepted']).limit(20);
    if (data) {
      // Use real lat/lng if available, otherwise fallback to Phoenix area
      const jobsWithCoords = data.map((job, idx) => ({
        ...job,
        lat: job.lat || 33.4484 + (Math.random() - 0.5) * 0.2, 
        lng: job.lng || -112.0740 + (Math.random() - 0.5) * 0.2,
      }));
      setJobs(jobsWithCoords);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-full font-sans">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Route Optimization</h1>
            <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{jobs.length} locations</span>
          </div>
          <p className="text-slate-500 text-sm">Optimize travel routes between client locations</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <MapIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Routes</p>
            <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Avg Travel Time</p>
            <p className="text-2xl font-bold text-slate-900">24 min</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <Navigation className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Distance</p>
            <p className="text-2xl font-bold text-slate-900">142 mi</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[600px] flex flex-col h-[600px]">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Route Map</h2>
        <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden z-0 w-full h-full">
          <div className="absolute inset-0">
            <MapComponent jobs={jobs} />
          </div>
        </div>
      </div>
    </div>
  );
}
