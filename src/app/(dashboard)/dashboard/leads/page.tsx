"use client";

import { useState, useEffect } from "react";
import { Search, Plus, DollarSign, Brain, Mail, Phone, Loader2, X, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const STAGES = ['new','contacted','qualified','walkthrough_scheduled','proposal_sent'] as const;
const STAGE_COLORS: Record<string, string> = {
  new: 'bg-slate-400', contacted: 'bg-blue-400', qualified: 'bg-amber-400',
  walkthrough_scheduled: 'bg-indigo-400', proposal_sent: 'bg-orange-400',
};

type LeadForm = {
  first_name: string; last_name: string; company_name: string;
  phone: string; email: string; facility_type: string;
  square_footage: string; estimated_value: string; notes: string;
};

const EMPTY_FORM: LeadForm = {
  first_name: '', last_name: '', company_name: '', phone: '',
  email: '', facility_type: '', square_footage: '', estimated_value: '', notes: '',
};

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLeads(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.company_name.trim()) { setFormError('Company name is required.'); return; }
    setIsSaving(true);
    const { error } = await supabase.from('leads').insert([{
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      company_name: form.company_name,
      phone: form.phone || null,
      email: form.email || null,
      facility_type: form.facility_type || null,
      square_footage: form.square_footage ? parseInt(form.square_footage) : null,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      notes: form.notes || null,
      status: 'new',
    }]);
    if (error) {
      setFormError(error.message);
    } else {
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchLeads();
    }
    setIsSaving(false);
  };

  const getByStage = (stage: string) =>
    leads.filter(l =>
      (l.status === stage) &&
      (l.company_name?.toLowerCase().includes(search.toLowerCase()) ||
       `${l.first_name} ${l.last_name}`.toLowerCase().includes(search.toLowerCase()))
    );

  const field = (key: keyof LeadForm, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-full font-sans overflow-x-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Contract Lead Intelligence Center</h1>
          <p className="text-slate-500 text-sm">Discover, organize, and convert commercial cleaning opportunities.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search prospects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" /> Loading Pipeline...
          </div>
        ) : (
          STAGES.map(stage => (
            <div key={stage} className="min-w-[300px] w-[300px] bg-slate-100/60 rounded-xl p-4 border border-slate-200/60 snap-start flex flex-col h-[calc(100vh-220px)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[stage]}`} />
                  {stage.replace(/_/g, ' ')}
                </h3>
                <span className="bg-white text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {getByStage(stage).length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {getByStage(stage).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No leads</p>
                ) : getByStage(stage).map(lead => (
                  <div key={lead.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{lead.company_name}</h4>
                    {lead.facility_type && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <Building2 className="w-3 h-3" /> {lead.facility_type}
                      </p>
                    )}
                    {lead.estimated_value && (
                      <div className="text-xs flex items-center gap-1 mb-3">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-slate-700">${parseFloat(lead.estimated_value).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>{[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}</span>
                      <div className="flex gap-1">
                        {lead.phone && <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"><Phone className="w-3.5 h-3.5" /></button>}
                        {lead.email && <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"><Mail className="w-3.5 h-3.5" /></button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">New Lead</h3>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setFormError(''); }}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-900" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                <input required type="text" value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field('first_name', 'Contact First Name')}
                {field('last_name', 'Contact Last Name')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field('email', 'Email', 'email')}
                {field('phone', 'Phone')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facility Type</label>
                  <select value={form.facility_type} onChange={e => setForm(p => ({ ...p, facility_type: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Select...</option>
                    {['Office','Medical','Industrial','Educational','Government','Retail','Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {field('square_footage', 'Square Footage', 'number', '0')}
              </div>
              {field('estimated_value', 'Est. Contract Value ($)', 'number', '0.00')}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
