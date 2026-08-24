"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Bot, Phone, PhoneMissed, Users, Database, 
  MessageSquare, Play, Settings, ShieldAlert,
  Loader2, Plus, Search, Calendar, ChevronRight
} from "lucide-react";

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'calls' | 'knowledge'>('analytics');
  const [calls, setCalls] = useState<any[]>([]);
  const [kbArticles, setKbArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: callsData }, { data: kbData }] = await Promise.all([
      supabase.from('ai_voice_calls').select('*').order('started_at', { ascending: false }),
      supabase.from('ai_knowledge_base').select('*').order('category', { ascending: true })
    ]);
    
    setCalls(callsData || []);
    setKbArticles(kbData || []);
    setLoading(false);
  };

  const totalCalls = calls.length;
  const missedCalls = calls.filter(c => c.status === 'no-answer' || c.status === 'canceled').length;
  const leadConversions = calls.filter(c => c.intent === 'sales').length;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 font-sans pb-24">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">AI Communication Intelligence</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage the AI Phone Agent, review calls, and update the knowledge base.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Analytics</button>
          <button onClick={() => setActiveTab('calls')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'calls' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Call Logs</button>
          <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'knowledge' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Knowledge Base</button>
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Phone className="w-6 h-6" /></div>
              <p className="text-sm font-semibold text-slate-500">Total Calls</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : totalCalls}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4"><PhoneMissed className="w-6 h-6" /></div>
              <p className="text-sm font-semibold text-slate-500">Missed/After-Hours</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : missedCalls}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><Users className="w-6 h-6" /></div>
              <p className="text-sm font-semibold text-slate-500">Lead Conversions</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : leadConversions}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4"><ShieldAlert className="w-6 h-6" /></div>
              <p className="text-sm font-semibold text-slate-500">Human Escalations</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : calls.filter(c => c.intent === 'escalate').length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center py-16">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Analytics Engine Ready</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">Once the Twilio webhooks are actively receiving live calls, detailed sentiment analysis and intent routing graphs will appear here.</p>
          </div>
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Recent AI Interactions</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search transcripts..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Caller ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Intent</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" /></td></tr>
              ) : calls.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No calls recorded yet. Call the Twilio number to test the AI.</td></tr>
              ) : (
                calls.map(call => (
                  <tr key={call.id} className="hover:bg-slate-50 cursor-pointer">
                    <td className="p-4 pl-6 font-medium text-slate-900">{new Date(call.started_at).toLocaleString()}</td>
                    <td className="p-4 text-slate-600">{call.from_number || 'Unknown'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                        call.caller_type === 'customer' ? 'bg-blue-100 text-blue-700' :
                        call.caller_type === 'employee' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {call.caller_type || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{call.intent || '—'}</td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                        call.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${call.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {call.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs">View Transcript</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900">AI Knowledge Base</h3>
              <p className="text-sm text-slate-500 mt-1">Train the AI by adding company policies, FAQs, and procedures.</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add Article
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" /></div>
            ) : kbArticles.length === 0 ? (
              <div className="col-span-3 bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                <Database className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <h4 className="font-bold text-slate-700">Knowledge Base is Empty</h4>
                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Add information about services, pricing guidelines, or HR policies to make the AI smarter.</p>
              </div>
            ) : (
              kbArticles.map(article => (
                <div key={article.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">{article.category}</span>
                    {article.is_active && <span className="w-2 h-2 rounded-full bg-emerald-500 ml-auto"></span>}
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{article.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{article.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
