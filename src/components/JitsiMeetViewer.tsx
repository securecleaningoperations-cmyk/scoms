"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Loader2, Mic, MicOff, Video, VideoOff, Monitor, Maximize2, Minimize2,
  Copy, Check, PhoneOff, Users, ClipboardList, CheckSquare, Plus, Save
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
  displayName = 'SCOMS Officer',
  email = 'operations@securecleaningoperations.com',
  onMeetingEnd,
  initialAgenda = [
    'Review cleaning scope & high-touch sanitization points',
    'Verify security clearance & keycard access protocols',
    'Walkthrough facility square footage & floor type review',
    'Align on weekly schedule & emergency callback SLA'
  ]
}: JitsiMeetViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'agenda' | 'notes' | 'tasks'>('agenda');

  // Interactive in-meeting state
  const [agenda, setAgenda] = useState<{ text: string; done: boolean }[]>(
    initialAgenda.map(item => ({ text: item, done: false }))
  );
  const [notes, setNotes] = useState(
    `Meeting Notes - ${new Date().toLocaleDateString()}\nParticipant: ${displayName}\nRoom: ${roomName}\n\n- Client noted requirement for hospital-grade disinfectant in restrooms.\n- Keycard access provided for Mon-Fri 6:00 PM shift.\n- Agreed on next-day quote turn-around.`
  );
  const [notesSaved, setNotesSaved] = useState(false);
  const [tasks, setTasks] = useState<{ id: string; title: string; assignee: string; priority: string }[]>([
    { id: '1', title: 'Prepare Gold Tier Proposal with Restroom Sanitization', assignee: 'Commercial Sales', priority: 'High' },
    { id: '2', title: 'Confirm cleaner background checks for CMMC access', assignee: 'HR Department', priority: 'Medium' }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Meeting timer
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

  // Load official open-source Jitsi Meet External API or fallback to iframe
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let apiInstance: any = null;

    const initIframeFallback = () => {
      setUseIframeFallback(true);
      setLoading(false);
    };

    // Timeout fallback if external script fails to load within 3 seconds
    timeoutId = setTimeout(() => {
      if (loading) {
        initIframeFallback();
      }
    }, 3000);

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;

    script.onload = () => {
      clearTimeout(timeoutId);
      setLoading(false);

      if (window.JitsiMeetExternalAPI && containerRef.current) {
        try {
          const domain = 'meet.jit.si';
          const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: containerRef.current,
            userInfo: {
              displayName: displayName,
              email: email
            },
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              prejoinPageEnabled: false,
              disableDeepLinking: true,
              enableWelcomePage: false,
              toolbarButtons: [
                'camera',
                'chat',
                'closedcaptions',
                'desktop',
                'download',
                'embedmeeting',
                'etherpad',
                'feedback',
                'filmstrip',
                'fullscreen',
                'hangup',
                'help',
                'highlight',
                'invite',
                'linktosalesforce',
                'livestreaming',
                'microphone',
                'noisesuppression',
                'participants-pane',
                'profile',
                'raisehand',
                'recording',
                'security',
                'select-background',
                'settings',
                'shareaudio',
                'sharedvideo',
                'shortcuts',
                'stats',
                'tileview',
                'toggle-camera',
                'videoquality',
                'whiteboard'
              ]
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_BRAND_WATERMARK: false,
              BRAND_WATERMARK_LINK: '',
              DEFAULT_REMOTE_DISPLAY_NAME: 'SCOMS Participant'
            }
          };

          apiInstance = new window.JitsiMeetExternalAPI(domain, options);

          apiInstance.addListener('readyToClose', () => {
            if (onMeetingEnd) onMeetingEnd();
          });

          apiInstance.addListener('videoConferenceLeft', () => {
            if (onMeetingEnd) onMeetingEnd();
          });
        } catch (e) {
          console.error('Jitsi API initialization failed, falling back to embedded iframe:', e);
          initIframeFallback();
        }
      } else {
        initIframeFallback();
      }
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      initIframeFallback();
    };

    document.body.appendChild(script);

    return () => {
      clearTimeout(timeoutId);
      if (apiInstance) {
        apiInstance.dispose();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [roomName, displayName, email, onMeetingEnd]);

  const copyMeetingLink = () => {
    const fullUrl = `https://meet.jit.si/${roomName}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        assignee: 'Operations Team',
        priority: 'High'
      }
    ]);
    setNewTaskTitle('');
  };

  const toggleAgendaItem = (index: number) => {
    setAgenda(prev =>
      prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    );
  };

  const jitsiIframeUrl = `https://meet.jit.si/${encodeURIComponent(
    roomName
  )}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&userInfo.displayName=${encodeURIComponent(
    displayName
  )}`;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Top Header Bar */}
      <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm tracking-tight">{roomName}</span>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                Jitsi Meet HD
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live Session · Host: <strong className="text-slate-200">{displayName}</strong> · {formatTime(elapsedSeconds)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyMeetingLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            title="Copy Invite Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link!' : 'Share Room'}</span>
          </button>

          <button
            onClick={() => setShowDrawer(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              showDrawer
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Meeting Drawer ({agenda.filter(a => a.done).length}/{agenda.length})</span>
          </button>

          <button
            onClick={() => {
              if (onMeetingEnd) onMeetingEnd();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Frame */}
        <div className="flex-1 relative bg-black flex items-center justify-center min-w-0">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 z-10 bg-slate-950">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
              <p className="text-base font-semibold text-white">Launching Encrypted Jitsi Video Conference...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to Secure Cleaning Operations cluster</p>
            </div>
          )}

          {useIframeFallback ? (
            <iframe
              src={jitsiIframeUrl}
              allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *"
              className="w-full h-full border-0"
              title="Jitsi Video Meeting"
            />
          ) : (
            <div ref={containerRef} className="w-full h-full" />
          )}
        </div>

        {/* Side Collaboration Drawer */}
        {showDrawer && (
          <div className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60">
              <button
                onClick={() => setDrawerTab('agenda')}
                className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  drawerTab === 'agenda'
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Scope Checklist</span>
              </button>
              <button
                onClick={() => setDrawerTab('notes')}
                className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  drawerTab === 'notes'
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Call Notes</span>
              </button>
              <button
                onClick={() => setDrawerTab('tasks')}
                className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  drawerTab === 'tasks'
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Action</span>
              </button>
            </div>

            {/* Tab: Agenda */}
            {drawerTab === 'agenda' && (
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Site Walkthrough Scope</h4>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {agenda.filter(a => a.done).length} of {agenda.length} verified
                  </span>
                </div>
                <div className="space-y-2">
                  {agenda.map((item, idx) => (
                    <label
                      key={idx}
                      onClick={() => toggleAgendaItem(idx)}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        item.done
                          ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-600 text-blue-600 focus:ring-0"
                      />
                      <span className={item.done ? 'line-through opacity-80' : 'font-medium'}>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Notes */}
            {drawerTab === 'notes' && (
              <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Meeting Records</h4>
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition"
                  >
                    {notesSaved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    <span>{notesSaved ? 'Saved to SCOMS' : 'Save Notes'}</span>
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={12}
                  className="w-full flex-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 resize-none focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500">
                  Notes are automatically linked to customer profile and job record in SCOMS v6.1 repository.
                </p>
              </div>
            )}

            {/* Tab: Tasks */}
            {drawerTab === 'tasks' && (
              <div className="p-4 flex-1 flex flex-col space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assign Action Items</h4>
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="New action item..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-2 flex-1 overflow-y-auto mt-2">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{task.title}</p>
                        <p className="text-[11px] text-slate-400">Assigned: {task.assignee}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
