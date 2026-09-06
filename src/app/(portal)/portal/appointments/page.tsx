"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon, Clock, Video, CheckCircle2, User,
  Building, AlertCircle, ArrowLeft, Loader2
} from "lucide-react";

export default function ClientAppointmentsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    appointment_type: 'virtual_walkthrough',
    preferred_date: '',
    preferred_time: '10:00 AM',
    contact_name: '',
    contact_email: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 pb-20 font-display">
      <div className="flex items-center gap-3">
        <Link
          href="/portal/communications"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Client Self-Service</span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Schedule Video Walkthrough or Audit</h1>
        </div>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4 shadow-sm animate-in fade-in-50">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">Walkthrough Appointment Confirmed!</h2>
          <p className="text-sm text-emerald-700 max-w-md mx-auto">
            Your virtual walkthrough has been scheduled with our operations director. An encrypted Jitsi Meet room link and calendar invite have been sent to your email.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/portal/communications"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
            >
              Go to Communications Hub
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Session Type
                </label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.appointment_type}
                  onChange={e => setForm({ ...form, appointment_type: e.target.value })}
                >
                  <option value="virtual_walkthrough">📹 Virtual Site Walkthrough (Jitsi HD)</option>
                  <option value="quality_review">📋 Monthly Quality & ATP Swab Review</option>
                  <option value="contract_adjustment">📝 Scope Adjustment & Contract Addendum</option>
                  <option value="emergency_consult">🚨 Facility Emergency Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Preferred Date
                </label>
                <input
                  required
                  type="date"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.preferred_date}
                  onChange={e => setForm({ ...form, preferred_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Preferred Time Slot
                </label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.preferred_time}
                  onChange={e => setForm({ ...form, preferred_time: e.target.value })}
                >
                  <option value="09:00 AM">09:00 AM EST</option>
                  <option value="10:00 AM">10:00 AM EST</option>
                  <option value="01:30 PM">01:30 PM EST</option>
                  <option value="03:00 PM">03:00 PM EST</option>
                  <option value="04:30 PM">04:30 PM EST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Your Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Facility Manager / Director"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.contact_name}
                  onChange={e => setForm({ ...form, contact_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Work Email for Meeting Invite
              </label>
              <input
                required
                type="email"
                placeholder="manager@facility.com"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.contact_email}
                onChange={e => setForm({ ...form, contact_email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Areas of Focus or Specific Requests
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Focus on 3rd floor surgical suites, verify high-dusting schedules, or review ATP swab logs."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                disabled={loading}
                type="submit"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-900/20 flex items-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarIcon className="w-4 h-4" />}
                <span>Confirm Walkthrough Appointment</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
