"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Search, Filter, Briefcase, FileText, 
  MapPin, Calendar, DollarSign, ChevronRight, CheckCircle2, 
  AlertTriangle, Clock, XCircle, ArrowRight, Loader2 
} from "lucide-react";

export default function ProcurementHub() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    agency: "",
    solicitation_number: "",
    due_date: "",
    estimated_value: "",
    location_city: "",
    location_state: "",
    priority: "Normal"
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('procurement_opportunities')
      .select('*')
      .order('due_date', { ascending: true });
      
    setOpportunities(data || []);
    setLoading(false);
  };

  const handleAddOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const newOp = {
      ...form,
      status: "New",
      posted_date: new Date().toISOString().split('T')[0],
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null
    };

    const { error } = await supabase.from('procurement_opportunities').insert([newOp]);
    if (!error) {
      setShowModal(false);
      setForm({
        title: "",
        agency: "",
        solicitation_number: "",
        due_date: "",
        estimated_value: "",
        location_city: "",
        location_state: "",
        priority: "Normal"
      });
      fetchOpportunities();
    } else {
      alert("Error adding opportunity: " + error.message);
    }
    setIsAdding(false);
  };

  const filteredOps = opportunities.filter(op => {
    const matchesSearch = (op.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
                          (op.agency?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || op.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (p: string) => {
    if (p === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
    if (p === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (p === 'Medium') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const totalValue = opportunities.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 font-sans pb-24">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Procurement Hub</h1>
          </div>
          <p className="text-slate-500 font-medium">Discover, score, and track commercial cleaning contracts across the nation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Add Opportunity
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Search className="w-5 h-5" /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Bids</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900">{opportunities.length}</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Total Opportunities</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qualified</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900">
              {opportunities.filter(o => o.ai_score && o.ai_score >= 85).length}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">High AI Score (&gt;85%)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900">${(totalValue / 1000).toFixed(0)}k</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Estimated Value</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deadlines</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900">
              {opportunities.filter(o => new Date(o.due_date) < new Date(Date.now() + 7 * 86400000)).length}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Due within 7 Days</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            {(["All", "New", "Qualified", "Approved to Pursue", "Submitted"]).map(s => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${filterStatus === s ? 'bg-white border border-slate-300 shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search contracts or agencies..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm w-72 focus:outline-none focus:border-indigo-500" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold sticky top-0 z-10">
              <tr>
                <th className="p-4 pl-6">Opportunity Title & Agency</th>
                <th className="p-4">AI Score</th>
                <th className="p-4">Location</th>
                <th className="p-4">Est. Value</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Priority</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></td></tr>
              ) : filteredOps.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500">No procurement opportunities found.</td></tr>
              ) : (
                filteredOps.map(op => (
                  <tr key={op.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 mb-1">{op.title}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {op.agency}</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {op.solicitation_number}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {op.ai_score ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-100 text-emerald-700">
                            {op.ai_score}
                          </div>
                        </div>
                      ) : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {op.location_city}, {op.location_state}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {op.estimated_value ? `$${op.estimated_value.toLocaleString()}` : 'TBD'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(op.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(op.priority)}`}>
                        {op.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-indigo-600 font-semibold text-xs ml-auto transition-opacity hover:text-indigo-800">
                        Workspace <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add Procurement Opportunity</h3>
            <form onSubmit={handleAddOpportunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. City Hall Janitorial Services" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agency</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.agency} onChange={e => setForm({...form, agency: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Solicitation #</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" value={form.solicitation_number} onChange={e => setForm({...form, solicitation_number: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input required type="date" className="w-full border rounded-lg px-3 py-2" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Est. Value ($)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2" value={form.estimated_value} onChange={e => setForm({...form, estimated_value: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" value={form.location_city} onChange={e => setForm({...form, location_city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" value={form.location_state} onChange={e => setForm({...form, location_state: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select className="w-full border rounded-lg px-3 py-2" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
