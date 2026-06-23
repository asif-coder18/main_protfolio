"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Save, Plus, Trash2, GripVertical, Type } from "lucide-react";
import { IconPicker } from "@/components/admin/IconPicker";
import { Icon } from "@iconify/react";

interface Skill { name: string; level: number; icon: string; }
interface Category { _id?: string; title: string; color: string; order: number; skills: Skill[]; }
interface TechIcon { _id?: string; name: string; icon: string; bg: string; text: string; order: number; }
interface SkillMeta {
  badge: string;
  heading: string;
  highlight: string;
  description: string;
}

const DEFAULT_META: SkillMeta = {
  badge: "Skills",
  heading: "My Tech Stack",
  highlight: "Tech Stack",
  description: "Technologies I work with to build modern, performant web applications.",
};

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
  const [skillMeta, setSkillMeta] = useState<SkillMeta>(DEFAULT_META);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"categories" | "techicons">("categories");

  // Icon Picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{ type: "skill" | "badge"; ci?: number; si?: number; bi?: number } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/skills");
      const json = await res.json();
      if (json.categories) setCategories(json.categories);
      if (json.techIcons) {
        const mapped = json.techIcons.map((ti: any) => ({
          ...ti,
          icon: ti.icon || ti.symbol || "logos:react"
        }));
        setTechIcons(mapped);
      }
      if (json.skillMeta) setSkillMeta({ ...DEFAULT_META, ...json.skillMeta });
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
        body: JSON.stringify({ categories, techIcons, skillMeta }),
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
  const addCategory = () => setCategories((p) => [...p, { title: "", color: "indigo", order: p.length, skills: [] }]);
  const removeCategory = (i: number) => setCategories((p) => p.filter((_, idx) => idx !== i));
  const updateCategory = (i: number, key: keyof Category, val: Category[keyof Category]) =>
    setCategories((p) => { const c = [...p]; c[i] = { ...c[i], [key]: val }; return c; });

  const addSkill = (ci: number) => setCategories((p) => {
    const c = [...p]; c[ci] = { ...c[ci], skills: [...c[ci].skills, { name: "", level: 80, icon: "logos:react" }] }; return c;
  });
  const removeSkill = (ci: number, si: number) => setCategories((p) => {
    const c = [...p]; c[ci] = { ...c[ci], skills: c[ci].skills.filter((_, idx) => idx !== si) }; return c;
  });
  const updateSkill = (ci: number, si: number, key: keyof Skill, val: string | number) =>
    setCategories((p) => { const c = [...p]; c[ci].skills[si] = { ...c[ci].skills[si], [key]: val }; return c; });

  // TechIcon helpers
  const addIcon = () => setTechIcons((p) => [...p, { name: "", icon: "logos:react", bg: "bg-indigo-500/10", text: "text-indigo-400", order: p.length }]);
  const removeIcon = (i: number) => setTechIcons((p) => p.filter((_, idx) => idx !== i));
  const updateIcon = (i: number, key: keyof TechIcon, val: string | number) =>
    setTechIcons((p) => { const t = [...p]; t[i] = { ...t[i], [key]: val }; return t; });

  const openSkillPicker = (ci: number, si: number) => {
    setPickerConfig({ type: "skill", ci, si });
    setPickerOpen(true);
  };

  const openBadgePicker = (bi: number) => {
    setPickerConfig({ type: "badge", bi });
    setPickerOpen(true);
  };

  const handleIconSelect = (icon: string) => {
    if (!pickerConfig) return;
    if (pickerConfig.type === "skill" && pickerConfig.ci !== undefined && pickerConfig.si !== undefined) {
      updateSkill(pickerConfig.ci, pickerConfig.si, "icon", icon);
    } else if (pickerConfig.type === "badge" && pickerConfig.bi !== undefined) {
      updateIcon(pickerConfig.bi, "icon", icon);
    }
  };

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

      {pickerOpen && pickerConfig && (
        <IconPicker 
          title="Select Technology Icon"
          selectedIcon={pickerConfig.type === "skill" 
            ? categories[pickerConfig.ci!].skills[pickerConfig.si!].icon 
            : techIcons[pickerConfig.bi!].icon
          }
          onSelect={handleIconSelect}
          onClose={() => {
            setPickerOpen(false);
            setPickerConfig(null);
          }}
        />
      )}

      <main className="flex-1 p-6 max-w-5xl">

        {/* ── Skills Section Settings ── */}
        <div className="bg-gray-900/50 border border-indigo-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Type size={15} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Skills Section Settings</p>
              <p className="text-xs text-gray-500 mt-0.5">Customize the heading text shown on your portfolio's Skills section</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Badge */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Section Badge
                <span className="ml-2 normal-case font-normal text-gray-600">e.g. SKILLS</span>
              </label>
              <input
                className={inputCls}
                value={skillMeta.badge}
                onChange={(e) => setSkillMeta((p) => ({ ...p, badge: e.target.value }))}
                placeholder="SKILLS"
              />
            </div>

            {/* Main Heading */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Main Heading
                <span className="ml-2 normal-case font-normal text-gray-600">e.g. My Tech Stack</span>
              </label>
              <input
                className={inputCls}
                value={skillMeta.heading}
                onChange={(e) => setSkillMeta((p) => ({ ...p, heading: e.target.value }))}
                placeholder="My Tech Stack"
              />
            </div>

            {/* Highlighted Word */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Highlighted Word
                <span className="ml-2 normal-case font-normal text-gray-600">gradient part of heading</span>
              </label>
              <input
                className={inputCls}
                value={skillMeta.highlight}
                onChange={(e) => setSkillMeta((p) => ({ ...p, highlight: e.target.value }))}
                placeholder="Tech Stack"
              />
              <p className="text-[10px] text-gray-600 mt-1">Must appear inside the Main Heading — this word gets the gradient color</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                className={`${inputCls} resize-none`}
                value={skillMeta.description}
                onChange={(e) => setSkillMeta((p) => ({ ...p, description: e.target.value }))}
                placeholder="Technologies I work with..."
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="mt-5 p-4 rounded-xl bg-gray-950/60 border border-gray-800 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Preview</p>
            <span className="text-indigo-400 text-xs font-semibold tracking-widest uppercase block mb-1">
              {skillMeta.badge || "SKILLS"}
            </span>
            <h3 className="text-lg font-bold text-white">
              {skillMeta.highlight && skillMeta.heading.includes(skillMeta.highlight)
                ? <>
                    {skillMeta.heading.split(skillMeta.highlight)[0]}
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {skillMeta.highlight}
                    </span>
                    {skillMeta.heading.split(skillMeta.highlight)[1]}
                  </>
                : skillMeta.heading || "My Tech Stack"
              }
            </h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto">
              {skillMeta.description || "Description text..."}
            </p>
          </div>
        </div>

        {/* Tabs & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {(["categories", "techicons"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab ? "bg-indigo-500 text-white" : "border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                }`}>
                {tab === "categories" ? "Skill Categories" : "Tech Icon Badges"}
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              if (activeTab === "categories") {
                const defaults = [
                  { title: "Languages", color: "orange", order: 0, skills: [
                    { name: "HTML5", level: 95, icon: "logos:html-5" },
                    { name: "CSS3", level: 90, icon: "logos:css-3" },
                    { name: "JavaScript", level: 85, icon: "logos:javascript" },
                    { name: "TypeScript", level: 80, icon: "logos:typescript-icon" },
                  ]},
                  { title: "Frameworks", color: "blue", order: 1, skills: [
                    { name: "React", level: 90, icon: "logos:react" },
                    { name: "Next.js", level: 85, icon: "logos:nextjs-icon" },
                    { name: "Tailwind CSS", level: 95, icon: "logos:tailwindcss-icon" },
                  ]}
                ];
                setCategories((p) => [...p, ...defaults]);
                toast.success("Added Templates", "Common skill categories have been added.");
              } else {
                const defaults = [
                  { name: "Next.js", icon: "logos:nextjs-icon", bg: "bg-white/10", text: "text-white", order: 0 },
                  { name: "React", icon: "logos:react", bg: "bg-blue-500/10", text: "text-blue-400", order: 1 },
                  { name: "Tailwind", icon: "logos:tailwindcss-icon", bg: "bg-cyan-500/10", text: "text-cyan-400", order: 2 },
                  { name: "JavaScript", icon: "logos:javascript", bg: "bg-yellow-500/10", text: "text-yellow-400", order: 3 },
                ];
                setTechIcons((p) => [...p, ...defaults]);
                toast.success("Added Templates", "Common tech badges have been added.");
              }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-500/30 text-indigo-400 text-xs font-bold hover:bg-indigo-500/10 transition-all"
          >
            <Plus size={14} /> Quick Setup: HTML/JS/Next.js
          </button>
        </div>


        {activeTab === "categories" ? (
          <div className="space-y-6">
            {categories.map((cat, ci) => (
              <div key={ci} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                {/* Category header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 pb-6 border-b border-gray-800/50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gray-800 rounded-lg cursor-grab active:cursor-grabbing text-gray-500">
                      <GripVertical size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Category Title</label>
                      <input
                        className={inputCls}
                        value={cat.title}
                        onChange={(e) => updateCategory(ci, "title", e.target.value)}
                        placeholder="e.g. Frontend Development"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Theme Color</label>
                      <select
                        className={`${inputCls} w-36`}
                        value={cat.color}
                        onChange={(e) => updateCategory(ci, "color", e.target.value)}
                      >
                        {COLORS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="pt-5">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${colorBadge[cat.color]} shadow-sm inline-block min-w-[80px] text-center`}>
                        {cat.title || "Preview"}
                      </span>
                    </div>
                    <button
                      onClick={() => removeCategory(ci)}
                      className="pt-5 text-gray-600 hover:text-red-400 transition-colors p-2"
                      title="Delete Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Skills Header Labels */}
                {cat.skills.length > 0 && (
                  <div className="grid grid-cols-[48px_1fr_180px_32px] gap-3 px-1 mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center">Icon</label>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Skill Name</label>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Proficiency (%)</label>
                    <div />
                  </div>
                )}

                {/* Skills */}
                <div className="space-y-3">
                  {cat.skills.map((skill, si) => (
                    <div key={si} className="grid grid-cols-[48px_1fr_180px_32px] gap-3 items-center group">
                      <button 
                        onClick={() => openSkillPicker(ci, si)}
                        className="w-12 h-10 rounded-lg border border-gray-700 bg-gray-800/50 flex items-center justify-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group/icon"
                        title="Click to select icon"
                      >
                        <Icon icon={skill.icon || "logos:react"} className="w-6 h-6 transition-transform group-hover/icon:scale-110" />
                      </button>
                      <input
                        className={inputCls}
                        value={skill.name}
                        onChange={(e) => updateSkill(ci, si, "name", e.target.value)}
                        placeholder="e.g. Next.js"
                      />
                      <div className="flex items-center gap-3 bg-gray-800/30 px-3 py-1.5 rounded-lg border border-gray-700/50">
                        <input
                          type="range" min={0} max={100} value={skill.level}
                          onChange={(e) => updateSkill(ci, si, "level", parseInt(e.target.value))}
                          className="flex-1 accent-indigo-500 h-1.5 rounded-lg appearance-none bg-gray-700 cursor-pointer"
                        />
                        <input
                          type="number" min={0} max={100} value={skill.level}
                          onChange={(e) => updateSkill(ci, si, "level", parseInt(e.target.value) || 0)}
                          className="w-10 bg-transparent text-xs text-indigo-400 font-bold focus:outline-none text-right"
                        />
                        <span className="text-[10px] text-gray-500">%</span>
                      </div>
                      <button
                        onClick={() => removeSkill(ci, si)}
                        className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addSkill(ci)}
                    className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-all mt-4 px-2 py-1.5 rounded-lg hover:bg-indigo-500/5 w-fit"
                  >
                    <Plus size={14} /> Add New Skill
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addCategory}
              className="flex items-center gap-2 px-4 py-4 rounded-2xl border-2 border-dashed border-gray-800 hover:border-indigo-500/50 text-gray-500 hover:text-indigo-400 bg-gray-900/20 hover:bg-indigo-500/5 transition-all w-full justify-center text-sm font-bold tracking-wide">
              <Plus size={18} /> CREATE NEW CATEGORY
            </button>
          </div>

        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {techIcons.map((badge, bi) => (
                <div key={bi} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 group backdrop-blur-sm shadow-lg transition-all hover:border-gray-700">
                  <button 
                    onClick={() => openBadgePicker(bi)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-xl transition-all hover:scale-105 border border-white/5 ${badge.bg} ${badge.text}`}
                    title="Click to select tech icon"
                  >
                    <Icon icon={badge.icon || "logos:react"} className="w-8 h-8" />
                  </button>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">Badge Name</label>
                      <input className={inputCls} value={badge.name}
                        onChange={(e) => updateIcon(bi, "name", e.target.value)} placeholder="e.g. React" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">BG Class</label>
                        <input className={inputCls} value={badge.bg}
                          onChange={(e) => updateIcon(bi, "bg", e.target.value)} placeholder="bg-blue-500/10" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">Text Class</label>
                        <input className={inputCls} value={badge.text}
                          onChange={(e) => updateIcon(bi, "text", e.target.value)} placeholder="text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeIcon(bi)} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addIcon}
              className="flex items-center gap-2 px-4 py-4 rounded-2xl border-2 border-dashed border-gray-800 hover:border-indigo-500/50 text-gray-500 hover:text-indigo-400 bg-gray-900/20 hover:bg-indigo-500/5 transition-all w-full justify-center text-sm font-bold tracking-wide">
              <Plus size={18} /> ADD NEW TECH BADGE
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
