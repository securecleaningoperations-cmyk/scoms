"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import { getMyEmployee, getMySchedule } from "@/lib/services/employeePortal";
import { 
  Clock, Calendar, AlertCircle, FileText, CheckCircle2, 
  ChevronRight, Loader2, MapPin, QrCode, ShieldCheck, 
  Wifi, Navigation, Check, X, Camera, Timer
} from "lucide-react";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Clock-in & Verification Modal State
  const [clockModalOpen, setClockModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState<'idle' | 'gps' | 'qr' | 'success'>('idle');
  const [activeShiftState, setActiveShiftState] = useState<'scheduled' | 'en_route' | 'arrived' | 'clocked_in' | 'completed'>('scheduled');
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const init = async () => {
      const emp = await getMyEmployee();
      if (!emp) { router.push('/employee/login'); return; }
      setEmployee(emp);
      setSchedule(await getMySchedule(emp.id));
      setLoading(false);
    };
    init();
  }, [router]);

  // Elapsed timer for active shift
  useEffect(() => {
    let interval: any;
    if (activeShiftState === 'clocked_in') {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeShiftState]);

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-semibold">Loading Field Portal...</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysShifts = schedule.filter(s => Array.isArray(s.schedule_days) && s.schedule_days.includes(today));
  const nextShift = todaysShifts[0] || (schedule.length > 0 ? schedule[0] : null);

  const startClockInVerification = () => {
    setClockModalOpen(true);
    setVerifyStep('gps');
    setVerifying(true);

    // Simulate GPS verification
    setTimeout(() => {
      setVerifyStep('qr');
      setVerifying(false);
    }, 1200);
  };

  const completeQrScan = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerifyStep('success');
      setActiveShiftState('clocked_in');
      setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => {
        setClockModalOpen(false);
        setVerifyStep('idle');
      }, 1200);
    }, 1000);
  };

  const handleClockOut = () => {
    if (confirm("Are you sure you want to complete and clock out of this shift?")) {
      setActiveShiftState('completed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <EmployeeSidebar 
        employeeName={employee ? `${employee.first_name} ${employee.last_name}` : 'Field Specialist'} 
        role={employee?.role} 
      />

      <main className="flex-1 md:pl-64 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header & Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <Wifi className="w-3 h-3 text-emerald-600" /> Online • Live Sync
                </span>
                <span className="text-xs text-slate-400 font-medium">SCOMS 6.1 PWA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back, {employee.first_name}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2">
              {activeShiftState === 'clocked_in' ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-xs font-bold text-emerald-900">Shift Active: {formatElapsed(elapsedSeconds)}</span>
                  </div>
                  <button
                    onClick={handleClockOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    Clock Out
                  </button>
                </div>
              ) : activeShiftState === 'completed' ? (
                <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Shift Completed
                </div>
              ) : nextShift ? (
                <button
                  onClick={startClockInVerification}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Clock In (Site QR)
                </button>
              ) : null}
            </div>
          </div>

          {/* Active Job Status / Next Job Card */}
          {nextShift && (
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Assigned Job
                  </span>
                  <span className="text-xs text-slate-300">
                    {nextShift.start_time} – {nextShift.end_time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveShiftState(s => s === 'en_route' ? 'arrived' : 'en_route')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      activeShiftState === 'en_route' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {activeShiftState === 'en_route' ? 'Status: En Route' : 'Mark En Route'}
                  </button>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                {nextShift.customer_locations?.name ?? 'Assigned Client Facility'}
              </h2>
              {nextShift.customer_locations?.address && (
                <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-1.5 mb-4">
                  <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  {nextShift.customer_locations.address}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Geofence Radius</span>
                  <span className="font-semibold text-emerald-400">100m Required</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Site QR Code</span>
                  <span className="font-semibold text-indigo-300">Registered</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Scope Checklist</span>
                  <span className="font-semibold text-slate-200">Standard Commercial</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Clock-in Verification</span>
                  <span className="font-semibold text-amber-300">
                    {activeShiftState === 'clocked_in' ? 'Verified & Active' : 'Pending Scan'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid: 1 Col on Mobile, 3 Cols on Large Screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Schedule Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-indigo-600" /> Today's Shifts &amp; Routes
                </h2>

                {todaysShifts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="font-medium text-sm">No scheduled shifts for today.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysShifts.map(s => (
                      <div key={s.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-xs transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base sm:text-lg">{s.start_time} – {s.end_time}</h3>
                            <p className="text-sm font-semibold text-slate-700 mt-0.5">{s.customer_locations?.name ?? 'Facility Location'}</p>
                          </div>
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                            Scheduled
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                          {s.customer_locations?.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {s.customer_locations.address}
                            </span>
                          )}
                          {s.special_instructions && (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" /> Special Instructions
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Items & Safety Updates */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> Action Items &amp; Compliance SOPs
                </h2>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200/60 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-950">Chemical Safety SOP &amp; PPE Protocol</p>
                        <p className="text-xs text-amber-800 mt-0.5">Please review chemical dilution guidelines and wear required eye/hand PPE.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/employee/training')}
                      className="text-xs font-bold text-amber-900 px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 rounded-lg transition-colors self-start sm:self-auto"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Time & Performance Stats */}
            <div className="space-y-6">
              
              {/* Pay Period Hours Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Pay Period</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-slate-900">32.5</p>
                    <p className="text-xs font-semibold text-slate-500">Hours Approved</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">$585.00</p>
                    <p className="text-[10px] font-semibold text-slate-400">Est. Gross Pay</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => router.push('/employee/timesheets')}
                    className="w-full text-xs font-bold text-indigo-600 flex items-center justify-between hover:text-indigo-800 transition-colors"
                  >
                    <span>View All Timesheets</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Training Compliance Status */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Field Certifications</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">OSHA &amp; Facility Certified</p>
                    <p className="text-[11px] text-slate-500">Valid through Dec 2026</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                </div>
              </div>

              {/* Quick Mobile Shortcuts */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/employee/timesheets')}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> Time Off / Leave Request</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => router.push('/employee/training')}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> Incident Report</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Multi-Signal Clock-In & QR Verification Modal (Scope §8 & §9) */}
      {clockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Site Attendance Verification</h3>
                  <p className="text-[11px] text-slate-400">SCOMS Geofence &amp; QR Signals</p>
                </div>
              </div>
              <button
                onClick={() => setClockModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {verifyStep === 'gps' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 animate-pulse">
                    <Navigation className="w-7 h-7 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Verifying GPS Location...</h4>
                    <p className="text-xs text-slate-500 mt-1">Checking geofence radius at {nextShift?.customer_locations?.name ?? 'client location'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 text-left border border-slate-100">
                    <p>• Device Lat/Lng: Captured</p>
                    <p>• Geofence Match: In Range (98.4% confidence)</p>
                  </div>
                </div>
              )}

              {verifyStep === 'qr' && (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto text-white shadow-md relative">
                    <QrCode className="w-10 h-10 text-indigo-400" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Scan Site QR Code</h4>
                    <p className="text-xs text-slate-500 mt-1">Scan the physical SCOMS QR placard at facility entrance to verify on-site arrival.</p>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center gap-2">
                    <Camera className="w-6 h-6 text-slate-400" />
                    <p className="text-xs text-slate-600 font-medium">Camera active • Aim at site barcode/QR</p>
                    <button
                      onClick={completeQrScan}
                      disabled={verifying}
                      className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" /> Simulate QR Scan &amp; Confirm Clock-In
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {verifyStep === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Clock-In Verified!</h4>
                    <p className="text-xs text-slate-500 mt-1">Attendance recorded with GPS, Geofence &amp; Site QR verification signals.</p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Status: Verified On-Site
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
