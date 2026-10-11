"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare, Send, Search, Video, MoreVertical,
  Smile, Check, CheckCheck, Plus, X, Users,
  ChevronLeft, Paperclip, Phone, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DEMO_ACCOUNTS } from "@/lib/auth/service";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  username: string;
  employeeId: string;
  role: string;
  department: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  isOutgoing: boolean;
}

interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string;
  username?: string;
  employeeId?: string;
  role?: string;
  avatar: string;
  online?: boolean;
  lastSeen?: string;
  membersCount?: number;
  unreadCount: number;
  lastMessage: {
    text: string;
    timestamp: string;
    status?: "sent" | "delivered" | "read";
    isOutgoing?: boolean;
  };
  messages: ChatMessage[];
}

// ─── Avatar initials helper ───────────────────────────────────────────────────
function avatarInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ─── Tick indicator component ─────────────────────────────────────────────────
function TickIcon({ status }: { status?: "sent" | "delivered" | "read" }) {
  if (!status) return null;
  if (status === "sent") return <Check className="w-3.5 h-3.5 text-slate-400" />;
  if (status === "delivered") return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
  return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
}

// ─── Avatar Colors ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-600","bg-violet-600","bg-emerald-600","bg-amber-500",
  "bg-rose-600","bg-cyan-600","bg-indigo-600","bg-orange-600",
];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EmployeeChatPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "direct" | "groups">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isMobileConvOpen, setIsMobileConvOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Load employees from Supabase or fallback ──────────────────────────────
  const loadEmployees = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, role, department, employee_id, email")
        .order("first_name", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: Employee[] = data.map((e: any) => {
          const fullName = [e.first_name, e.last_name].filter(Boolean).join(" ") || e.email?.split("@")[0] || "Employee";
          const empId = e.employee_id || `EMP-${String(e.id).substring(0, 4).toUpperCase()}`;
          return {
            id: String(e.id),
            name: fullName,
            username: `@${fullName.toLowerCase().replace(/\s+/g, ".")}`,
            employeeId: empId,
            role: e.role || "Staff",
            department: e.department || "Operations",
            avatar: avatarInitials(fullName),
            online: Math.random() > 0.5,
            lastSeen: Math.random() > 0.5 ? "Online" : "Last seen today",
          };
        });
        setEmployees(mapped);
        buildInitialConversations(mapped);
        return;
      }
    } catch (err) {
      console.warn("Could not load employees from Supabase:", err);
    }
    // Fallback directory: demo personas + anyone registered locally, so the chat
    // always has team members to talk to (even without an employees table).
    const roster: Employee[] = [];
    for (const d of DEMO_ACCOUNTS) {
      roster.push({
        id: d.email, name: d.name, username: `@${d.name.toLowerCase().replace(/\s+/g, ".")}`,
        employeeId: d.role.replace(/_/g, "-").toUpperCase(), role: d.role.replace(/_/g, " "),
        department: "Operations", avatar: avatarInitials(d.name), online: true, lastSeen: "Online",
      });
    }
    try {
      const reg = JSON.parse(localStorage.getItem("scoms_registered_users_v2") || "[]");
      for (const r of reg) {
        const nm = [r.firstName, r.lastName].filter(Boolean).join(" ") || r.email;
        if (roster.some((e) => e.id === r.email)) continue;
        roster.push({
          id: r.email, name: nm, username: r.username || `@${nm.toLowerCase().replace(/\s+/g, ".")}`,
          employeeId: r.employeeId || "TEAM", role: (r.role || "staff").replace(/_/g, " "),
          department: r.department || "Operations", avatar: avatarInitials(nm), online: false, lastSeen: "Offline",
        });
      }
    } catch { /* optional */ }
    setEmployees(roster);
    buildInitialConversations(roster);
  }, [user]);

  useEffect(() => {
    // Try to load from localStorage first for instant display
    const cached = (() => { try { const r = localStorage.getItem("scoms_chat_v2"); return r ? JSON.parse(r) : null; } catch { return null; } })();
    if (cached?.conversations?.length) {
      setConversations(cached.conversations);
      if (cached.conversations[0]) setActiveConvId(cached.conversations[0].id);
    }
    loadEmployees();
  }, [loadEmployees]);

  const buildInitialConversations = (emps: Employee[]) => {
    if (emps.length === 0) { setConversations([]); return; }
    const currentEmpId = user?.employeeId || "EMP-0001";

    const convs: Conversation[] = emps
      .filter(e => e.employeeId !== currentEmpId && e.id !== user?.email && e.name !== `${user?.firstName || ""} ${user?.lastName || ""}`.trim())
      .slice(0, 12)
      .map(emp => ({
        id: `conv-${emp.id}`,
        type: "direct" as const,
        name: emp.name,
        username: emp.username,
        employeeId: emp.employeeId,
        role: emp.role,
        avatar: emp.avatar,
        online: emp.online,
        lastSeen: emp.lastSeen,
        unreadCount: 0,
        lastMessage: {
          text: "Start a conversation...",
          timestamp: "",
          isOutgoing: false,
        },
        messages: [],
      }));

    // Merge with anything already stored so reloads never lose messages or groups.
    setConversations(prev => {
      const prevById = new Map(prev.map(c => [c.id, c]));
      const merged = convs.map(cv => {
        const old = prevById.get(cv.id);
        return old && old.messages.length > 0
          ? { ...cv, messages: old.messages, lastMessage: old.lastMessage, unreadCount: old.unreadCount }
          : cv;
      });
      const groups = prev.filter(p => p.type === "group" && !convs.some(c => c.id === p.id));
      return [...merged, ...groups];
    });
    setActiveConvId(prev => prev ?? convs[0]?.id ?? null);
  };

  // Persist to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      try { localStorage.setItem("scoms_chat_v2", JSON.stringify({ conversations })); } catch {}
    }
  }, [conversations]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, conversations]);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "You";
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      senderName: userName,
      text: inputMessage.trim(),
      timestamp: now,
      status: "sent",
      isOutgoing: true,
    };

    setConversations(prev => prev.map(c => {
      if (c.id !== activeConv.id) return c;
      return {
        ...c,
        unreadCount: 0,
        lastMessage: { text: newMsg.text, timestamp: now, status: "sent", isOutgoing: true },
        messages: [...c.messages, newMsg],
      };
    }));
    setInputMessage("");

    // Delivered tick after 1s
    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id !== activeConv.id) return c;
        return {
          ...c,
          lastMessage: { ...c.lastMessage, status: "delivered" },
          messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: "delivered" } : m),
        };
      }));
    }, 1000);

    // Blue double tick (read) after 2.5s + auto reply for direct
    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id !== activeConv.id) return c;
        return {
          ...c,
          lastMessage: { ...c.lastMessage, status: "read" },
          messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: "read" } : m),
        };
      }));

      if (activeConv.type === "direct") {
        const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const autoReply: ChatMessage = {
          id: `auto-${Date.now()}`,
          senderId: activeConv.id,
          senderName: activeConv.name,
          text: "Got it! I will action this right away.",
          timestamp: replyTime,
          status: "read",
          isOutgoing: false,
        };
        setTimeout(() => {
          setConversations(prev => prev.map(c => {
            if (c.id !== activeConv.id) return c;
            return {
              ...c,
              lastMessage: { text: autoReply.text, timestamp: replyTime, isOutgoing: false },
              messages: [...c.messages, autoReply],
            };
          }));
        }, 800);
      }
    }, 2500);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const grp: Conversation = {
      id: `grp-${Date.now()}`,
      type: "group",
      name: newGroupName.trim(),
      avatar: avatarInitials(newGroupName.trim()),
      membersCount: selectedMembers.length + 1,
      unreadCount: 0,
      lastMessage: { text: "Group created.", timestamp: now, isOutgoing: true },
      messages: [{
        id: `sys-${Date.now()}`,
        senderId: "system",
        senderName: "System",
        text: `Group "${newGroupName.trim()}" created with ${selectedMembers.length + 1} members.`,
        timestamp: now,
        status: "read",
        isOutgoing: false,
      }],
    };
    setConversations(prev => [grp, ...prev]);
    setActiveConvId(grp.id);
    setShowNewGroup(false);
    setNewGroupName("");
    setSelectedMembers([]);
    setIsMobileConvOpen(true);
  };

  const filteredConvs = conversations.filter(c => {
    if (filterTab === "direct" && c.type !== "direct") return false;
    if (filterTab === "groups" && c.type !== "group") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) &&
          !c.employeeId?.toLowerCase().includes(q) &&
          !c.username?.toLowerCase().includes(q) &&
          !c.lastMessage.text.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selectConv = (id: string) => {
    setActiveConvId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    setIsMobileConvOpen(true);
  };

  const startVideoCall = () => {
    if (!activeConv) return;
    const slug = activeConv.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20);
    router.push(`/dashboard/communications/meetings?join=SCOMS-Chat-${slug}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 top-[56px] sm:top-[60px] flex flex-col bg-slate-100 overflow-hidden">
      
      {/* ── Mobile: show either list or chat ── */}
      {/* ── Desktop: side by side ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Conversations Sidebar */}
        <div className={`
          ${isMobileConvOpen ? "hidden md:flex" : "flex"}
          w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex-col shrink-0 overflow-hidden
        `}>
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-extrabold text-slate-900">Team Chat</h1>
                  <p className="text-[10px] text-slate-400">{employees.length > 0 ? `${employees.length} employees` : "Loading..."}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowNewGroup(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Group</span>
                </button>
                <Link href="/dashboard/communications/meetings"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-100 transition">
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Video</span>
                </Link>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-2.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, EMP ID, @username..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1">
              {(["all","direct","groups"] as const).map(t => (
                <button key={t} onClick={() => setFilterTab(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition ${filterTab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {t === "all" ? "All" : t === "direct" ? "Direct" : "Groups"}
                </button>
              ))}
            </div>
          </div>

          {/* Conv list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1">Employees will appear here once loaded from your database</p>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No results for "{searchQuery}"</div>
            ) : filteredConvs.map(conv => {
              const isActive = conv.id === activeConvId;
              const color = avatarColor(conv.name);
              return (
                <button key={conv.id} onClick={() => selectConv(conv.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition hover:bg-slate-50 ${isActive ? "bg-blue-50 border-r-2 border-blue-600" : ""}`}>
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-full ${color} text-white flex items-center justify-center text-sm font-bold`}>
                      {conv.type === "group" ? <Users className="w-5 h-5" /> : conv.avatar}
                    </div>
                    {conv.type === "direct" && conv.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold text-slate-900 truncate">{conv.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">{conv.lastMessage.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {conv.employeeId && (
                        <span className="text-[10px] text-slate-400 font-mono">{conv.employeeId}</span>
                      )}
                      {conv.type === "group" && conv.membersCount && (
                        <span className="text-[10px] text-slate-400">{conv.membersCount} members</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        {conv.lastMessage.isOutgoing && <TickIcon status={conv.lastMessage.status} />}
                        <span>{conv.lastMessage.text}</span>
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Chat Panel */}
        <div className={`
          ${!isMobileConvOpen ? "hidden md:flex" : "flex"}
          flex-1 flex-col bg-slate-50 min-w-0 overflow-hidden
        `}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
              <MessageSquare className="w-14 h-14 text-slate-200" />
              <p className="font-semibold text-sm">Select a conversation</p>
              <p className="text-xs text-center max-w-xs">Choose a team member or group from the list to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-3 shrink-0 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <button className="md:hidden p-1 text-slate-500 hover:text-slate-800 transition" onClick={() => setIsMobileConvOpen(false)}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className={`w-9 h-9 rounded-full ${avatarColor(activeConv.name)} text-white flex items-center justify-center text-sm font-bold shrink-0 relative`}>
                    {activeConv.type === "group" ? <Users className="w-4 h-4" /> : activeConv.avatar}
                    {activeConv.type === "direct" && activeConv.online && (
                      <span className="absolute -bottom-0 -right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{activeConv.name}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      {activeConv.employeeId && <span className="font-mono">{activeConv.employeeId}</span>}
                      {activeConv.username && <span>{activeConv.username}</span>}
                      {activeConv.type === "direct" && (
                        <span className={activeConv.online ? "text-emerald-600 font-semibold" : "text-slate-400"}>{activeConv.lastSeen}</span>
                      )}
                      {activeConv.type === "group" && <span>{activeConv.membersCount} members</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={startVideoCall}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
                    <Video className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Video Call</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "32px 32px" }}>
                {activeConv.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                    <div className={`w-14 h-14 rounded-full ${avatarColor(activeConv.name)} text-white flex items-center justify-center text-xl font-bold`}>
                      {activeConv.type === "group" ? <Users className="w-7 h-7" /> : activeConv.avatar}
                    </div>
                    <p className="font-semibold text-sm text-slate-600">{activeConv.name}</p>
                    {activeConv.employeeId && <p className="text-xs font-mono">{activeConv.employeeId} · {activeConv.username}</p>}
                    <p className="text-xs">Send a message to get started</p>
                  </div>
                ) : (
                  activeConv.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isOutgoing ? "justify-end" : "justify-start"}`}>
                      {!msg.isOutgoing && (
                        <div className={`w-7 h-7 rounded-full ${avatarColor(msg.senderName)} text-white flex items-center justify-center text-xs font-bold mr-2 shrink-0 self-end mb-1`}>
                          {avatarInitials(msg.senderName)}
                        </div>
                      )}
                      <div className={`max-w-[75%] sm:max-w-[65%] ${msg.isOutgoing ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                        {!msg.isOutgoing && msg.senderName !== "System" && (
                          <span className="text-[11px] text-slate-500 ml-1 font-semibold">{msg.senderName}</span>
                        )}
                        <div className={`px-3.5 py-2 rounded-2xl text-sm shadow-sm leading-relaxed ${
                          msg.senderId === "system"
                            ? "bg-slate-200 text-slate-600 text-xs italic mx-auto rounded-full px-4"
                            : msg.isOutgoing
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                        }`}>
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] ${msg.isOutgoing ? "flex-row-reverse" : ""}`}>
                          <span className="text-slate-400">{msg.timestamp}</span>
                          {msg.isOutgoing && <TickIcon status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-slate-200 px-3 py-3 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      placeholder={`Message ${activeConv.name}${activeConv.employeeId ? ` (${activeConv.employeeId})` : ""}...`}
                      className="w-full py-2.5 px-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── New Group Modal ── */}
      {showNewGroup && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewGroup(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Shift Group</h3>
                <p className="text-xs text-slate-500 mt-0.5">Group channel with employee ID tags</p>
              </div>
              <button onClick={() => setShowNewGroup(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Group Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Night Shift Deep-Clean Team"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {employees.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Add Members</label>
                  <div className="max-h-52 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2">
                    {employees.map(emp => (
                      <label key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(emp.id)}
                          onChange={() => setSelectedMembers(prev => prev.includes(emp.id) ? prev.filter(i => i !== emp.id) : [...prev, emp.id])}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <div className={`w-8 h-8 rounded-full ${avatarColor(emp.name)} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                          {emp.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{emp.employeeId} · {emp.username}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedMembers.length > 0 && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">{selectedMembers.length} member(s) selected</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewGroup(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={!newGroupName.trim()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
