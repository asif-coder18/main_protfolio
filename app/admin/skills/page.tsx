"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";

interface Skill { name: string; level: number; icon: string; }
interface Category { _id?: string; title: string; color: string; order: number; skills: Skill[]; }
interface TechIcon { _id?: string; name: string; symbol: string; bg: string; text: string; order: number; }

const COLORS = ["indigo", "purple", "pink", "blue", "green", "orange", "yellow", "cyan", "teal", "red"];
const colorBadge: Record<string, string> = {
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
};

const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/50 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all";

export default function SkillsAdminPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [techIcons, setTechIcons] = useState<TechIcon[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"categories" | "techicons">("categories");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/skills");
      const json = await res.json();
      if (json.categories) setCategories(json.categories);
      if (json.techIcons) setTechIcons(json.techIcons);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories, techIcons }),
      });
      if (!res.ok) throw new Error();
      toast.success("Saved!", "Skills updated successfully.");
    } catch {
      toast.error("Save failed", "Could not update skills.");
    } finally {
      setSaving(false);
    }
  };

  // Category helpers
  const addCategory = () => setCategories((p) => [...p, { title: "New Category", color: "indigo", order: p.length, skills: [] }]);
  const removeCategory = (i: number) => setCategories((p) => p.filter((_, idx) => idx !== i));
  const updateCategory = (i: number, key: keyof Category, val: Category[keyof Category]) =>
    setCategories((p) => { const c = [...p]; c[i] = { ...c[i], [key]: val }; return c; });

  const addSkill = (ci: number) => setCategories((p) => {
    const c = [...p]; c[ci] = { ...c[ci], skills: [...c[ci].skills, { name: "", level: 80, icon: "⚙️" }] }; return c;
  });
  const removeSkill = (ci: number, si: number) => setCategories((p) => {
    const c = [...p]; c[ci] = { ...c[ci], skills: c[ci].skills.filter((_, idx) => idx !== si) }; return c;
  });
  const updateSkill = (ci: number, si: number, key: keyof Skill, val: string | number) =>
    setCategories((p) => { const c = [...p]; c[ci].skills[si] = { ...c[ci].skills[si], [key]: val }; return c; });

  // TechIcon helpers
  const addIcon = () => setTechIcons((p) => [...p, { name: "", symbol: "", bg: "bg-indigo-500/10", text: "text-indigo-400", order: p.length }]);
  const removeIcon = (i: number) => setTechIcons((p) => p.filter((_, idx) => idx !== i));
  const updateIcon = (i: number, key: keyof TechIcon, val: string | number) =>
    setTechIcons((p) => { const t = [...p]; t[i] = { ...t[i], [key]: val }; return t; });

  if (loading) return (
    <>
      <AdminTopbar title="Skills" subtitle="Manage your tech stack and skill levels" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    </>
  );

  return (
    <>
      <AdminTopbar title="Skills" subtitle="Manage your tech stack and skill levels" />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <main className="flex-1 p-6 max-w-5xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["categories", "techicons"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? "bg-indigo-500 text-white" : "border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
              }`}>
              {tab === "categories" ? "Skill Categories" : "Tech Icon Badges"}
            </button>
          ))}
        </div>

        {activeTab === "categories" ? (
          <div className="space-y-4">
            {categories.map((cat, ci) => (
              <div key={ci} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <GripVertical size={16} className="text-gray-600" />
                  <input className={`${inputCls} flex-1`} value={cat.title}
                    onChange={(e) => updateCategory(ci, "title", e.target.value)} placeholder="Category name" />
                  <select className={`${inputCls} w-32`} value={cat.color}
                    onChange={(e) => updateCategory(ci, "color", e.target.value)}>
                    {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorBadge[cat.color]}`}>
                    {cat.title || "Preview"}
                  </span>
                  <button onClick={() => removeCategory(ci)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Skills */}
                <div className="space-y-2 ml-6">
                  {cat.skills.map((skill, si) => (
                    <div key={si} className="flex items-center gap-2">
                      <input className={`${inputCls} w-10 text-center px-1`} value={skill.icon}
                        onChange={(e) => updateSkill(ci, si, "icon", e.target.value)} title="Icon/emoji" />
                      <input className={`${inputCls} flex-1`} value={skill.name}
                        onChange={(e) => updateSkill(ci, si, "name", e.target.value)} placeholder="Skill name" />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <input type="range" min={0} max={100} value={skill.level}
                          onChange={(e) => updateSkill(ci, si, "level", parseInt(e.target.value))}
                          className="w-24 accent-indigo-500" />
                        <span className="text-xs text-gray-400 w-8 text-right">{skill.level}%</span>
                      </div>
                      <button onClick={() => removeSkill(ci, si)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addSkill(ci)}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1">
                    <Plus size={12} /> Add Skill
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addCategory}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-700 hover:border-indigo-500/50 text-gray-500 hover:text-indigo-400 transition-all w-full justify-center text-sm font-medium">
              <Plus size={16} /> Add Category
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {techIcons.map((icon, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${icon.bg} ${icon.text}`}>
                    {icon.symbol || "?"}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input className={`${inputCls} flex-1`} value={icon.name}
                        onChange={(e) => updateIcon(i, "name", e.target.value)} placeholder="Name (e.g. React)" />
                      <input className={`${inputCls} w-16 text-center`} value={icon.symbol}
                        onChange={(e) => updateIcon(i, "symbol", e.target.value)} placeholder="⚛" />
                    </div>
                    <div className="flex gap-2">
                      <input className={`${inputCls} flex-1`} value={icon.bg}
                        onChange={(e) => updateIcon(i, "bg", e.target.value)} placeholder="bg-indigo-500/10" />
                      <input className={`${inputCls} flex-1`} value={icon.text}
                        onChange={(e) => updateIcon(i, "text", e.target.value)} placeholder="text-indigo-400" />
                    </div>
                  </div>
                  <button onClick={() => removeIcon(i)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addIcon}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-700 hover:border-indigo-500/50 text-gray-500 hover:text-indigo-400 transition-all w-full justify-center text-sm font-medium">
              <Plus size={16} /> Add Tech Icon
            </button>
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end pt-6">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/25">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </>
  );
}
