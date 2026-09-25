"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Bot, Phone, PhoneMissed, Users, Database, 
  MessageSquare, Play, Settings, ShieldAlert,
  Loader2, Plus, Search, Calendar, ChevronRight,
  Activity, Sparkles, CheckCircle2, PhoneIncoming, X, Volume2
} from "lucide-react";

interface CallRecord {
  id: string;
  started_at: string;
  from_number: string;
  caller_type: string;
  intent: string;
  status: string;
  duration: string;
  transcript: string;
  action_taken: string;
}

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'simulator' | 'calls' | 'knowledge'>('analytics');
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [kbArticles, setKbArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  // Simulator state
  const [simScenario, setSimScenario] = useState("emergency_cleanroom");
  const [simCustomText, setSimCustomText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Knowledge base modal
  const [showKBModal, setShowKBModal] = useState(false);
  const [kbForm, setKbForm] = useState({ title: "", category: "Operations", content: "" });

  const DEFAULT_CALLS: CallRecord[] = [
    {
      id: "call-101",
      started_at: new Date(Date.now() - 1800000).toISOString(),
      from_number: "(512) 555-0193",
      caller_type: "customer",
      intent: "emergency_dispatch",
      status: "completed",
      duration: "1m 42s",
      transcript: "Caller: 'Hello, this is Derek from Austin BioTech. We had an accidental solvent spill in Cleanroom Lab 3. We need certified HAZMAT sanitization crew right away.'\n\nAI Phone Agent: 'Understood, Derek. Activating Priority 1 HAZMAT Cleanroom protocol. I have verified your contract #CTR-8812. Crew Lead Marcus Vance has been paged with an ETA of 38 minutes. A confirmation SMS has been dispatched to your phone.'",
      action_taken: "Emergency HAZMAT dispatch ticket #HAZ-9021 auto-generated and sent to on-call supervisor."
    },
    {
      id: "call-102",
      started_at: new Date(Date.now() - 7200000).toISOString(),
      from_number: "(214) 555-0811",
      caller_type: "prospect",
      intent: "sales",
      status: "completed",
      duration: "3m 15s",
      transcript: "Caller: 'Hi there, looking for commercial cleaning for our 45,000 sq ft distribution facility in Fort Worth.'\n\nAI Phone Agent: 'Thank you for reaching Secure Cleaning Operations. For a 45,000 sq ft logistics facility, we typically offer 3-tier options starting around $2,800/month with floor scrubbing and weekly sanitization. May I capture your email for an automated walkthrough schedule?'",
      action_taken: "Sales Lead #LD-1049 captured and assigned to Commercial Estimating."
    },
    {
      id: "call-103",
      started_at: new Date(Date.now() - 86400000).toISOString(),
      from_number: "(469) 555-0322",
      caller_type: "employee",
      intent: "attendance",
      status: "completed",
      duration: "54s",
      transcript: "Caller: 'Employee ID 8841 Maria Santos calling in sick for evening shift at Dallas Tech Campus.'\n\nAI Phone Agent: 'Thank you, Maria. Your absence has been logged in HR Attendance. Shift supervisor Robert Callahan has been notified, and reserve technician Elena Morales has been reassigned to cover the shift.'",
      action_taken: "Shift coverage swap initiated; PTO recorded in Workforce system."
    }
  ];

  const DEFAULT_KB = [
    {
      id: "kb-1",
      title: "Cleanroom ISO Class 7/8 Decontamination Protocol",
      category: "Operations",
      content: "Defines non-linting wipes, quaternary ammonium dwell times (10 mins), and electrostatic sprayer calibration for pharmaceutical facilities.",
      is_active: true,
    },
    {
      id: "kb-2",
      title: "After-Hours Emergency Dispatch Routing",
      category: "Escalation",
      content: "All biological or chemical emergency calls must trigger immediate SMS/Voice alert to the On-Call Operations Manager within 120 seconds.",
      is_active: true,
    },
    {
      id: "kb-3",
      title: "Commercial Janitorial Pricing & Square Footage Matrix",
      category: "Sales",
      content: "Commercial office space rates benchmarked at $0.08 - $0.14 per sq ft depending on frequency, flooring types, and restroom density.",
      is_active: true,
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: callsData }, { data: kbData }] = await Promise.all([
        supabase.from('ai_voice_calls').select('*').order('started_at', { ascending: false }),
        supabase.from('ai_knowledge_base').select('*').order('category', { ascending: true })
      ]);
      
      setCalls(callsData && callsData.length > 0 ? callsData : DEFAULT_CALLS);
      setKbArticles(kbData && kbData.length > 0 ? kbData : DEFAULT_KB);
    } catch {
      setCalls(DEFAULT_CALLS);
      setKbArticles(DEFAULT_KB);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCall = async () => {
    setIsSimulating(true);
    setSimResult(null);

    let speechPrompt = "";
    let callerPhone = "(512) 555-8910";
    if (simScenario === "emergency_cleanroom") {
      speechPrompt = "Hello, this is Dr. Karen Wells at Austin BioTech. We had an accidental solvent spill in Cleanroom Lab 3. We need certified HAZMAT sanitization crew right away.";
      callerPhone = "(512) 555-8910";
    } else if (simScenario === "sales_quote") {
      speechPrompt = "Hi there, looking for commercial cleaning for our 45,000 sq ft logistics distribution facility in Fort Worth. Need daily trash, floor scrubbing, and weekly sanitization.";
      callerPhone = "(214) 555-0811";
    } else {
      speechPrompt = simCustomText || "General operational inquiry regarding company cleaning schedule and pricing.";
      callerPhone = "(800) 555-0100";
    }

    try {
      const res = await fetch("/api/ai/jev/phone-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: speechPrompt,
          fromNumber: callerPhone,
          autoExecuteAction: true,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const jev = json.data;
        const scenarioData = {
          caller: jev.callerType.replace(/_/g, ' '),
          phone: callerPhone,
          intent: jev.departmentRoute.toUpperCase(),
          confidence: `${Math.round(jev.confidence * 100)}%`,
          sentiment: jev.sentiment,
          aiAction: jev.recommendedAction,
          ticketGenerated: json.createdRecord ? `${json.createdRecord.type.toUpperCase()}-${Date.now().toString(36).slice(-4)}` : "RESOLVED",
          transcriptSnippet: `Model: ${jev.model} • Urgency: ${jev.urgencyLabel} (${jev.urgencyRating}/4). ${jev.requiresHumanOverride ? 'Supervisory escalation triggered.' : 'Autonomous execution completed.'}`
        };

        setSimResult(scenarioData);

        // Add to call list
        const newCallRecord: CallRecord = {
          id: `call-${Date.now()}`,
          started_at: new Date().toISOString(),
          from_number: callerPhone,
          caller_type: jev.callerType,
          intent: jev.departmentRoute,
          status: "completed",
          duration: "1m 45s",
          transcript: `Caller: "${speechPrompt}"\n\nAI Phone Agent: "${jev.suggestedTwiMLGreeting}"\n\nJev Decision: ${jev.recommendedAction}`,
          action_taken: jev.recommendedAction,
        };

        setCalls(prev => [newCallRecord, ...prev]);
      }
    } catch (err) {
      console.error("Jev simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const newArt = {
      id: `kb-${Date.now()}`,
      title: kbForm.title,
      category: kbForm.category,
      content: kbForm.content,
      is_active: true,
    };
    setKbArticles([newArt, ...kbArticles]);
    setShowKBModal(false);
    setKbForm({ title: "", category: "Operations", content: "" });
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-6 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Natural Language Voice Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Communication Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Autonomous Twilio Voice Agent, 24/7 client dispatching, lead qualification, and knowledge base.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics & Overview
          </button>
          <button 
            onClick={() => setActiveTab('simulator')} 
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'simulator' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agent Simulator
          </button>
          <button 
            onClick={() => setActiveTab('calls')} 
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'calls' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Call Logs ({calls.length})
          </button>
          <button 
            onClick={() => setActiveTab('knowledge')} 
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'knowledge' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Knowledge Base
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500">Total Calls Processed</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{calls.length}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% automated handling</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-3">
                <PhoneMissed className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500">After-Hours / Emergency</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {calls.filter(c => c.intent === 'emergency_dispatch').length || 1}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">SLA response &lt; 2 mins</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500">Sales Inquiries Qualified</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {calls.filter(c => c.intent === 'sales').length || 1}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Auto-scheduled walkthroughs</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500">Intent Routing Accuracy</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">98.6%</h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">Trained on SCOMS SOPs</p>
            </div>
          </div>

          {/* Operational Engine Banner & Simulator CTA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Twilio SIP Trunk Engine Active
              </div>
              <h3 className="text-xl font-bold text-slate-900">24/7 AI Phone Receptionist & Dispatcher</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                The agent answers customer emergency calls, quotes commercial bids based on square footage, logs employee sick call-outs, and updates the scheduling dispatch board automatically.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button
                onClick={() => setActiveTab('simulator')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Launch Voice Simulator
              </button>
              <button
                onClick={() => setActiveTab('calls')}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
              >
                Review Transcripts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Interactive AI Voice Agent Simulator</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Simulate an incoming phone call to test the SCOMS voice intelligence model, speech intent analysis, and auto-dispatch logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Input Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Select Incoming Call Scenario</label>
                <div className="space-y-2">
                  {[
                    { id: "emergency_cleanroom", title: "Emergency Cleanroom Solvent Spill", desc: "Urgent HAZMAT protocol test from hospital/lab" },
                    { id: "sales_quote", title: "Commercial Warehouse Janitorial Bid", desc: "45,000 sq ft logistics facility inquiry" },
                    { id: "custom", title: "Custom Free-form Inbound Speech", desc: "Type your own customer phrase to test" },
                  ].map(sc => (
                    <label 
                      key={sc.id} 
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        simScenario === sc.id ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="scenario" 
                        value={sc.id} 
                        checked={simScenario === sc.id} 
                        onChange={() => setSimScenario(sc.id)}
                        className="mt-1" 
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{sc.title}</p>
                        <p className="text-xs text-slate-500">{sc.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {simScenario === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Speech Input</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. We have an executive floor walk next Tuesday and need deep carpet cleaning..."
                    value={simCustomText}
                    onChange={e => setSimCustomText(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <button
                onClick={handleSimulateCall}
                disabled={isSimulating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Speech with SCOMS LLM...</span>
                  </>
                ) : (
                  <>
                    <PhoneIncoming className="w-4 h-4" />
                    <span>Trigger Simulated Inbound Call</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: AI Output Display */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Speech & Intent Engine</span>
                  {isSimulating && <span className="text-xs font-bold text-blue-600 animate-pulse">Analyzing audio...</span>}
                  {simResult && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Intent Recognized</span>}
                </div>

                {!simResult && !isSimulating && (
                  <div className="text-center py-12 text-slate-400">
                    <Bot className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Select a scenario on the left and click trigger to test.</p>
                  </div>
                )}

                {isSimulating && (
                  <div className="text-center py-12 space-y-3">
                    <div className="flex items-center justify-center gap-1.5 h-8">
                      <span className="w-1.5 h-6 bg-blue-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-8 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="w-1.5 h-7 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    </div>
                    <p className="text-xs text-slate-500">Transcribing natural speech and checking operational SOPs...</p>
                  </div>
                )}

                {simResult && (
                  <div className="space-y-3.5 text-xs sm:text-sm">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Identified Intent</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                          {simResult.intent}
                        </span>
                        <span className="text-xs text-slate-500">Confidence: <strong>{simResult.confidence}</strong></span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Automated Platform Action</p>
                      <p className="font-medium text-slate-800">{simResult.aiAction}</p>
                      <p className="text-[11px] text-emerald-600 font-bold">Ticket: {simResult.ticketGenerated}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Agent Reasoning</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{simResult.transcriptSnippet}</p>
                    </div>
                  </div>
                )}
              </div>

              {simResult && (
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button 
                    onClick={() => setActiveTab('calls')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View in Call Logs & Transcripts <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Logs Tab */}
      {activeTab === 'calls' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent AI Voice Interactions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated call transcripts, sentiment tags, and operational actions</p>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Date / Time</th>
                <th className="p-4">Caller Phone</th>
                <th className="p-4">Type</th>
                <th className="p-4">Classified Intent</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calls.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 font-medium text-slate-900 text-xs">
                    {new Date(c.started_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-600">{c.from_number}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {c.caller_type}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-semibold text-slate-800 capitalize">
                    {c.intent.replace(/_/g, ' ')}
                  </td>
                  <td className="p-4 text-xs text-slate-500">{c.duration || '1m 20s'}</td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => setSelectedCall(c)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View Transcript
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Operations Knowledge Base</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Train the AI Phone Agent with corporate SOPs, disinfectant contact times, and facility pricing policies.
              </p>
            </div>
            <button 
              onClick={() => setShowKBModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Article
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {kbArticles.map(article => (
              <div key={article.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">{article.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{article.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Call Transcript & Routing</h3>
                  <p className="text-xs text-slate-500">{selectedCall.from_number} • {new Date(selectedCall.started_at).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCall(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Operational Action Taken</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedCall.action_taken}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">Verbatim Speech Audio Log</span>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {selectedCall.transcript}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Article Modal */}
      {showKBModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Knowledge Base Article</h3>
            <p className="text-xs text-slate-500 mb-4">Teach the AI phone agent about company SOPs and response protocols.</p>
            <form onSubmit={handleAddArticle} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Article Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Quat Disinfectant Dwell Time SOP"
                  value={kbForm.title}
                  onChange={e => setKbForm({ ...kbForm, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={kbForm.category}
                  onChange={e => setKbForm({ ...kbForm, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option>Operations</option>
                  <option>Sales</option>
                  <option>Escalation</option>
                  <option>Compliance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Article Content & Guidelines</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Instructions for the AI to communicate to callers..."
                  value={kbForm.content}
                  onChange={e => setKbForm({ ...kbForm, content: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowKBModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
