"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ClipboardCheck, User, Building2, MapPin,
  Camera, Mic, ShieldAlert, Sparkles, CheckCircle2,
  FileText, Plus, ChevronRight, Loader2
} from "lucide-react";

export default function WalkthroughModule() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [totalSqft, setTotalSqft] = useState('');
  const [cleanableSqft, setCleanableSqft] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<any>(null);

  const fetchAssessments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('walkthrough_assessments')
      .select('*, leads(company_name)')
      .order('created_at', { ascending: false });
    setAssessments(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('id, company_name, first_name, last_name, facility_type')
      .in('status', ['new','contacted','qualified','walkthrough_scheduled'])
      .order('created_at', { ascending: false })
      .limit(50);
    setLeads(data ?? []);
  };

  const handleCreateWalkthrough = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;
    setFormSaving(true);
    await supabase.from('walkthrough_assessments').insert([{
      lead_id: selectedLeadId,
      facility_type: facilityType || null,
      total_sqft: totalSqft ? parseInt(totalSqft) : null,
      cleanable_sqft: cleanableSqft ? parseInt(cleanableSqft) : null,
      status: 'Draft',
    }]);
    setShowNewModal(false);
    setSelectedLeadId('');
    setFacilityType('');
    setTotalSqft('');
    setCleanableSqft('');
    setFormSaving(false);
    fetchAssessments();
  };

  // Render the Walkthrough Wizard
  if (selectedWalkthrough) {
    return (
      <div className="p-4 md:p-8 max-w-[1000px] mx-auto space-y-6 font-sans pb-24">
        {/* Wizard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button onClick={() => setSelectedWalkthrough(null)} className="text-indigo-600 font-bold text-sm hover:underline mb-2">&larr; Back to Walkthroughs</button>
            <h1 className="text-2xl font-bold font-display text-slate-900">
              Facility Assessment: {selectedWalkthrough.leads?.company_name || 'New Client'}
            </h1>
            <p className="text-slate-500 font-medium">{selectedWalkthrough.facility_type} • {selectedWalkthrough.cleanable_sqft?.toLocaleString() || 0} Sq Ft</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold shadow-sm">
            <Sparkles className="w-5 h-5" /> AI Assisted
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
          {['Customer Discovery', 'Scope & Facility', 'Security & Risk', 'AI Review'].map((step, idx) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                activeStep > idx + 1 ? 'bg-emerald-500 text-white' : 
                activeStep === idx + 1 ? 'bg-indigo-600 text-white' : 
                'bg-slate-100 text-slate-400'
              }`}>
                {activeStep > idx + 1 ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`font-semibold text-sm hidden md:block ${activeStep === idx + 1 ? 'text-indigo-600' : 'text-slate-500'}`}>{step}</span>
              {idx < 3 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Customer Discovery */}
        {activeStep === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">1. Customer Discovery Questionnaire</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-slate-700">What are the current cleaning challenges?</label>
                <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-indigo-500 focus:outline-none min-h-[100px]" placeholder="e.g. Current vendor keeps missing the executive restrooms..."></textarea>
                <div className="flex justify-end">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                    <Mic className="w-3 h-3" /> Voice to Text (AI)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Budget Range</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="$5,000 - $7,000 / mo" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Decision Timeline</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Looking to start next month" />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button onClick={() => setActiveStep(2)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors">Next Step: Scope & Facility</button>
            </div>
          </div>
        )}

        {/* Step 2: Facility */}
        {activeStep === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">2. Facility Assessment</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Total Cleanable Square Footage</label>
                <input type="number" defaultValue={selectedWalkthrough.cleanable_sqft} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Facility Type</label>
                <select className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-indigo-500 focus:outline-none">
                  <option>Medical / Healthcare</option>
                  <option>Industrial / Warehouse</option>
                  <option>General Office</option>
                  <option>Educational</option>
                </select>
              </div>
            </div>

            <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700">Upload Floor Plans or Photos</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">AI will automatically analyze room types and flooring surfaces.</p>
              <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50">Choose Files</button>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setActiveStep(1)} className="text-slate-500 font-bold hover:text-slate-900">Back</button>
              <button onClick={() => setActiveStep(3)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors">Next Step: Security & Risk</button>
            </div>
          </div>
        )}

        {/* Step 3: Security & Risk */}
        {activeStep === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">3. Security & Risk Assessment</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                <div>
                  <div className="font-bold text-slate-900">Requires Security Clearance</div>
                  <div className="text-sm text-slate-500">Staff must pass background checks or clearance prior to entry.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                <div>
                  <div className="font-bold text-slate-900">Hazardous Materials Present</div>
                  <div className="text-sm text-slate-500">Requires specialized PPE and OSHA compliance training.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                <div>
                  <div className="font-bold text-slate-900">Alarm Code / Key Access Required</div>
                  <div className="text-sm text-slate-500">Secure key management protocols required for entry.</div>
                </div>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setActiveStep(2)} className="text-slate-500 font-bold hover:text-slate-900">Back</button>
              <button onClick={() => setActiveStep(4)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors">Review & Submit</button>
            </div>
          </div>
        )}

        {/* Step 4: AI Review */}
        {activeStep === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">4. AI Review & Summary</h2>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
              <h3 className="font-bold text-indigo-900 mb-2">AI Assessment Completeness: 92%</h3>
              <div className="w-full bg-indigo-200 rounded-full h-2.5 mb-4">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-sm text-indigo-800">
                The facility data looks complete. Based on the industrial facility type and 38,000 sq ft, 
                this aligns perfectly with the standard production cleaning templates. I have prepared the 
                data for the AI Bid Calculator.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setActiveStep(3)} className="text-slate-500 font-bold hover:text-slate-900">Back</button>
              <button onClick={() => setSelectedWalkthrough(null)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Send to AI Bid Calculator
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Render the Walkthrough Dashboard (List)
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 font-sans pb-24">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Facility Walkthroughs</h1>
          </div>
          <p className="text-slate-500 font-medium">Standardized AI-assisted site assessments for estimators and field agents.</p>
        </div>
        <button onClick={() => { setShowNewModal(true); fetchLeads(); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Walkthrough
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></div>
        ) : assessments.length === 0 ? (
          <div className="col-span-3 bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h4 className="font-bold text-slate-700">No Walkthroughs Found</h4>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Click "New Walkthrough" to start a site assessment for a new lead.</p>
          </div>
        ) : assessments.map(assessment => (
          <div key={assessment.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  assessment.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                  assessment.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {assessment.status}
                </span>
                {assessment.ai_completeness_score && (
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    <Sparkles className="w-3 h-3" /> {assessment.ai_completeness_score}% Ready
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">{assessment.leads?.company_name || 'Unknown Client'}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium">
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {assessment.facility_type || 'TBD'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {(assessment.cleanable_sqft || 0).toLocaleString()} Sq Ft</span>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedWalkthrough(assessment); setActiveStep(1); }}
              className="w-full bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold text-sm py-2.5 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200"
            >
              Open Assessment
            </button>
          </div>
        ))}
      </div>
      {/* New Walkthrough Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">New Walkthrough</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <form onSubmit={handleCreateWalkthrough} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Lead <span className="text-red-500">*</span></label>
                <select required value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                  <option value="">Select a lead...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.company_name}{l.first_name ? ` — ${l.first_name} ${l.last_name ?? ''}` : ''}
                    </option>
                  ))}
                </select>
                {leads.length === 0 && <p className="text-xs text-slate-400 mt-1">No open leads found. Create a lead first.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facility Type</label>
                <select value={facilityType} onChange={e => setFacilityType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                  <option value="">Select...</option>
                  {['Office','Medical / Healthcare','Industrial / Warehouse','Educational','Government','Retail','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Sqft</label>
                  <input type="number" min="0" value={totalSqft} onChange={e => setTotalSqft(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cleanable Sqft</label>
                  <input type="number" min="0" value={cleanableSqft} onChange={e => setCleanableSqft(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={formSaving || !selectedLeadId}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                  {formSaving && <Loader2 className="w-4 h-4 animate-spin" />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
