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
  period: string; // Used for display (formatted)
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

const formatMonth = (m: string, y: string) => {
  if (!m || !y) return "";
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all";
const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1980 + 11 }, (_, i) => currentYear + 10 - i);

const selectCls = "flex-1 px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-indigo-500/60 transition-all cursor-pointer hover:bg-gray-700 font-medium";

function ExperienceForm({ exp, onSave, onCancel }: {
  exp: Experience; onSave: (e: Experience) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(exp);
  const [tagInput, setTagInput] = useState("");
  const [focusInput, setFocusInput] = useState("");

  // Local state for dropdowns to fix selection issue
  const [startM, setStartM] = useState("");
  const [startY, setStartY] = useState("");
  const [endM, setEndM] = useState("");
  const [endY, setEndY] = useState("");

  // Initialize dropdowns from existing period string if possible
  useEffect(() => {
    try {
      const p = JSON.parse(exp.period);
      if (p.start) {
        const [y, m] = p.start.split("-");
        setStartM(parseInt(m).toString());
        setStartY(y);
      }
      if (p.end && p.end !== "Present") {
        const [y, m] = p.end.split("-");
        setEndM(parseInt(m).toString());
        setEndY(y);
      }
    } catch { /* legacy or empty */ }
  }, [exp.period]);

  const set = (key: keyof Experience, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleLocalSave = () => {
    const startDateStr = startM && startY ? `${startY}-${startM.padStart(2, "0")}` : "";
    const endDateStr = endM && endY ? `${endY}-${endM.padStart(2, "0")}` : "";

    const periodData = JSON.stringify({
      start: startDateStr,
      end: form.current ? "Present" : endDateStr,
      current: form.current
    });

    onSave({ ...form, period: periodData });
  };

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
    <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6 space-y-6 backdrop-blur-sm shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
            {form.type === "work" ? <Briefcase size={20} className="text-indigo-400" /> : <GraduationCap size={20} className="text-purple-400" />}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">{form._id ? "Edit Experience" : "New Experience"}</h3>
            <p className="text-xs text-gray-500 font-medium">Select your {form.type} timeline dates</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"><X size={20} /></button>
      </div>

      {/* Type toggle + Current Status */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-800/20 p-4 rounded-2xl border border-gray-700/50">
        <div className="flex gap-1.5 p-1 bg-gray-900/50 rounded-xl border border-gray-700 w-fit">
          {(["work", "education"] as const).map((t) => (
            <button key={t} type="button" onClick={() => set("type", t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${form.type === t ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105" : "text-gray-500 hover:text-gray-300"
                }`}>
              {t === "work" ? <Briefcase size={14} /> : <GraduationCap size={14} />}
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 md:flex justify-end">
          <label className={`flex items-center gap-3 px-5 py-2.5 rounded-xl cursor-pointer transition-all border ${form.current ? "bg-green-500/10 border-green-500/30 text-green-400 ring-2 ring-green-500/10" : "bg-gray-900/50 border-gray-700 text-gray-500"
            }`}>
            <input type="checkbox" checked={form.current} onChange={(e) => set("current", e.target.checked)}
              className="w-4 h-4 rounded accent-green-500 cursor-pointer" />
            <span className="text-sm font-bold select-none tracking-tight">
              {form.type === "work" ? "Currently Working Here" : "Currently Studying Here"}
            </span>
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelCls}>Title / Position</label>
          <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Frontend Developer" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>{form.type === "work" ? "Company Name" : "Institution Name"}</label>
          <input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. Google" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className={labelCls}>Location</label>
          <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country (or Remote)" />
        </div>

        {/* Timeline Pickers */}
        <div className="space-y-2">
          <label className={labelCls}>Start Date</label>
          <div className="flex gap-2">
            <select className={selectCls} value={startM} onChange={(e) => setStartM(e.target.value)}>
              <option value="" disabled>Month</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className={selectCls} value={startY} onChange={(e) => setStartY(e.target.value)}>
              <option value="" disabled>Year</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2 relative">
          <label className={labelCls}>End Date</label>
          {form.current ? (
            <div className="flex items-center justify-center h-[45px] px-3 py-2.5 rounded-xl border border-green-500/30 bg-green-500/5 text-green-400 text-sm font-bold">
              Present
            </div>
          ) : (
            <div className="flex gap-2 animate-in fade-in duration-300">
              <select className={selectCls} value={endM} onChange={(e) => setEndM(e.target.value)}>
                <option value="" disabled>Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select className={selectCls} value={endY} onChange={(e) => setEndY(e.target.value)}>
                <option value="" disabled>Year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className={labelCls}>Description</label>
          <textarea rows={4} className={`${inputCls} resize-none leading-relaxed`} value={form.description}
            onChange={(e) => set("description", e.target.value)} placeholder="Describe your roles, responsibilities, and key projects..." />
        </div>
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

      <div className="flex gap-3 pt-4">
        <button onClick={handleLocalSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
          <Save size={16} /> Save Experience
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
      if (Array.isArray(json)) {
        const mapped = json.map((item: Experience) => {
          try {
            const parsed = JSON.parse(item.period);
            return {
              ...item,
              startDate: parsed.start || "",
              endDate: parsed.end === "Present" ? "" : parsed.end || "",
            };
          } catch {
            return item;
          }
        });
        setItems(mapped);
      }
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
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${exp.type === "work" ? "bg-indigo-500/10" : "bg-purple-500/10"}`}>
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
                  <p className="text-xs text-gray-500">
                    {(() => {
                      try {
                        const p = JSON.parse(exp.period);
                        const start = formatMonth(p.start.month, p.start.year);
                        const end = p.current ? "Present" : formatMonth(p.end.month, p.end.year);
                        return `${start} – ${end}`;
                      } catch {
                        return exp.period;
                      }
                    })()} · {exp.location}
                  </p>
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
