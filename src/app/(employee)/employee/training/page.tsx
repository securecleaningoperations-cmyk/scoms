"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import { getMyEmployee } from "@/lib/services/employeePortal";
import { supabase } from "@/lib/supabase";
import {
  BookOpen, CheckCircle2, PlayCircle, Loader2, AlertCircle,
  Award, Clock, ShieldCheck, Sparkles, Printer
} from "lucide-react";
import { CoursePlayerModal } from "@/components/training/CoursePlayerModal";

const INITIAL_PENDING_TRAININGS = [
  {
    id: "tr-1",
    module_name: "Personal Protective Equipment & Chemical Dilution Protocols",
    series: "Series 2 — Safety & Compliance",
    status: "assigned",
    estimated_minutes: 20,
    score: null,
    completed_at: null
  },
  {
    id: "tr-2",
    module_name: "Keys, Badges & Restricted Access in CMMC Facilities",
    series: "Series 3 — Security & Defense Readiness",
    status: "assigned",
    estimated_minutes: 25,
    score: null,
    completed_at: null
  },
  {
    id: "tr-3",
    module_name: "Restroom Excellence & Cross-Contamination Prevention",
    series: "Series 4 — Cleaning Excellence",
    status: "assigned",
    estimated_minutes: 20,
    score: null,
    completed_at: null
  }
];

const INITIAL_COMPLETED_TRAININGS = [
  {
    id: "tr-4",
    module_name: "Welcome to Secure Cleaning Operations — Culture & Core Values",
    series: "Series 1 — Company Culture",
    status: "completed",
    estimated_minutes: 15,
    score: 100,
    completed_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export default function EmployeeTrainingPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<any>({
    first_name: "Field",
    last_name: "Technician",
    role: "cleaner"
  });
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const emp = await getMyEmployee();
        if (emp) {
          setEmployee(emp);
          const { data } = await supabase
            .from("employee_training_records")
            .select("*")
            .eq("employee_id", emp.id)
            .order("completed_at", { ascending: false });

          if (data && data.length > 0) {
            setTrainings(data);
          } else {
            setTrainings([...INITIAL_PENDING_TRAININGS, ...INITIAL_COMPLETED_TRAININGS]);
          }
        } else {
          setTrainings([...INITIAL_PENDING_TRAININGS, ...INITIAL_COMPLETED_TRAININGS]);
        }
      } catch (e) {
        setTrainings([...INITIAL_PENDING_TRAININGS, ...INITIAL_COMPLETED_TRAININGS]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-9 h-9 animate-spin text-indigo-500" />
      </div>
    );
  }

  const incomplete = trainings.filter(t => t.status !== "completed");
  const completed = trainings.filter(t => t.status === "completed");

  const handleModuleCompleted = (passedScore: number) => {
    if (!activeModule) return;

    setTrainings(prev =>
      prev.map(item =>
        item.id === activeModule.id
          ? {
              ...item,
              status: "completed",
              score: passedScore,
              completed_at: new Date().toISOString()
            }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-display">
      <EmployeeSidebar
        employeeName={`${employee.first_name} ${employee.last_name}`}
        role={employee.role}
      />
      <main className="flex-1 md:pl-64 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SCOMS Academy Compliance</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Employee Training Hub
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Complete your OSHA, safety, and security certifications to maintain active clearance.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shrink-0">
                <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold block">
                  Completed Certifications
                </span>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">
                  {completed.length} / {trainings.length}
                </p>
              </div>
            </div>
          </div>

          {/* Action Required: Pending Modules */}
          {incomplete.length > 0 ? (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-rose-100 bg-rose-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <h2 className="text-sm sm:text-base font-bold text-rose-900">
                    Action Required: {incomplete.length} Pending Training Modules
                  </h2>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full">
                  Due Soon
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {incomplete.map(t => (
                  <div
                    key={t.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {t.series || "Safety Protocol"}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {t.module_name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {t.estimated_minutes || 20} mins
                        </span>
                        <span>•</span>
                        <span>Interactive Video & Exam</span>
                        {t.score && (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            Last Score: {t.score}% (Requires 80% to pass)
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveModule(t)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-900/20 transition hover:scale-[1.02] shrink-0"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Start Video & Quiz</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-900">You're 100% Certified!</h2>
                <p className="text-emerald-700 text-xs sm:text-sm mt-0.5">
                  All assigned safety, compliance, and excellence modules are completed with passing scores.
                </p>
              </div>
            </div>
          )}

          {/* History */}
          {completed.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Certifications & Completed Modules ({completed.length})
                  </h2>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {completed.map(t => (
                  <div
                    key={t.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {t.module_name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Completed on {new Date(t.completed_at || Date.now()).toLocaleDateString()} · Verifiable Digital Certificate Issued
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                        Score: {t.score || 100}%
                      </span>
                      <button
                        onClick={() => setActiveModule(t)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                      >
                        Review / Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Interactive Video & Quiz Modal */}
      {activeModule && (
        <CoursePlayerModal
          courseTitle={activeModule.module_name}
          seriesName={activeModule.series || undefined}
          employeeName={`${employee.first_name} ${employee.last_name}`}
          onClose={() => setActiveModule(null)}
          onCourseCompleted={handleModuleCompleted}
        />
      )}
    </div>
  );
}
