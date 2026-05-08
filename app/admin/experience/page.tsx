"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Save, Plus, Trash2, Edit2, X, Briefcase, GraduationCap } from "lucide-react";

interface Experience {
  _id?: string;
  type: "work" | "education";
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  tags: string[];
  keyFocus: string[];
  current: boolean;
  order: number;
}

const empty = (): Experience => ({
  type: "work", title: "", company: "", location: "", period: "",
  description: "", tags: [], keyFocus: [], current: false, order: 0,
});

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all";
const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

function ExperienceForm({ exp, onSave, onCancel }: {
  exp: Experience; onSave: (e: Experience) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(exp);
  const [tagInput, setTagInput] = useState("");
  const [focusInput, setFocusInput] = useState("");

  const set = (key: keyof Experience, val: Experience[keyof Experience]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  };
  const addFocus = () => {
    const t = focusInput.trim();
    if (t && !form.keyFocus.includes(t)) setForm((p) => ({ ...p, keyFocus: [...p.keyFocus, t] }));
    setFocusInput("");
  };

  return (
    <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-white text-sm">{form._id ? "Edit Experience" : "New Experience"}</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2">
        {(["work", "education"] as const).map((t) => (
          <button key={t} type="button" onClick={() => set("type", t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              form.type === t ? "bg-indigo-500 text-white" : "border border-gray-700 text-gray-400 hover:text-white"
            }`}>
            {t === "work" ? <Briefcase size={14} /> : <GraduationCap size={14} />}
            {t === "work" ? "Work" : "Education"}
          </button>
        ))}
        <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
          <input type="checkbox" checked={form.current} onChange={(e) => set("current", e.target.checked)}
            className="w-4 h-4 rounded accent-green-500" />
          <span className="text-sm text-gray-300">Currently Here</span>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Title / Position</label>
          <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Frontend Developer" /></div>
        <div><label className={labelCls}>Company / Institution</label>
          <input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company Name" /></div>
        <div><label className={labelCls}>Location</label>
          <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" /></div>
        <div><label className={labelCls}>Period</label>
          <input className={inputCls} value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="2023 – Present" /></div>
        <div className="sm:col-span-2"><label className={labelCls}>Description</label>
          <textarea rows={3} className={`${inputCls} resize-none`} value={form.description}
            onChange={(e) => set("description", e.target.value)} /></div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelCls}>Tags / Technologies</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.tags.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
              {t} <button onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))}><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputCls} flex-1`} value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="React → press Enter" />
          <button onClick={addTag} className="px-3 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 text-sm hover:bg-indigo-500/30 transition-colors">Add</button>
        </div>
      </div>

      {/* Key Focus */}
      <div>
        <label className={labelCls}>Key Focus / Achievements</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.keyFocus.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300 text-xs">
              {t} <button onClick={() => setForm((p) => ({ ...p, keyFocus: p.keyFocus.filter((x) => x !== t) }))}><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputCls} flex-1`} value={focusInput}
            onChange={(e) => setFocusInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFocus(); } }}
            placeholder="Performance optimization → Enter" />
          <button onClick={addFocus} className="px-3 py-2 rounded-xl bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition-colors">Add</button>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Order:</label>
          <input type="number" className="w-16 px-2 py-1.5 rounded-lg border border-gray-700 bg-gray-800/50 text-white text-sm focus:outline-none"
            value={form.order} onChange={(e) => set("order", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors">
          <Save size={15} /> Save
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ExperienceAdminPage() {
  const toast = useToast();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/experience");
      const json = await res.json();
      if (Array.isArray(json)) setItems(json);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (exp: Experience) => {
    try {
      const url = exp._id ? `/api/experience/${exp._id}` : "/api/experience";
      const method = exp._id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(exp) });
      if (!res.ok) throw new Error();
      toast.success("Saved!", exp._id ? "Experience updated." : "Experience added.");
      setEditing(null); setShowForm(false); load();
    } catch { toast.error("Error", "Could not save experience."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await fetch(`/api/experience/${id}`, { method: "DELETE" });
      toast.success("Deleted", "Entry removed."); load();
    } catch { toast.error("Error", "Could not delete."); }
  };

  if (loading) return (
    <>
      <AdminTopbar title="Experience" subtitle="Manage your work history & education" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    </>
  );

  return (
    <>
      <AdminTopbar title="Experience" subtitle="Manage your work history & education" />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <main className="flex-1 p-6 max-w-4xl space-y-4">
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/25">
            <Plus size={16} /> Add Entry
          </button>
        )}

        {showForm && !editing && (
          <ExperienceForm exp={empty()} onSave={handleSave} onCancel={() => setShowForm(false)} />
        )}

        <div className="space-y-3">
          {items.map((exp) =>
            editing?._id === exp._id ? (
              <ExperienceForm key={exp._id} exp={editing!} onSave={handleSave} onCancel={() => setEditing(null)} />
            ) : (
              <div key={exp._id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex items-start gap-4 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  exp.type === "work" ? "bg-indigo-500/10" : "bg-purple-500/10"}`}>
                  {exp.type === "work"
                    ? <Briefcase size={15} className="text-indigo-400" />
                    : <GraduationCap size={15} className="text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-white text-sm truncate">{exp.title}</h3>
                    {exp.current && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex-shrink-0">Current</span>}
                  </div>
                  <p className="text-xs text-indigo-400 mb-1">{exp.company}</p>
                  <p className="text-xs text-gray-500">{exp.period} · {exp.location}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditing(exp)}
                    className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => exp._id && handleDelete(exp._id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </>
  );
}
