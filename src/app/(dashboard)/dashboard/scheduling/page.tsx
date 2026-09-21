"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus, MapPin, Clock, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader, Modal, FormField } from "@/components/ui";

function getWeekDays(anchor: Date) {
  const dow = anchor.getDay(); // 0=Sun
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d,
      dateStr: d.toISOString().split("T")[0],
      label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    };
  });
}

const JOB_TAG_CLASSES = [
  "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950 dark:border-primary-800 dark:text-primary-300",
  "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300",
  "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300",
  "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300",
];

export default function CalendarPage() {
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    client_name: "",
    job_date: new Date().toISOString().split("T")[0],
    title: "",
    location: "",
    start_time: "09:00",
    type: "commercial",
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const [{ data: j }, { data: c }] = await Promise.all([
        supabase.from("jobs").select("*").order("job_date", { ascending: true }),
        supabase.from("clients").select("id, name").order("name"),
      ]);
      setJobs(j || []);
      setClients(c || []);
    } catch (err) {
      console.error("Error fetching jobs for scheduling:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const week = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);

  const jobsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    week.forEach((d) => map.set(d.dateStr, []));
    jobs.forEach((j) => {
      const key = j.job_date;
      if (map.has(key)) map.get(key)!.push(j);
    });
    return map;
  }, [jobs, week]);

  const weekLabel = `${week[0].date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} — ${week[6].date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
  const todayStr = new Date().toISOString().split("T")[0];

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const client = clients.find((c) => c.name === addForm.client_name);
    const { error } = await supabase.from("jobs").insert([
      {
        client_id: client?.id || null,
        client: client?.name || addForm.client_name || "Unknown Client",
        title: addForm.title,
        location: addForm.location,
        job_date: addForm.job_date,
        start_time: addForm.start_time,
        type: addForm.type,
        status: "Created",
      },
    ]);
    if (!error) {
      setShowAddModal(false);
      setAddForm({ ...addForm, title: "", location: "", client_name: "" });
      fetchJobs();
    } else {
      console.error(error);
      alert("Error scheduling job: " + error.message);
    }
    setIsAdding(false);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("job_id");
    if (!jobId) return;

    // Optimistic update
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, job_date: targetDate } : j))
    );

    // Database update
    const { error } = await supabase
      .from("jobs")
      .update({ job_date: targetDate })
      .eq("id", jobId);
    if (error) {
      console.error(error);
      alert("Error rescheduling job: " + error.message);
      fetchJobs(); // Revert
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Schedule & Dispatch Calendar"
        description={`${jobs.length} jobs scheduled • Drag-and-drop to adjust operational dates`}
        breadcrumbs={[
          { label: "Operations", href: "/dashboard/operations" },
          { label: "Scheduling" },
        ]}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Schedule Job
          </button>
        }
      />

      {/* Week Navigation Header */}
      <div className="card p-4 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const d = new Date(weekAnchor);
              d.setDate(d.getDate() - 7);
              setWeekAnchor(d);
            }}
            className="btn btn-ghost btn-sm p-2"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-text-primary text-body-sm">{weekLabel}</span>
          <button
            onClick={() => {
              const d = new Date(weekAnchor);
              d.setDate(d.getDate() + 7);
              setWeekAnchor(d);
            }}
            className="btn btn-ghost btn-sm p-2"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekAnchor(new Date())}
            className="btn btn-secondary btn-sm text-caption"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3 text-caption text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success-500 inline-block" />
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card p-0 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-surface-hover">
          {week.map((d) => (
            <div
              key={d.dateStr}
              className={`p-3 text-center border-r border-border last:border-r-0 ${
                d.dateStr === todayStr ? "bg-primary-500/10" : ""
              }`}
            >
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                {d.label}
              </div>
              <div
                className={`text-title-sm font-bold mt-0.5 ${
                  d.dateStr === todayStr ? "text-primary-600" : "text-text-primary"
                }`}
              >
                {d.date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Job Cells */}
        <div className="grid grid-cols-7 min-h-[520px] divide-x divide-border relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/70 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          )}
          {week.map((d) => {
            const dayJobs = jobsByDate.get(d.dateStr) || [];
            return (
              <div
                key={d.dateStr}
                className={`p-2 space-y-2 min-h-[140px] transition-colors ${
                  d.dateStr === todayStr ? "bg-primary-500/5" : ""
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, d.dateStr)}
              >
                {dayJobs.length === 0 && !isLoading && (
                  <div className="h-full flex items-start justify-center pt-8">
                    <button
                      onClick={() => {
                        setAddForm((f) => ({ ...f, job_date: d.dateStr }));
                        setShowAddModal(true);
                      }}
                      className="text-text-muted/40 hover:text-primary-600 text-caption transition-colors flex items-center gap-1"
                      title="Schedule on this date"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {dayJobs.map((job, i) => (
                  <div
                    key={job.id || i}
                    draggable={true}
                    onDragStart={(e) => e.dataTransfer.setData("job_id", job.id)}
                    className={`p-2.5 rounded-lg border text-caption cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${
                      JOB_TAG_CLASSES[i % JOB_TAG_CLASSES.length]
                    }`}
                  >
                    <p className="font-semibold truncate leading-tight">
                      {job.title || job.client || "Untitled Assignment"}
                    </p>
                    {job.location && (
                      <div className="flex items-center gap-1 mt-1 opacity-80">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    )}
                    {job.start_time && (
                      <div className="flex items-center gap-1 mt-0.5 opacity-80">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{job.start_time}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Job Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule Operational Job"
        description="Book a sanitation, cleanroom, or regular service assignment."
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="schedule-form"
              disabled={isAdding}
              className="btn btn-primary btn-sm"
            >
              {isAdding ? "Scheduling..." : "Schedule Job"}
            </button>
          </>
        }
      >
        <form id="schedule-form" onSubmit={handleAddJob} className="space-y-4">
          <FormField label="Job Title" required>
            <input
              required
              type="text"
              className="form-input"
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              placeholder="e.g. Cleanroom Level 3 Terminal Sterilization"
            />
          </FormField>

          <FormField label="Client Facility" required>
            <select
              required
              className="form-input"
              value={addForm.client_name}
              onChange={(e) => setAddForm({ ...addForm, client_name: e.target.value })}
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Facility Location">
            <input
              type="text"
              className="form-input"
              value={addForm.location}
              onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
              placeholder="e.g. 100 Innovation Way, Suite 400"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Scheduled Date" required>
              <input
                required
                type="date"
                className="form-input"
                value={addForm.job_date}
                onChange={(e) => setAddForm({ ...addForm, job_date: e.target.value })}
              />
            </FormField>

            <FormField label="Start Time">
              <input
                type="time"
                className="form-input"
                value={addForm.start_time}
                onChange={(e) => setAddForm({ ...addForm, start_time: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Service Type">
            <select
              className="form-input capitalize"
              value={addForm.type}
              onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
            >
              {["commercial", "healthcare", "industrial", "cleanroom", "security", "retail"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                )
              )}
            </select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
