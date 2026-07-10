"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import {
  Save, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown,
  LayoutList, Loader2, Plus, Trash2, Edit2,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import type { CustomSection } from "@/app/api/custom-sections/route";

interface SectionConfig {
  id: string;
  label: string;
  order: number;
  visible: boolean;
}

const SECTION_META: Record<string, { icon: string; description: string; adminHref: string }> = {
  hero:       { icon: "🏠", description: "Main landing area — name, title, CTA buttons",  adminHref: "/admin/about" },
  about:      { icon: "👤", description: "Bio, stats, highlights and profile image",       adminHref: "/admin/about" },
  skills:     { icon: "⚡", description: "Tech stack, skill bars and tech badge icons",    adminHref: "/admin/skills" },
  projects:   { icon: "📁", description: "Portfolio projects with links and tags",          adminHref: "/admin/projects" },
  experience: { icon: "💼", description: "Work history and education timeline",             adminHref: "/admin/experience" },
  contact:    { icon: "📬", description: "Contact form, social links and location info",    adminHref: "/admin/contact" },
};

export default function SectionsAdminPage() {
  const toast = useToast();
  const router = useRouter();
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("/api/section-settings"),
        fetch("/api/custom-sections"),
      ]);
      const [sData, cData] = await Promise.all([sRes.json(), cRes.json()]);
      if (Array.isArray(sData)) setSections(sData.sort((a, b) => a.order - b.order));
      if (Array.isArray(cData)) setCustomSections(cData);
    } catch {
      toast.error("Load failed", "Could not fetch section settings.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = sections.map((s, i) => ({ ...s, order: i }));
      const res = await fetch("/api/section-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSections(payload);
      toast.success("Saved!", "Section order and visibility updated.");
    } catch {
      toast.error("Save failed", "Could not save section settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = (id: string) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));

  const moveUp   = (i: number) => { if (i === 0) return; setSections(p => { const n=[...p]; [n[i-1],n[i]]=[n[i],n[i-1]]; return n; }); };
  const moveDown = (i: number) => { if (i === sections.length-1) return; setSections(p => { const n=[...p]; [n[i],n[i+1]]=[n[i+1],n[i]]; return n; }); };

  const deleteCustomSection = async (cs: CustomSection) => {
    if (!confirm(`Delete "${cs.label}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/custom-sections/${cs._id}`, { method: "DELETE" });
      // Also remove from section-settings
      const updated = sections.filter(s => s.id !== cs.sectionId);
      await fetch("/api/section-settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated.map((s, i) => ({ ...s, order: i }))),
      });
      toast.success("Deleted", `"${cs.label}" removed.`);
      load();
    } catch {
      toast.error("Delete failed", "Could not delete section.");
    }
  };

  const visibleCount = sections.filter(s => s.visible).length;

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <AdminTopbar title="Section Manager" subtitle="Control order and visibility of homepage sections" />

      <main className="flex-1 p-6 max-w-3xl">
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Homepage Sections</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {visibleCount} of {sections.length} visible · drag or use arrows to reorder
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/admin/sections/custom")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 text-sm font-semibold transition-all"
              >
                <Plus size={15} /> New Section
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : "Save Order"}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
            <LayoutList size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="text-white font-medium">Order:</span> drag rows or use ↑↓ to reorder sections on homepage + navbar.</p>
              <p><span className="text-white font-medium">Visibility:</span> eye icon shows/hides a section without deleting it.</p>
              <p><span className="text-white font-medium">Custom sections:</span> create unlimited new sections with the "New Section" button.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
            </div>
          ) : (
            <>
              {/* Reorderable list */}
              <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-3">
                <AnimatePresence>
                  {sections.map((section, index) => {
                    const isCustom = !SECTION_META[section.id];
                    const meta = SECTION_META[section.id] ?? { icon: "📄", description: "Custom section", adminHref: "" };
                    const cs = customSections.find(c => c.sectionId === section.id);

                    return (
                      <Reorder.Item key={section.id} value={section} className="cursor-grab active:cursor-grabbing">
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                            section.visible
                              ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                              : "bg-gray-900/40 border-gray-800/50 opacity-60"
                          }`}
                        >
                          <GripVertical size={18} className="text-gray-600 flex-shrink-0" />

                          <div className="w-6 h-6 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                          </div>

                          <span className="text-lg flex-shrink-0">{meta.icon}</span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-white">{section.label}</p>
                              {!section.visible && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 border border-gray-700 text-gray-500">Hidden</span>
                              )}
                              {section.id === "hero" && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">Required</span>
                              )}
                              {isCustom && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">Custom</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 truncate">{meta.description}</p>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => moveUp(index)}   disabled={index===0}                 className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed"><ChevronUp size={13} /></button>
                            <button onClick={() => moveDown(index)} disabled={index===sections.length-1} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed"><ChevronDown size={13} /></button>
                            <button onClick={() => toggleVisible(section.id)} disabled={section.id==="hero"}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${section.visible ? "text-indigo-400 hover:bg-indigo-500/10" : "text-gray-600 hover:text-gray-400 hover:bg-gray-800"} disabled:opacity-30 disabled:cursor-not-allowed`}>
                              {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                            {/* Edit — built-in: go to its admin page; custom: go to builder */}
                            {isCustom && cs ? (
                              <>
                                <button onClick={() => router.push(`/admin/sections/custom?edit=${cs._id}`)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={() => deleteCustomSection(cs)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                  <Trash2 size={13} />
                                </button>
                              </>
                            ) : (
                              <a href={meta.adminHref}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all text-xs font-bold">
                                ✎
                              </a>
                            )}
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    );
                  })}
                </AnimatePresence>
              </Reorder.Group>

              <p className="text-xs text-gray-600 text-center">
                Changes are not applied until you click <span className="text-indigo-400">Save Order</span>
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}

interface SectionConfig {
  id: string;
  label: string;
  order: number;
  visible: boolean;
}

const SECTION_META: Record<string, { icon: string; description: string; adminHref: string }> = {
  hero:       { icon: "🏠", description: "Main landing area — name, title, CTA buttons",      adminHref: "/admin/about" },
  about:      { icon: "👤", description: "Bio, stats, highlights and profile image",           adminHref: "/admin/about" },
  skills:     { icon: "⚡", description: "Tech stack, skill bars and tech badge icons",       adminHref: "/admin/skills" },
  projects:   { icon: "📁", description: "Portfolio projects with links and tags",             adminHref: "/admin/projects" },
  experience: { icon: "💼", description: "Work history and education timeline",                adminHref: "/admin/experience" },
  contact:    { icon: "📬", description: "Contact form, social links and location info",       adminHref: "/admin/contact" },
};

export default function SectionsAdminPage() {
  const toast = useToast();
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/section-settings");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSections(data.sort((a, b) => a.order - b.order));
      }
    } catch {
      toast.error("Load failed", "Could not fetch section settings.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Recompute order from current array position
      const payload = sections.map((s, i) => ({ ...s, order: i }));
      const res = await fetch("/api/section-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSections(payload);
      toast.success("Saved!", "Section order and visibility updated.");
    } catch {
      toast.error("Save failed", "Could not save section settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const visibleCount = sections.filter((s) => s.visible).length;

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <AdminTopbar
        title="Section Manager"
        subtitle="Control order and visibility of homepage sections"
      />

      <main className="flex-1 p-6 max-w-3xl">
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Homepage Sections</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {visibleCount} of {sections.length} sections visible ·{" "}
                drag or use arrows to reorder
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* Info card */}
          <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
            <LayoutList size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="text-white font-medium">Order:</span> use the ↑↓ arrows or drag rows to change the section order on your homepage and navbar.</p>
              <p><span className="text-white font-medium">Visibility:</span> toggle the eye icon to show or hide a section. Hidden sections are still editable in admin but won't appear on the site.</p>
              <p className="text-yellow-500/80">⚠ Hero section should always stay visible for the site to work properly.</p>
            </div>
          </div>

          {/* Section list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={sections}
              onReorder={setSections}
              className="space-y-3"
            >
              <AnimatePresence>
                {sections.map((section, index) => {
                  const meta = SECTION_META[section.id] ?? {
                    icon: "📄",
                    description: "",
                    adminHref: "/admin",
                  };

                  return (
                    <Reorder.Item
                      key={section.id}
                      value={section}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          section.visible
                            ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                            : "bg-gray-900/40 border-gray-800/50 opacity-60"
                        }`}
                      >
                        {/* Drag handle */}
                        <div className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0">
                          <GripVertical size={18} />
                        </div>

                        {/* Order badge */}
                        <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                        </div>

                        {/* Icon */}
                        <span className="text-xl flex-shrink-0">{meta.icon}</span>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">{section.label}</p>
                            {!section.visible && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 border border-gray-700 text-gray-500 font-medium">
                                Hidden
                              </span>
                            )}
                            {section.id === "hero" && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-medium">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 truncate">{meta.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Up */}
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ChevronUp size={14} />
                          </button>

                          {/* Down */}
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === sections.length - 1}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ChevronDown size={14} />
                          </button>

                          {/* Visibility */}
                          <button
                            onClick={() => toggleVisible(section.id)}
                            disabled={section.id === "hero"}
                            title={section.visible ? "Hide section" : "Show section"}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              section.visible
                                ? "text-indigo-400 hover:bg-indigo-500/10"
                                : "text-gray-600 hover:text-gray-400 hover:bg-gray-800"
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                          >
                            {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>

                          {/* Edit link */}
                          <a
                            href={meta.adminHref}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all text-xs font-bold"
                            title={`Edit ${section.label} content`}
                          >
                            ✎
                          </a>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          )}

          {/* Save reminder */}
          <p className="text-xs text-gray-600 text-center">
            Changes are not applied until you click <span className="text-indigo-400">Save Changes</span>
          </p>
        </div>
      </main>
    </>
  );
}
