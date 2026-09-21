"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  PhoneOff, Copy, Check, ClipboardList, CheckSquare, Plus,
  Save, Sparkles, Radio, ExternalLink, ShieldCheck,
  Maximize2, Loader2, Download, Info
} from 'lucide-react';



interface JitsiMeetViewerProps {
  roomName: string;
  displayName?: string;
  email?: string;
  onMeetingEnd?: () => void;
  initialAgenda?: string[];
}

export function JitsiMeetViewer({
  roomName,
  displayName = 'SCOMS Team Member',
  email = 'operations@securecleaningoperations.com',
  onMeetingEnd,
  initialAgenda = [
    'Review high-touch surface sanitization scope',
    'Verify security clearance & keycard access protocols',
    'Walkthrough facility square footage & floor type review',
    'Align on weekly schedule & emergency callback SLA'
  ]
}: JitsiMeetViewerProps) {
  const sanitizedRoom = roomName.replace(/[^a-zA-Z0-9-_]/g, '-');
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'agenda' | 'notes' | 'tasks'>('agenda');
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Agenda & Scope Checklist
  const [agenda, setAgenda] = useState<{ text: string; done: boolean }[]>(
    initialAgenda.map(item => ({ text: item, done: false }))
  );
  const [newAgendaItem, setNewAgendaItem] = useState('');

  // Meeting Notes
  const [notes, setNotes] = useState(
    `SCOMS Operational Conference Notes\nRoom: ${roomName}\nHost / Participant: ${displayName}\nDate: ${new Date().toLocaleDateString()}\n\nKey Objectives & Discussion Points:\n- Scope verification for high-traffic zones\n- Disinfection protocol and chemical dilution standards\n- Geofenced attendance and shift coordination`
  );
  const [notesSaved, setNotesSaved] = useState(false);

  // Follow-up Tasks
  const [tasks, setTasks] = useState<{ id: string; title: string; assignee: string; priority: string }[]>([
    { id: '1', title: 'Submit signed Walkthrough Checklist to Client Portal', assignee: 'Field Lead', priority: 'High' },
    { id: '2', title: 'Dispatch SDS Safety Sheets & ATP swab kit', assignee: 'Operations Dispatch', priority: 'Medium' }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Meeting Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Mount real Jitsi Meet API
  useEffect(() => {
    let jitsiApi: any = null;
    let isMounted = true;

    const initJitsi = () => {
      if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
        setUseIframeFallback(true);
        return;
      }

      try {
        jitsiContainerRef.current.innerHTML = '';
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: sanitizedRoom,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: displayName || 'SCOMS Team Member',
            email: email || 'operations@securecleaningoperations.com',
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone', 'security'
            ],
          },
        });

        api.addEventListener('videoConferenceLeft', () => {
          if (onMeetingEnd) onMeetingEnd();
        });

        jitsiApi = api;
        setIsJitsiLoaded(true);
      } catch (err) {
        console.error('Failed to load JitsiMeetExternalAPI, fallback to iframe:', err);
        setUseIframeFallback(true);
      }
    };

    const loadScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const existingScript = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (isMounted) initJitsi();
        });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        if (isMounted) initJitsi();
      };
      script.onerror = () => {
        console.warn('Jitsi external_api.js blocked or failed. Using direct iframe embed.');
        if (isMounted) setUseIframeFallback(true);
      };
      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      isMounted = false;
      if (jitsiApi) {
        try {
          jitsiApi.dispose();
        } catch {
          // Ignore disposal errors
        }
      }
    };
  }, [sanitizedRoom, displayName, email, onMeetingEnd]);

  const copyMeetingLink = () => {
    const fullUrl = `https://meet.jit.si/${sanitizedRoom}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInNewTab = () => {
    window.open(`https://meet.jit.si/${sanitizedRoom}`, '_blank', 'noopener,noreferrer');
  };

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const downloadNotes = () => {
    const blob = new Blob([notes], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${sanitizedRoom}-meeting-notes.txt`;
    a.click();
  };

  const toggleAgendaItem = (index: number) => {
    setAgenda(prev =>
      prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaItem.trim()) return;
    setAgenda(prev => [...prev, { text: newAgendaItem.trim(), done: false }]);
    setNewAgendaItem('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        assignee: 'Operations Dispatch',
        priority: 'High'
      }
    ]);
    setNewTaskTitle('');
  };

  const directIframeUrl = `https://meet.jit.si/${encodeURIComponent(
    sanitizedRoom
  )}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=${encodeURIComponent(
    displayName
  )}`;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden relative select-none font-sans">
      
      {/* 1. TOP STATUS & CONTROLS HEADER */}
      <header className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 -ml-3.5" />
            <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
              {roomName}
            </h3>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Live Jitsi Room</span>
            </span>
            <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyMeetingLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition shadow-xs"
            title="Copy Direct Jitsi Invite Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Copied Link!' : 'Share Link'}</span>
          </button>

          <button
            onClick={openInNewTab}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition shadow-xs"
            title="Open Meeting in New Browser Tab / Jitsi App"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Pop Out Window</span>
          </button>

          <button
            onClick={() => setShowSidePanel(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              showSidePanel
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Toggle SCOMS Meeting Scope, Notes & Tasks"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scope & Notes</span>
          </button>

          <button
            onClick={() => {
              if (onMeetingEnd) onMeetingEnd();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN VIEWPORT: GENUINE JITSI MEET STAGE */}
      <div className="flex-1 flex overflow-hidden relative w-full h-[calc(100%-56px)] bg-black">
        
        {/* Real Jitsi Container */}
        <div className="flex-1 relative w-full h-full min-w-0 bg-black flex flex-col items-center justify-center">
          {useIframeFallback ? (
            <iframe
              src={directIframeUrl}
              allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; hid *; speaker-selection *; fullscreen *"
              className="w-full h-full border-0"
              title={roomName}
            />
          ) : (
            <div ref={jitsiContainerRef} className="w-full h-full relative">
              {!isJitsiLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm font-semibold">Connecting to Jitsi Meet video conference...</p>
                  <button
                    onClick={() => setUseIframeFallback(true)}
                    className="text-xs text-blue-400 hover:underline mt-2"
                  >
                    Click here if video takes more than a few seconds
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. COLLAPSIBLE SCOMS MEETING NOTES & SCOPE DRAWER */}
        {showSidePanel && (
          <aside className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-20 shadow-2xl shrink-0">
            {/* Panel Tabs */}
            <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950/50">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    activeTab === 'agenda' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Scope Checklist
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    activeTab === 'notes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tasks ({tasks.length})
                </button>
              </div>
              <button
                onClick={() => setShowSidePanel(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* TAB 1: AGENDA CHECKLIST */}
            {activeTab === 'agenda' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Facility Inspection Checklist</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {agenda.filter(a => a.done).length}/{agenda.length} Completed
                  </span>
                </div>

                <div className="space-y-2">
                  {agenda.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => toggleAgendaItem(index)}
                      className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition ${
                        item.done
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                          : 'bg-slate-850 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600'
                      }`}>
                        {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={`text-xs leading-relaxed ${item.done ? 'line-through text-slate-500' : ''}`}>
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAddAgenda} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add custom scope item..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    value={newAgendaItem}
                    onChange={e => setNewAgendaItem(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: LIVE NOTES */}
            {activeTab === 'notes' && (
              <div className="flex-1 p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Meeting Minutes</span>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadNotes}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white"
                      title="Download as .txt"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300"
                    >
                      <Save className="w-3 h-3" />
                      <span>{notesSaved ? 'Saved!' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Record live decisions, client requirements, quotes, or issues discussed during the conference..."
                  className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            )}

            {/* TAB 3: ACTION TASKS */}
            {activeTab === 'tasks' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assigned Follow-Up Actions
                </div>

                <div className="space-y-2">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-800 border border-slate-700/80 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-slate-200">{task.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          task.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Assignee: <span className="text-slate-300 font-semibold">{task.assignee}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddTask} className="space-y-2 pt-2">
                  <input
                    type="text"
                    placeholder="New action item..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Follow-up Task</span>
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
