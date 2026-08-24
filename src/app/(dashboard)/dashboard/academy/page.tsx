'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  GraduationCap, BookOpen, CheckCircle2, Clock, Play, Award,
  Plus, Search, Loader2, X, AlertCircle, ChevronRight,
  BarChart2, Users, Star, AlertTriangle, BookMarked, Save
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface Course {
  id: string;
  series_number: number;
  course_number: number;
  title: string;
  description: string | null;
  series_name: string | null;
  estimated_minutes: number;
  is_published: boolean;
  passing_score: number;
  required_for_roles: string[];
}

interface Assignment {
  id: string;
  course_id: string;
  employee_id: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'expired';
  due_date: string | null;
  completed_at: string | null;
  score: number | null;
  attempts: number;
}

interface Employee {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

const SERIES_COLORS: Record<string, string> = {
  'Series 1 — Company Culture': 'bg-purple-100 text-purple-700',
  'Series 2 — Safety': 'bg-red-100 text-red-700',
  'Series 3 — Security': 'bg-orange-100 text-orange-700',
  'Series 4 — Cleaning Excellence': 'bg-blue-100 text-blue-700',
  'Series 5 — Quality': 'bg-emerald-100 text-emerald-700',
  'Series 6 — Responsibility': 'bg-amber-100 text-amber-700',
  'Series 7 — Leadership': 'bg-indigo-100 text-indigo-700',
};

const ACADEMY_COURSES = [
  { series: 'Series 1 — Company Culture', courses: ['Welcome to Secure Cleaning Operations', 'Mission, Vision, Values & Culture', 'Becoming a Secure Cleaning Professional'] },
  { series: 'Series 2 — Safety', courses: ['Safety Culture', 'Personal Protective Equipment', 'Chemical Safety', 'Chemical Emergency Response', 'Emergency Response'] },
  { series: 'Series 3 — Security', courses: ['Security Awareness', 'Keys, Badges & Restricted Access', 'Confidentiality & Client Privacy', 'Protecting Client Property', 'Situational Awareness'] },
  { series: 'Series 4 — Cleaning Excellence', courses: ['Professional Cleaning System', 'Office Cleaning Excellence', 'Restroom Excellence', 'Floor Care Excellence', 'Waste Management', 'Equipment Operation & Care'] },
  { series: 'Series 5 — Quality', courses: ['Attention to Detail', 'Quality Inspections', 'Customer Service Excellence', 'Handling Complaints Professionally', 'Professional Decision Making'] },
  { series: 'Series 6 — Responsibility', courses: ['Working Independently', 'Facility Awareness'] },
  { series: 'Series 7 — Leadership', courses: ['Supervisor Responsibilities', 'Coaching & Performance Improvement', 'Training New Employees', 'Final Practical Certification'] },
];

const STATUS_STYLES: Record<string, string> = {
  assigned: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-600',
  expired: 'bg-amber-100 text-amber-600',
};

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'certificates' | 'seed'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ course_id: '', employee_ids: [] as string[], due_date: '' });
  const [assigning, setAssigning] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total_courses: 0, assigned: 0, completed: 0, overdue: 0, certificates: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesRes, assignRes, empsRes, certsCount] = await Promise.all([
        supabase.from('academy_courses').select('*').order('series_number').order('course_number'),
        supabase.from('academy_assignments').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('employees').select('id,first_name,last_name').eq('status', 'active').order('first_name').limit(200),
        supabase.from('academy_certificates').select('*', { count: 'exact', head: true }),
      ]);
      const allCourses = coursesRes.data ?? [];
      const allAssignments = assignRes.data ?? [];
      setCourses(allCourses);
      setAssignments(allAssignments);
      setEmployees(empsRes.data ?? []);
      const overdue = allAssignments.filter(a =>
        a.status === 'assigned' && a.due_date && new Date(a.due_date) < new Date()
      ).length;
      setStats({
        total_courses: allCourses.length,
        assigned: allAssignments.filter(a => a.status !== 'completed').length,
        completed: allAssignments.filter(a => a.status === 'completed').length,
        overdue,
        certificates: certsCount.count ?? 0,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Seed the 30 academy courses
  const handleSeedCourses = async () => {
    setSeeding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
      const toInsert: Omit<Course, 'id'>[] = [];
      let courseNum = 1;
      ACADEMY_COURSES.forEach((series, si) => {
        series.courses.forEach(title => {
          toInsert.push({
            series_number: si + 1,
            course_number: courseNum++,
            title,
            description: `${series.series} — ${title}`,
            series_name: series.series,
            estimated_minutes: 20,
            is_published: true,
            passing_score: 80,
            required_for_roles: ['field_employee', 'supervisor'],
          } as any);
        });
      });
      // Insert in batches to avoid conflicts — use upsert by title
      for (const course of toInsert) {
        await supabase.from('academy_courses').upsert({ ...course, tenant_id: profile?.tenant_id } as any, { onConflict: 'title' as any }).select();
      }
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.course_id || assignForm.employee_ids.length === 0) return;
    setAssigning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
      const inserts = assignForm.employee_ids.map(eid => ({
        course_id: assignForm.course_id,
        employee_id: eid,
        status: 'assigned',
        due_date: assignForm.due_date || null,
        assigned_by: user!.id,
        tenant_id: profile?.tenant_id,
      }));
      const { error: err } = await supabase.from('academy_assignments').insert(inserts);
      if (err) throw err;
      setShowAssignModal(false);
      setAssignForm({ course_id: '', employee_ids: [], due_date: '' });
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAssigning(false);
    }
  };

  const groupedCourses = ACADEMY_COURSES.map(s => ({
    series: s.series,
    courses: courses.filter(c => c.series_name === s.series),
  }));

  const filteredAssignments = assignments.filter(a => {
    const course = courses.find(c => c.id === a.course_id);
    return !search || (course?.title ?? '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Secure Cleaning Operations Academy</h1>
              <p className="text-sm text-slate-500 mt-0.5">30-module professional certification training platform</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Assign Training
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Courses', value: stats.total_courses, icon: BookOpen, color: 'text-indigo-600' },
          { label: 'Active Assignments', value: stats.assigned, icon: Clock, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: stats.overdue > 0 ? 'text-red-600' : 'text-slate-400' },
          { label: 'Certificates Issued', value: stats.certificates, icon: Award, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {(['courses', 'assignments', 'certificates'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors rounded-t-lg ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-800'}`}>
            {tab}
          </button>
        ))}
        {courses.length === 0 && !loading && (
          <button onClick={() => setActiveTab('seed')}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors rounded-t-lg ml-auto ${activeTab === 'seed' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' : 'text-amber-500 hover:text-amber-700'}`}>
            ⚡ Initialize Courses
          </button>
        )}
      </div>

      {/* ── Courses Tab ────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : courses.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <GraduationCap className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="font-bold text-amber-800 text-lg mb-1">Academy Not Yet Initialized</h3>
              <p className="text-amber-600 text-sm mb-4">The 30 SCOMS Academy courses have not been seeded yet.</p>
              <button onClick={handleSeedCourses} disabled={seeding}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-amber-600 text-white rounded-lg font-semibold text-sm hover:bg-amber-700 disabled:opacity-50">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {seeding ? 'Initializing...' : 'Initialize All 30 Academy Courses'}
              </button>
            </div>
          ) : (
            groupedCourses.map(group => (
              <div key={group.series} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className={`px-5 py-3 flex items-center justify-between ${SERIES_COLORS[group.series] ?? 'bg-slate-100 text-slate-700'}`}>
                  <h3 className="font-bold text-sm">{group.series}</h3>
                  <span className="text-xs font-medium opacity-75">{group.courses.length} modules</span>
                </div>
                {group.courses.length === 0 ? (
                  <p className="px-5 py-3 text-sm text-slate-400 italic">No courses loaded for this series</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {group.courses.map(course => {
                      const completionCount = assignments.filter(a => a.course_id === course.id && a.status === 'completed').length;
                      const totalAssigned = assignments.filter(a => a.course_id === course.id).length;
                      return (
                        <div key={course.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                              {course.course_number}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{course.title}</p>
                              <p className="text-xs text-slate-400">{course.estimated_minutes} min · Passing: {course.passing_score}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {totalAssigned > 0 && (
                              <div className="text-right">
                                <p className="text-xs text-slate-400">{completionCount}/{totalAssigned} completed</p>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalAssigned > 0 ? (completionCount / totalAssigned) * 100 : 0}%` }} />
                                </div>
                              </div>
                            )}
                            {course.is_published ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Published</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">Draft</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Assignments Tab ─────────────────────────────────── */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-slate-800 bg-transparent" />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Training Assignments ({filteredAssignments.length})</h2>
            </div>
            {loading ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : filteredAssignments.length === 0 ? (
              <div className="py-16 text-center">
                <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No assignments yet</p>
                <p className="text-sm text-slate-400 mt-1">Assign training courses to employees</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAssignments.slice(0, 50).map(assignment => {
                  const course = courses.find(c => c.id === assignment.course_id);
                  const emp = employees.find(e => e.id === assignment.employee_id);
                  const isOverdue = assignment.status === 'assigned' && assignment.due_date && new Date(assignment.due_date) < new Date();
                  return (
                    <div key={assignment.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{course?.title ?? 'Unknown Course'}</p>
                          <p className="text-xs text-slate-500">{emp ? `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() : 'Unknown Employee'} {assignment.due_date ? `· Due: ${new Date(assignment.due_date).toLocaleDateString()}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {isOverdue && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">OVERDUE</span>}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLES[assignment.status]}`}>{assignment.status.replace('_', ' ')}</span>
                        {assignment.score != null && <span className="text-xs font-bold text-slate-700">{assignment.score}%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Certificates Tab ────────────────────────────────── */}
      {activeTab === 'certificates' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Certificates Issued</h2>
          </div>
          <CertificatesPanel courses={courses} employees={employees} />
        </div>
      )}

      {/* ── Assign Modal ────────────────────────────────────── */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Assign Training</h3>
              <button onClick={() => setShowAssignModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
            </div>
            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course <span className="text-red-500">*</span></label>
                <select required value={assignForm.course_id} onChange={e => setAssignForm(p => ({ ...p, course_id: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                  <option value="">Select a course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>#{c.course_number} {c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To <span className="text-red-500">*</span></label>
                <select multiple value={assignForm.employee_ids}
                  onChange={e => setAssignForm(p => ({ ...p, employee_ids: Array.from(e.target.selectedOptions, o => o.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 h-32">
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{`${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() || 'Employee'}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input type="date" value={assignForm.due_date} onChange={e => setAssignForm(p => ({ ...p, due_date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={assigning || !assignForm.course_id || assignForm.employee_ids.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {assigning ? 'Assigning...' : `Assign to ${assignForm.employee_ids.length || 0} employee(s)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Certificates Panel ───────────────────────────────────────────
function CertificatesPanel({ courses, employees }: { courses: Course[]; employees: Employee[] }) {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('academy_certificates').select('*').order('issued_at', { ascending: false }).limit(100)
      .then(r => { setCerts(r.data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  if (certs.length === 0) {
    return (
      <div className="py-16 text-center">
        <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No certificates issued yet</p>
        <p className="text-sm text-slate-400 mt-1">Certificates are issued when employees pass training modules</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {certs.map(cert => {
        const course = courses.find(c => c.id === cert.course_id);
        const emp = employees.find(e => e.id === cert.employee_id);
        return (
          <div key={cert.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{course?.title ?? 'Unknown Course'}</p>
                <p className="text-xs text-slate-500">{emp ? `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() : 'Unknown'} · Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {cert.score != null && <span className="text-sm font-bold text-emerald-600">{cert.score}%</span>}
              {cert.expires_at && (
                <span className="text-xs text-slate-400">Expires {new Date(cert.expires_at).toLocaleDateString()}</span>
              )}
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500">{cert.certificate_number ?? '—'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
