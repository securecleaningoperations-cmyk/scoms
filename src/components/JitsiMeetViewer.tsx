"use client";

import React, { useState, useEffect } from "react";
import {
  PhoneOff, Copy, Check, ClipboardList, Plus,
  Save, Radio, ExternalLink, Loader2, Download, X
} from "lucide-react";

interface JitsiMeetViewerProps {
  roomName: string;
  displayName?: string;
  email?: string;
  onMeetingEnd?: () => void;
  initialAgenda?: string[];
}

export function JitsiMeetViewer({
  roomName,
  displayName = "SCOMS Team Member",
  email = "operations@securecleaningoperations.com",
  onMeetingEnd,
  initialAgenda = [
    "Review high-touch surface sanitization scope",
    "Verify security clearance & keycard access protocols",
    "Walkthrough facility square footage & floor type review",
    "Align on weekly schedule & emergency callback SLA"
  ]
}: JitsiMeetViewerProps) {
  const sanitizedRoom = roomName
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"agenda" | "notes" | "tasks">("agenda");
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [agenda, setAgenda] = useState<{ text: string; done: boolean }[]>(
    initialAgenda.map(item => ({ text: item, done: false }))
  );
  const [newAgendaItem, setNewAgendaItem] = useState("");
  const [notes, setNotes] = useState(
    `SCOMS Operational Conference Notes\nRoom: ${roomName}\nHost: ${displayName}\nDate: ${new Date().toLocaleDateString()}\n\nKey Discussion Points:\n- \n`
  );
  const [notesSaved, setNotesSaved] = useState(false);
  const [tasks, setTasks] = useState<{ id: string; title: string; assignee: string; priority: string }[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const [serverHost, setServerHost] = useState<string>("meet.ffrn.de");

  // Build instant-start iframe URL without login prompts or moderator gates
  const jitsiUrl = [
    `https://${serverHost}/${encodeURIComponent(sanitizedRoom)}`,
    `#config.prejoinPageEnabled=false`,
    `&config.requireDisplayName=false`,
    `&config.startWithAudioMuted=false`,
    `&config.startWithVideoMuted=false`,
    `&config.disableDeepLinking=true`,
    `&config.enableWelcomePage=false`,
    `&config.enableClosePage=false`,
    `&userInfo.displayName=${encodeURIComponent(displayName)}`,
    `&userInfo.email=${encodeURIComponent(email)}`,
  ].join("");

  const fullMeetLink = `https://${serverHost}/${sanitizedRoom}`;

  const copyMeetingLink = () => {
    try { navigator.clipboard.writeText(fullMeetLink); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInNewTab = () => window.open(fullMeetLink, "_blank", "noopener,noreferrer");

  const downloadNotes = () => {
    const blob = new Blob([notes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizedRoom}-notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleAgendaItem = (index: number) =>
    setAgenda(prev => prev.map((item, i) => i === index ? { ...item, done: !item.done } : item));

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaItem.trim()) return;
    setAgenda(prev => [...prev, { text: newAgendaItem.trim(), done: false }]);
    setNewAgendaItem("");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), title: newTaskTitle.trim(), assignee: displayName, priority: "High" }]);
    setNewTaskTitle("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* Status Bar */}
      <header className="h-11 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-bold text-xs text-white truncate max-w-[120px] sm:max-w-xs">{sanitizedRoom}</span>
          <span className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Radio className="w-3 h-3 animate-pulse" />
            Instant Live
          </span>
          <select
            value={serverHost}
            onChange={(e) => setServerHost(e.target.value)}
            className="hidden md:inline-block bg-slate-800 text-[10px] text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-blue-500"
            title="Video Conference Engine"
          >
            <option value="meet.ffrn.de">Instant Engine (No Login)</option>
            <option value="jitsi.riot.im">Matrix Riot Engine</option>
            <option value="meet.jit.si">Jitsi Official</option>
          </select>
          <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={copyMeetingLink} title="Copy invite link"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </button>
          <button onClick={openInNewTab} title="Open in new tab"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pop Out</span>
          </button>
          <button onClick={() => setShowSidePanel(p => !p)} title="Notes panel"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${showSidePanel ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"}`}>
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
          </button>
          <button onClick={() => { if (onMeetingEnd) onMeetingEnd(); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition">
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Jitsi iframe */}
        <div className="flex-1 relative bg-black min-w-0">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 gap-3 z-10 p-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm font-semibold text-slate-300 text-center">Connecting to video room...</p>
              <p className="text-xs text-slate-500 max-w-xs text-center">Allow camera and microphone access when prompted by your browser.</p>
              <button onClick={openInNewTab}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition">
                <ExternalLink className="w-3.5 h-3.5" />
                Open in New Tab Instead
              </button>
            </div>
          )}
          <iframe
            key={sanitizedRoom}
            src={jitsiUrl}
            allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; fullscreen *"
            allowFullScreen
            className="w-full h-full border-0"
            title={`SCOMS Meeting: ${sanitizedRoom}`}
            onLoad={() => setIframeLoaded(true)}
          />
        </div>

        {/* Side Panel */}
        {showSidePanel && (
          <aside className="w-72 sm:w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-10 shadow-xl shrink-0 overflow-hidden">
            <div className="h-11 border-b border-slate-800 px-3 flex items-center justify-between bg-slate-950/40 shrink-0">
              <div className="flex gap-1">
                {(["agenda", "notes", "tasks"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition ${activeTab === tab ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                    {tab === "agenda" ? "Checklist" : tab === "notes" ? "Notes" : `Tasks${tasks.length > 0 ? ` (${tasks.length})` : ""}`}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSidePanel(false)} className="text-slate-400 hover:text-white p-1 rounded-md transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeTab === "agenda" && (
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span>Scope Checklist</span>
                  <span className="text-emerald-400 font-bold">{agenda.filter(a => a.done).length}/{agenda.length} Done</span>
                </div>
                <div className="space-y-1.5">
                  {agenda.map((item, index) => (
                    <button key={index} onClick={() => toggleAgendaItem(index)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-start gap-2.5 transition text-xs ${item.done ? "bg-emerald-950/20 border-emerald-900/30 text-slate-500" : "bg-slate-800/50 border-slate-700/50 text-slate-200 hover:border-slate-600"}`}>
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${item.done ? "bg-emerald-500 border-emerald-500" : "border-slate-600"}`}>
                        {item.done && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className={item.done ? "line-through text-slate-500" : ""}>{item.text}</span>
                    </button>
                  ))}
                </div>
                <form onSubmit={handleAddAgenda} className="flex gap-2">
                  <input type="text" placeholder="Add scope item..." value={newAgendaItem} onChange={e => setNewAgendaItem(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-w-0" />
                  <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shrink-0"><Plus className="w-3.5 h-3.5" /></button>
                </form>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex-1 p-3 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Meeting Minutes</span>
                  <div className="flex gap-2">
                    <button onClick={downloadNotes} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition">
                      <Download className="w-3 h-3" />Export
                    </button>
                    <button onClick={() => { setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2500); }}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition">
                      <Save className="w-3 h-3" />{notesSaved ? "Saved!" : "Save"}
                    </button>
                  </div>
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Record live decisions, client requirements, issues..."
                  className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-blue-500 font-mono" />
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Follow-Up Actions</div>
                {tasks.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No tasks yet. Add one below.</p>}
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className="p-3 bg-slate-800 border border-slate-700/60 rounded-xl space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-slate-200 leading-snug">{task.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${task.priority === "High" ? "bg-rose-500/20 text-rose-400" : "bg-blue-500/20 text-blue-400"}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Assigned: <span className="text-slate-300 font-semibold">{task.assignee}</span></div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddTask} className="space-y-2">
                  <input type="text" placeholder="New action item..." value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  <button type="submit" className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition">
                    <Plus className="w-3.5 h-3.5" />Add Task
                  </button>
                </form>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
