"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck,
  MapPin,
  Clock,
  User,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DispatchPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [isDispatchingAll, setIsDispatchingAll] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [editingAssigneeJobId, setEditingAssigneeJobId] = useState<string | null>(null);
  const [editingAssigneeValue, setEditingAssigneeValue] = useState<string>("");
  const [dispatchMode, setDispatchMode] = useState<"auto" | "manual" | "emergency">("auto");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [jobsRes, empRes] = await Promise.all([
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
        supabase.from("users").select("id, first_name, last_name, email, role"),
      ]);

      if (jobsRes.data) setJobs(jobsRes.data);
      if (empRes.data) {
        // Filter or map employees
        const validEmps = empRes.data.map((u: any) => ({
          id: u.id,
          name: u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name || u.email,
          role: u.role || "Technician",
        }));
        setEmployees(validEmps);
      }
    } catch (err: any) {
      console.error("Error fetching dispatch data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleEntityCreated = (e: any) => {
      if (e.detail?.type === "job") {
        fetchData();
      }
    };
    window.addEventListener("scoms-entity-created", handleEntityCreated);
    return () => window.removeEventListener("scoms-entity-created", handleEntityCreated);
  }, [fetchData]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleAssign = async (jobId: string) => {
    const assignedName = selections[jobId];
    if (!assignedName) {
      alert("Please select a technician first.");
      return;
    }

    setIsAssigning(jobId);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ assigned: assignedName, status: "In Progress" })
        .eq("id", jobId);

      if (error) throw error;

      showToast(`Job successfully dispatched to ${assignedName}!`);
      await fetchData();
      setSelections((prev) => {
        const n = { ...prev };
        delete n[jobId];
        return n;
      });
    } catch (err: any) {
      alert("Failed to assign job: " + (err.message || "Unknown error"));
    } finally {
      setIsAssigning(null);
    }
  };

  const handleUpdateAssignee = async (jobId: string) => {
    if (!editingAssigneeValue) {
      setEditingAssigneeJobId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("jobs")
        .update({ assigned: editingAssigneeValue })
        .eq("id", jobId);

      if (error) throw error;

      showToast(`Assignee updated to ${editingAssigneeValue}!`);
      setEditingAssigneeJobId(null);
      await fetchData();
    } catch (err: any) {
      alert("Failed to update assignee: " + (err.message || "Unknown error"));
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "Completed") {
        updateData.completed_at = new Date().toISOString();
      } else if (newStatus === "Created") {
        updateData.assigned = null;
      }

      const { error } = await supabase.from("jobs").update(updateData).eq("id", jobId);
      if (error) throw error;

      showToast(`Job status updated to ${newStatus}`);
      await fetchData();
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Unknown error"));
    }
  };

  const handleDispatchAll = async () => {
    const pendingToDispatch = jobs.filter(
      (j) => !j.assigned || j.assigned === "Auto Assignee" || j.status === "Created"
    );

    if (pendingToDispatch.length === 0) {
      alert("There are no pending dispatches to process.");
      return;
    }

    setIsDispatchingAll(true);
    try {
      let count = 0;
      for (let i = 0; i < pendingToDispatch.length; i++) {
        const job = pendingToDispatch[i];
        let assignedTechnician = selections[job.id];

        if (!assignedTechnician) {
          if (dispatchMode === "auto" || dispatchMode === "emergency") {
            const emp = employees[i % (employees.length || 1)];
            assignedTechnician = emp ? emp.name : "BARATH Anand";
          }
        }

        if (assignedTechnician || dispatchMode !== "manual") {
          const { error } = await supabase
            .from("jobs")
            .update({
              assigned: assignedTechnician || "Lead Technician",
              status: "In Progress",
            })
            .eq("id", job.id);

          if (!error) count++;
        }
      }

      showToast(`Successfully dispatched ${count} job(s) in ${dispatchMode.toUpperCase()} mode!`);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Error dispatching jobs: " + err.message);
    } finally {
      setIsDispatchingAll(false);
    }
  };

  const pendingJobs = jobs.filter(
    (j) => !j.assigned || j.assigned === "Auto Assignee" || j.status === "Created"
  );
  const activeJobs = jobs.filter(
    (j) => j.assigned && j.assigned !== "Auto Assignee" && j.status !== "Created"
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-full font-sans">
      {/* Toast Banner */}
      {statusMessage && (
        <div className="p-3 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-slate-900 text-sm">Dispatch Mode:</span>
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setDispatchMode("auto")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                dispatchMode === "auto"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setDispatchMode("manual")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                dispatchMode === "manual"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setDispatchMode("emergency")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                dispatchMode === "emergency"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-rose-600 hover:bg-slate-200/60"
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Emergency
            </button>
          </div>

          <button
            onClick={() => fetchData()}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh dispatches"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <button
          onClick={handleDispatchAll}
          disabled={isDispatchingAll || pendingJobs.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
          {isDispatchingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Dispatching...
            </>
          ) : (
            <>
              <Truck className="w-4 h-4" /> Dispatch All ({pendingJobs.length})
            </>
          )}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Dispatch Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Pending Dispatch
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                {pendingJobs.length}
              </span>
            </h2>
            {dispatchMode === "auto" && pendingJobs.length > 0 && (
              <span className="text-xs text-blue-600 font-medium">AI auto-assign enabled</span>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                Loading pending dispatches...
              </div>
            ) : pendingJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-700">All current dispatches assigned!</p>
                <p className="text-xs text-slate-400 mt-1">
                  Schedule new jobs in the calendar to dispatch them here.
                </p>
              </div>
            ) : (
              pendingJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        JOB{job.id.split("-")[0].substring(0, 5).toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {job.status || "Created"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {job.type || "Commercial"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-1">
                    {job.title || job.client || "Operational Service Job"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location || job.client || "Facility on-site"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {job.job_date} {job.start_time ? `• ${job.start_time}` : ""}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selections[job.id] || ""}
                        onChange={(e) =>
                          setSelections({ ...selections, [job.id]: e.target.value })
                        }
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select technician...</option>
                        {employees.map((e) => (
                          <option key={e.id} value={e.name}>
                            {e.name} ({e.role})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => handleAssign(job.id)}
                      disabled={isAssigning === job.id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center justify-center min-w-[80px]"
                    >
                      {isAssigning === job.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Assign"
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Dispatches Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Active Dispatches
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                {activeJobs.length}
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                Loading active dispatches...
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg">
                No active dispatches. Assign pending dispatches on the left to activate them.
              </div>
            ) : (
              activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-emerald-200 hover:shadow-sm transition-all bg-slate-50/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      JOB{job.id.split("-")[0].substring(0, 5).toUpperCase()}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        job.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-0.5">
                    {job.title || job.client || "Unnamed Job"}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {job.type || "Commercial"} • {job.location || job.client || "Location on-site"}
                  </p>

                  {/* Assignee display / editor */}
                  <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {job.assigned || "Unassigned"}
                        </span>
                      </div>

                      {editingAssigneeJobId !== job.id ? (
                        <button
                          onClick={() => {
                            setEditingAssigneeJobId(job.id);
                            setEditingAssigneeValue(job.assigned || "");
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit Assignee
                        </button>
                      ) : null}
                    </div>

                    {/* Inline Editor for Assignee */}
                    {editingAssigneeJobId === job.id && (
                      <div className="flex items-center gap-2 mt-1 p-2 bg-white rounded-lg border border-blue-200">
                        <select
                          value={editingAssigneeValue}
                          onChange={(e) => setEditingAssigneeValue(e.target.value)}
                          className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1"
                        >
                          <option value="">Select employee...</option>
                          {employees.map((e) => (
                            <option key={e.id} value={e.name}>
                              {e.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateAssignee(job.id)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                          title="Save assignee"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingAssigneeJobId(null)}
                          className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Quick Status Progression Controls */}
                    <div className="flex items-center justify-between gap-2 pt-2 text-xs border-t border-dashed border-slate-200 mt-1">
                      <span className="text-slate-400">Actions:</span>
                      <div className="flex items-center gap-1.5">
                        {job.status !== "Completed" ? (
                          <button
                            onClick={() => handleStatusChange(job.id, "Completed")}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded transition-colors"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(job.id, "In Progress")}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(job.id, "Created")}
                          className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors flex items-center gap-1"
                          title="Recall to pending dispatches"
                        >
                          <RotateCcw className="w-3 h-3" /> Recall
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

