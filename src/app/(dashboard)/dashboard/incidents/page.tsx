'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  AlertTriangle, Plus, Search, Loader2, X, AlertCircle,
  Save, ChevronRight, Clock, CheckCircle2, User, MapPin,
  Eye, MessageSquare, FileText, Flame
} from 'lucide-react';

interface Incident {
  id: string;
  incident_number: string | null;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'under_investigation' | 'corrective_action' | 'closed';
  description: string;
  immediate_action: string | null;
  investigation_notes: string | null;
  root_cause: string | null;
  created_at: string;
  updated_at: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const STATUS_STYLES: Record<string, string> = {
  reported: 'bg-slate-100 text-slate-600',
  under_investigation: 'bg-amber-100 text-amber-700',
  corrective_action: 'bg-blue-100 text-blue-700',
  closed: 'bg-emerald-100 text-emerald-700',
};

const STATUS_LABELS: Record<string, string> = {
  reported: 'Reported',
  under_investigation: 'Under Investigation',
  corrective_action: 'Corrective Action',
  closed: 'Closed',
};

const INCIDENT_TYPES = ['injury', 'near_miss', 'unsafe_condition', 'chemical', 'spill', 'property_damage', 'security', 'client_incident', 'equipment', 'other'];

const EMPTY_FORM = {
  title: '', type: 'unsafe_condition', severity: 'medium', description: '',
  immediate_action: '', investigation_notes: '', root_cause: '',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (filterStatus !== 'all') q = q.eq('status', filterStatus);
      if (filterSeverity !== 'all') q = q.eq('severity', filterSeverity);
      const { data, error: err } = await q;
      if (err) throw err;
      setIncidents(data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterSeverity]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const openCreate = () => { setEditingIncident(null); setForm(EMPTY_FORM); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
      const incNum = `INC-${Date.now().toString().slice(-6)}`;
      const payload = {
        title: form.title.trim(),
        type: form.type,
        severity: form.severity,
        description: form.description.trim(),
        immediate_action: form.immediate_action || null,
        investigation_notes: form.investigation_notes || null,
        root_cause: form.root_cause || null,
        tenant_id: profile?.tenant_id,
        updated_at: new Date().toISOString(),
      };

      if (editingIncident) {
        const { error: err } = await supabase.from('incidents').update(payload).eq('id', editingIncident.id);
        if (err) throw err;
        // Log update
        await supabase.from('incident_updates').insert({
          incident_id: editingIncident.id,
          update_type: 'updated',
          notes: 'Incident details updated',
          tenant_id: profile?.tenant_id,
          created_by: user!.id,
        });
      } else {
        const { error: err } = await supabase.from('incidents').insert({
          ...payload, status: 'reported', incident_number: incNum, reported_by: user!.id, reported_at: new Date().toISOString(),
        });
        if (err) throw err;
      }
      setShowModal(false);
      fetchIncidents();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const advanceStatus = async (incident: Incident) => {
    const flow: Incident['status'][] = ['reported', 'under_investigation', 'corrective_action', 'closed'];
    const currentIdx = flow.indexOf(incident.status);
    if (currentIdx >= flow.length - 1) return;
    const nextStatus = flow[currentIdx + 1];
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
    await supabase.from('incidents').update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
      ...(nextStatus === 'closed' ? { closed_at: new Date().toISOString() } : {}),
    }).eq('id', incident.id);
    await supabase.from('incident_updates').insert({
      incident_id: incident.id,
      update_type: 'status_change',
      notes: `Status changed to ${STATUS_LABELS[nextStatus]}`,
      tenant_id: profile?.tenant_id,
      created_by: user!.id,
    });
    fetchIncidents();
  };

  const filtered = incidents.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical' && i.status !== 'closed').length,
    open: incidents.filter(i => i.status !== 'closed').length,
    closed: incidents.filter(i => i.status === 'closed').length,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incident Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track, investigate, and resolve workplace incidents</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: stats.total, color: 'text-slate-900' },
          { label: 'Critical Open', value: stats.critical, color: stats.critical > 0 ? 'text-red-600' : 'text-slate-400' },
          { label: 'Open', value: stats.open, color: stats.open > 0 ? 'text-amber-600' : 'text-slate-400' },
          { label: 'Closed', value: stats.closed, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-800 bg-transparent" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none">
          <option value="all">All Severities</option>
          {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Incidents ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No incidents found</p>
            {incidents.length === 0 && <p className="text-sm text-slate-400 mt-1">Report any incident as soon as it occurs</p>}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(incident => (
              <div key={incident.id} className="px-5 py-4 flex items-start justify-between hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${incident.severity === 'critical' ? 'bg-red-100' : incident.severity === 'high' ? 'bg-orange-100' : 'bg-amber-100'}`}>
                    {incident.severity === 'critical' ? <Flame className="w-4 h-4 text-red-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{incident.title}</p>
                      {incident.incident_number && <span className="text-[11px] text-slate-400 font-mono">{incident.incident_number}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${SEVERITY_STYLES[incident.severity]}`}>{incident.severity}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLES[incident.status]}`}>{STATUS_LABELS[incident.status]}</span>
                      <span className="text-xs text-slate-400 capitalize">{incident.type.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(incident.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{incident.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {incident.status !== 'closed' && (
                    <button onClick={() => advanceStatus(incident)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap">
                      → {STATUS_LABELS[['reported', 'under_investigation', 'corrective_action', 'closed'][(['reported', 'under_investigation', 'corrective_action', 'closed'].indexOf(incident.status) + 1)] ?? 'closed']}
                    </button>
                  )}
                  <button onClick={() => { setEditingIncident(incident); setForm({ title: incident.title, type: incident.type, severity: incident.severity, description: incident.description, immediate_action: incident.immediate_action ?? '', investigation_notes: incident.investigation_notes ?? '', root_cause: incident.root_cause ?? '' }); setShowModal(true); }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingIncident ? 'Update Incident' : 'Report Incident'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Incident Title <span className="text-red-500">*</span></label>
                <input required type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Brief description of the incident"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                    {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                  <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                    {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Detailed description of what happened, when, where, and who was involved..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Immediate Action Taken</label>
                <textarea rows={3} value={form.immediate_action} onChange={e => setForm(p => ({ ...p, immediate_action: e.target.value }))}
                  placeholder="What was done immediately to address the situation..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-y" />
              </div>
              {editingIncident && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Investigation Notes</label>
                    <textarea rows={3} value={form.investigation_notes} onChange={e => setForm(p => ({ ...p, investigation_notes: e.target.value }))}
                      placeholder="Findings from the investigation..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-y" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Root Cause</label>
                    <textarea rows={2} value={form.root_cause} onChange={e => setForm(p => ({ ...p, root_cause: e.target.value }))}
                      placeholder="Identified root cause..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-y" />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : editingIncident ? 'Update' : 'Report Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
