"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Trash2, Mail, MailOpen, RefreshCw, Search } from "lucide-react";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MessagesAdminPage() {
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      const json = await res.json();
      if (Array.isArray(json)) setMessages(json);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (msg: Message) => {
    if (msg.read) return;
    try {
      await fetch(`/api/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setMessages((p) => p.map((m) => m._id === msg._id ? { ...m, read: true } : m));
      setSelected((p) => p && p._id === msg._id ? { ...p, read: true } : p);
    } catch { /* ignore */ }
  };

  const handleSelect = (msg: Message) => {
    setSelected(msg);
    markRead(msg);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" });
      toast.success("Deleted", "Message removed.");
      setMessages((p) => p.filter((m) => m._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch {
      toast.error("Error", "Could not delete message.");
    }
  };

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <>
      <AdminTopbar
        title="Messages"
        subtitle={unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
      />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <main className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left: Message list */}
        <div className="w-80 flex-shrink-0 border-r border-gray-800 flex flex-col">
          {/* Search + refresh */}
          <div className="p-3 border-b border-gray-800 flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
            <button onClick={load} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <Mail size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">{search ? "No results" : "No messages yet"}</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg._id}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left p-4 border-b border-gray-800/60 transition-colors hover:bg-gray-800/40 ${selected?._id === msg._id ? "bg-indigo-500/10 border-l-2 border-l-indigo-500" : ""
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                      <span className={`text-sm font-semibold truncate ${msg.read ? "text-gray-300" : "text-white"}`}>
                        {msg.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className={`text-xs truncate mb-0.5 ${msg.read ? "text-gray-600" : "text-gray-400"}`}>{msg.subject}</p>
                  <p className="text-xs text-gray-600 truncate">{msg.message}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message detail */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {selected ? (
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">{selected.subject || "(No Subject)"}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="font-medium text-gray-300">{selected.name}</span>
                    <span>·</span>
                    <a href={`mailto:${selected.email}`} className="text-indigo-400 hover:underline">{selected.email}</a>
                    <span>·</span>
                    <span className="text-gray-500">{timeAgo(selected.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.read
                    ? <MailOpen size={16} className="text-gray-600" />
                    : <Mail size={16} className="text-indigo-400" />}
                  <button
                    onClick={() => handleDelete(selected._id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Reply */}
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
              >
                <Mail size={14} />
                Reply via Email
              </a>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <Mail size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
