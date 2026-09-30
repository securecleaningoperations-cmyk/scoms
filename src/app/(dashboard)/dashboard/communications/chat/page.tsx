"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Send, Search, Users, Phone, Video, MoreVertical,
  Paperclip, Smile, Check, CheckCheck, Clock, Plus, ShieldCheck,
  Building2, Sparkles, Filter, ChevronLeft, UserCheck, X, Image as ImageIcon,
  FileText, Download, AlertCircle, ArrowLeft, RefreshCw, Radio
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────

interface EmployeeContact {
  id: string;
  name: string;
  username: string;
  employeeId: string;
  role: string;
  department: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
  facility: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  isOutgoing: boolean;
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
}

interface ChatConversation {
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

// ── Initial Mock Directory with Usernames & Employee IDs ───────────────

const TEAM_DIRECTORY: EmployeeContact[] = [
  {
    id: "emp-0001",
    name: "David Vance",
    username: "@david.vance",
    employeeId: "EMP-0001",
    role: "Super Admin (Owner)",
    department: "Executive Platform Leadership",
    avatar: "DV",
    online: true,
    lastSeen: "Online",
    facility: "Headquarters Hub"
  },
  {
    id: "emp-1042",
    name: "Marcus Vance",
    username: "@marcus.v",
    employeeId: "EMP-1042",
    role: "Field Operations Supervisor",
    department: "Field Commercial Operations",
    avatar: "MV",
    online: true,
    lastSeen: "Online",
    facility: "North Texas Logistics Hub"
  },
  {
    id: "emp-2015",
    name: "Sarah Jenkins",
    username: "@sarah.j",
    employeeId: "EMP-2015",
    role: "Operations Manager",
    department: "Dispatch & Client Management",
    avatar: "SJ",
    online: false,
    lastSeen: "Last seen today at 2:45 PM",
    facility: "Dallas Metro Hub"
  },
  {
    id: "emp-1024",
    name: "Elena Rostova",
    username: "@elena.r",
    employeeId: "EMP-1024",
    role: "Quality & Compliance Inspector",
    department: "CAPA & OSHA Standards",
    avatar: "ER",
    online: true,
    lastSeen: "Online",
    facility: "Metro Healthcare Network"
  },
  {
    id: "emp-3015",
    name: "Carlos Rodriguez",
    username: "@carlos.tech",
    employeeId: "EMP-3015",
    role: "Commercial Cleaning Lead Tech",
    department: "Floor Care & Disinfection",
    avatar: "CR",
    online: true,
    lastSeen: "Online",
    facility: "Apex Logistics Tech Campus"
  },
  {
    id: "emp-3042",
    name: "Aisha Patel",
    username: "@aisha.ops",
    employeeId: "EMP-3042",
    role: "Facility Dispatch Coordinator",
    department: "Route Planning & Rostering",
    avatar: "AP",
    online: false,
    lastSeen: "Last seen today at 11:20 AM",
    facility: "Southwest Regional Logistics"
  },
  {
    id: "emp-3088",
    name: "James Wilson",
    username: "@james.w",
    employeeId: "EMP-3088",
    role: "Deep-Clean Night Shift Lead",
    department: "Biohazard & Terminal Cleaning",
    avatar: "JW",
    online: false,
    lastSeen: "Last seen yesterday at 11:50 PM",
    facility: "Tech Center East Wing"
  }
];

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv-group-ops",
    type: "group",
    name: "Operations Field Crew #1",
    avatar: "OP",
    membersCount: 8,
    unreadCount: 2,
    lastMessage: {
      text: "Chemical dilution check completed for Building B terminal suites.",
      timestamp: "11:42 AM",
      status: "read",
      isOutgoing: false
    },
    messages: [
      {
        id: "msg-g-1",
        senderId: "emp-1042",
        senderName: "Marcus Vance (EMP-1042)",
        text: "Team, please verify keycard access and SDS documentation before entering the Cleanroom suite today.",
        timestamp: "09:15 AM",
        status: "read",
        isOutgoing: false
      },
      {
        id: "msg-g-2",
        senderId: "me",
        senderName: "You",
        text: "Confirmed. All ATP swabs calibrated and team has standard PPE gear on-site.",
        timestamp: "09:30 AM",
        status: "read",
        isOutgoing: true
      },
      {
        id: "msg-g-3",
        senderId: "emp-3015",
        senderName: "Carlos Rodriguez (EMP-3015)",
        text: "Chemical dilution check completed for Building B terminal suites.",
        timestamp: "11:42 AM",
        status: "read",
        isOutgoing: false
      }
    ]
  },
  {
    id: "conv-emp-1042",
    type: "direct",
    name: "Marcus Vance",
    username: "@marcus.v",
    employeeId: "EMP-1042",
    role: "Field Operations Supervisor",
    avatar: "MV",
    online: true,
    lastSeen: "Online",
    unreadCount: 1,
    lastMessage: {
      text: "Can we review the virtual walkthrough checklist on Jitsi before dispatch?",
      timestamp: "10:55 AM",
      status: "read",
      isOutgoing: false
    },
    messages: [
      {
        id: "msg-m-1",
        senderId: "emp-1042",
        senderName: "Marcus Vance",
        text: "Morning! The Apex Logistics site manager just signed off on the initial inspection report.",
        timestamp: "10:14 AM",
        status: "read",
        isOutgoing: false
      },
      {
        id: "msg-m-2",
        senderId: "me",
        senderName: "You",
        text: "Outstanding work Marcus. Did they confirm the weekend deep-clean schedule?",
        timestamp: "10:25 AM",
        status: "read",
        isOutgoing: true
      },
      {
        id: "msg-m-3",
        senderId: "emp-1042",
        senderName: "Marcus Vance",
        text: "Can we review the virtual walkthrough checklist on Jitsi before dispatch?",
        timestamp: "10:55 AM",
        status: "read",
        isOutgoing: false
      }
    ]
  },
  {
    id: "conv-group-safety",
    type: "group",
    name: "Supervisors & CAPA Compliance",
    avatar: "SC",
    membersCount: 5,
    unreadCount: 0,
    lastMessage: {
      text: "OSHA 1910 standard briefing uploaded to platform academy.",
      timestamp: "Yesterday",
      status: "read",
      isOutgoing: false
    },
    messages: [
      {
        id: "msg-s-1",
        senderId: "emp-1024",
        senderName: "Elena Rostova (EMP-1024)",
        text: "OSHA 1910 standard briefing uploaded to platform academy.",
        timestamp: "Yesterday at 4:10 PM",
        status: "read",
        isOutgoing: false
      }
    ]
  },
  {
    id: "conv-emp-3015",
    type: "direct",
    name: "Carlos Rodriguez",
    username: "@carlos.tech",
    employeeId: "EMP-3015",
    role: "Commercial Cleaning Lead Tech",
    avatar: "CR",
    online: true,
    lastSeen: "Online",
    unreadCount: 0,
    lastMessage: {
      text: "Restock order for microfiber pads and neutral floor cleaner arrived.",
      timestamp: "Yesterday",
      status: "read",
      isOutgoing: true
    },
    messages: [
      {
        id: "msg-c-1",
        senderId: "me",
        senderName: "You",
        text: "Restock order for microfiber pads and neutral floor cleaner arrived.",
        timestamp: "Yesterday at 3:15 PM",
        status: "read",
        isOutgoing: true
      }
    ]
  }
];

export default function EmployeeChatPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("conv-emp-1042");
  const [filterTab, setFilterTab] = useState<"all" | "direct" | "groups">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from localStorage or initial
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("scoms_employee_chats");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to read chat cache:", e);
      }
    }
    setConversations(INITIAL_CONVERSATIONS);
  }, []);

  // Save to localStorage whenever conversations update
  useEffect(() => {
    if (conversations.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem("scoms_employee_chats", JSON.stringify(conversations));
      } catch {}
    }
  }, [conversations]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, conversations]);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    const userEmpId = user?.employeeId || "EMP-0001";
    const userDisplayName = user ? `${user.firstName} ${user.lastName}` : "You";

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      senderName: `${userDisplayName} (${userEmpId})`,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent" as const,
      isOutgoing: true
    };

    const updatedConvs: ChatConversation[] = conversations.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          lastMessage: {
            text: newMsg.text,
            timestamp: newMsg.timestamp,
            status: "sent" as const,
            isOutgoing: true
          },
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    setConversations(updatedConvs);
    setInputMessage("");
    setShowEmojiPicker(false);

    // Simulate WhatsApp double tick delivery after 1s and blue tick read after 2.5s
    setTimeout(() => {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              lastMessage: { ...c.lastMessage, status: "delivered" as const },
              messages: c.messages.map(m => (m.id === newMsg.id ? { ...m, status: "delivered" as const } : m))
            };
          }
          return c;
        })
      );
    }, 1000);

    setTimeout(() => {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              lastMessage: { ...c.lastMessage, status: "read" as const },
              messages: c.messages.map(m => (m.id === newMsg.id ? { ...m, status: "read" as const } : m))
            };
          }
          return c;
        })
      );

      // Automated realistic reply in direct chat
      if (activeConv.type === "direct") {
        setTimeout(() => {
          const autoReply: ChatMessage = {
            id: `msg-reply-${Date.now()}`,
            senderId: activeConv.id,
            senderName: activeConv.name,
            text: `Understood! Updating the shift board now for ${activeConv.employeeId}. I'll sync with dispatch.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "read" as const,
            isOutgoing: false
          };

          setConversations(currentConvs =>
            currentConvs.map(c => {
              if (c.id === activeConv.id) {
                return {
                  ...c,
                  lastMessage: {
                    text: autoReply.text,
                    timestamp: autoReply.timestamp,
                    status: "read" as const,
                    isOutgoing: false
                  },
                  messages: [...c.messages, autoReply]
                };
              }
              return c;
            })
          );
        }, 1200);
      }
    }, 2500);
  };

  const handleStartVideoCall = () => {
    if (!activeConv) return;
    const roomSlug = activeConv.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20);
    const roomUrl = `SCOMS-Chat-${roomSlug}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    router.push(`/dashboard/communications/meetings?join=${roomUrl}`);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: ChatConversation = {
      id: `conv-group-${Date.now()}`,
      type: "group",
      name: newGroupName.trim(),
      avatar: newGroupName.substring(0, 2).toUpperCase(),
      membersCount: selectedEmployees.length + 1,
      unreadCount: 0,
      lastMessage: {
        text: "Group created by management.",
        timestamp: "Just now",
        isOutgoing: true,
        status: "read"
      },
      messages: [
        {
          id: `msg-g-init-${Date.now()}`,
          senderId: "system",
          senderName: "System",
          text: `Group "${newGroupName.trim()}" created with ${selectedEmployees.length + 1} team members.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read",
          isOutgoing: false
        }
      ]
    };

    setConversations([newGroup, ...conversations]);
    setActiveConvId(newGroup.id);
    setShowNewGroupModal(false);
    setNewGroupName("");
    setSelectedEmployees([]);
  };

  const filteredConversations = conversations.filter(c => {
    if (filterTab === "direct" && c.type !== "direct") return false;
    if (filterTab === "groups" && c.type !== "group") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmpId = c.employeeId?.toLowerCase().includes(q);
      const matchUsername = c.username?.toLowerCase().includes(q);
      const matchLast = c.lastMessage.text.toLowerCase().includes(q);
      if (!matchName && !matchEmpId && !matchUsername && !matchLast) return false;
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col max-w-[1500px] mx-auto p-4 md:p-6 pb-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>Employee Team Chat</span>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                Live Messenger
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Direct WhatsApp-style employee messaging, shift groups, read receipts, and one-click video sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Group</span>
          </button>

          <Link
            href="/dashboard/communications/meetings"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition"
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Open Video Hall</span>
          </Link>
        </div>
      </div>

      {/* Main Messenger Workspace */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: CONVERSATIONS & EMPLOYEES LIST */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
          
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, EMP ID, @username..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-2.5">
              {(["all", "direct", "groups"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                    filterTab === tab
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab === "all" ? "All Chats" : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No chats found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      // mark read locally
                      setConversations(prev =>
                        prev.map(c => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                      );
                    }}
                    className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors relative ${
                      isActive ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-slate-100/60"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        conv.type === "group"
                          ? "bg-indigo-600 text-white"
                          : "bg-blue-600 text-white shadow-xs"
                      }`}>
                        {conv.avatar}
                      </div>
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {conv.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {conv.lastMessage.timestamp}
                        </span>
                      </div>

                      {/* Employee ID & Username Tag */}
                      {conv.employeeId && (
                        <p className="text-[10px] font-mono text-slate-500 truncate mb-1">
                          <span className="font-bold text-blue-600">{conv.employeeId}</span> • {conv.username}
                        </p>
                      )}

                      {/* Last Message with WhatsApp Read Ticks */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        {conv.lastMessage.isOutgoing && (
                          <span className="shrink-0">
                            {conv.lastMessage.status === "read" ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                            ) : conv.lastMessage.status === "delivered" ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </span>
                        )}
                        <p className="truncate text-[11px] leading-relaxed">
                          {conv.lastMessage.text}
                        </p>
                      </div>
                    </div>

                    {/* Unread Badge */}
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT WINDOW */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            
            {/* Chat Top Header */}
            <div className="h-16 px-4 md:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                    activeConv.type === "group" ? "bg-indigo-600 text-white" : "bg-blue-600 text-white"
                  }`}>
                    {activeConv.avatar}
                  </div>
                  {activeConv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate">
                      {activeConv.name}
                    </h3>
                    {activeConv.employeeId && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md">
                        {activeConv.employeeId}
                      </span>
                    )}
                  </div>
                  
                  {/* WhatsApp Last Seen or Group Members */}
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    {activeConv.type === "group" ? (
                      <span>{activeConv.membersCount} participants • Active dispatch channel</span>
                    ) : activeConv.online ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span>{activeConv.lastSeen || "Offline"}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleStartVideoCall}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-xs"
                  title="Start instant video conference with this team member"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Start Video Call</span>
                </button>

                <button
                  onClick={() => setShowMemberDetails(!showMemberDetails)}
                  className={`p-2 rounded-xl border text-slate-600 transition ${
                    showMemberDetails ? "bg-slate-200 border-slate-300" : "bg-white hover:bg-slate-100 border-slate-200"
                  }`}
                  title="View Employee Profile"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body & Messages Area */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Messages Stream */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                
                {/* Date Divider */}
                <div className="flex items-center justify-center my-2">
                  <span className="bg-slate-200/80 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Today
                  </span>
                </div>

                {activeConv.messages.map(msg => {
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isOutgoing ? "items-end" : "items-start"}`}
                    >
                      {/* Sender Name in Group */}
                      {!msg.isOutgoing && activeConv.type === "group" && (
                        <span className="text-[10px] font-bold text-blue-700 ml-3 mb-1">
                          {msg.senderName}
                        </span>
                      )}

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 shadow-xs text-xs leading-relaxed ${
                          msg.isOutgoing
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Message Metadata: Timestamp + WhatsApp Ticks */}
                        <div
                          className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                            msg.isOutgoing ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {msg.isOutgoing && (
                            <span>
                              {msg.status === "read" ? (
                                <CheckCheck className="w-3.5 h-3.5 text-cyan-200 stroke-[3]" />
                              ) : msg.status === "delivered" ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-blue-200" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Side Drawer: Employee Info & Facility */}
              {showMemberDetails && (
                <div className="w-72 border-l border-slate-200 p-5 bg-white flex flex-col space-y-4 overflow-y-auto animate-in slide-in-from-right duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Staff Info</h4>
                    <button
                      onClick={() => setShowMemberDetails(false)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                      {activeConv.avatar}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{activeConv.name}</h3>
                    <p className="text-xs font-mono font-bold text-blue-600 mt-0.5">
                      {activeConv.employeeId || "TEAM-GRP"}
                    </p>
                    <p className="text-[11px] text-slate-500">{activeConv.username}</p>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Role Scope</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{activeConv.role || "Operational Crew"}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Facility</p>
                      <p className="font-semibold text-slate-800 mt-0.5">Apex Logistics & Dallas Metro Hub</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shift Schedule</p>
                      <p className="font-semibold text-slate-800 mt-0.5">Monday — Friday • 06:00 AM – 02:30 PM</p>
                    </div>

                    <button
                      onClick={handleStartVideoCall}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Direct Video Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
                {["👍", "👏", "✅", "🧼", "📋", "🔥", "🚀", "❤️", "🙌"].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setInputMessage(prev => prev + emoji);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-base transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 md:p-4 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                title="Insert Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => alert("Attachment preview: In-app SDS document and site photo uploading active.")}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                title="Attach Document or Image"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder={`Message ${activeConv.name} (EMP ID: ${activeConv.employeeId || "Group"})...`}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl transition shadow-xs"
                title="Send Message (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
            Select an employee or group channel from the left to start chatting.
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Shift Group</h3>
                <p className="text-xs text-slate-500">Group channel with employee ID tags</p>
              </div>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Group Channel Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Night Shift Deep-Clean Team"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Select Team Members
                </label>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {TEAM_DIRECTORY.map(emp => {
                    const isSelected = selectedEmployees.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {emp.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{emp.name}</p>
                            <p className="text-[10px] font-mono text-slate-500">
                              {emp.employeeId} • {emp.username}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedEmployees(prev =>
                              isSelected ? prev.filter(id => id !== emp.id) : [...prev, emp.id]
                            );
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-40"
                >
                  Create Group Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
