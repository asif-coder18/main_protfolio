"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Save, Plus, Trash2, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from "lucide-react";
import { Icon } from "@iconify/react";

interface AboutData {
  name: string;
  greeting: string;
  title: string;
  subtitle: string;
  location: string;
  bio: string[];
  tagline: string;
  profileImage: string;
  profileImage2: string;
  availableForWork: boolean;
  resumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  emailAddress: string;
  floatingBadge1: string;
  floatingBadge2: string;
  statusBadge: string;
  stats: { icon: string; number: string; suffix: string; label: string }[];
  highlights: { icon: string; title: string; desc: string }[];
}

const defaultData: AboutData = {
  name: "Asiful Maula Abir",
  greeting: "Hi there, I'm",
  title: "Frontend Developer",
  subtitle: "Next.js Specialist",
  location: "Savar, Dhaka, Bangladesh",
  bio: [
    "Hey! I'm Asiful Maula Abir, a frontend developer with a deep passion for building exceptional web experiences.",
    "I build fast, responsive, and user-friendly web applications.",
    "When I'm not coding, you'll find me exploring new technologies.",
  ],
  tagline: "I build fast, responsive, and user-friendly web applications.",
  profileImage: "/profile.jpg",
  profileImage2: "/profile1.jpg",
  availableForWork: true,
  resumeUrl: "",
  githubUrl: "https://github.com/asif-coder18",
  linkedinUrl: "https://www.linkedin.com/feed/",
  emailAddress: "maulaasiful@gmail.com",
  floatingBadge1: "Next.js Dev",
  floatingBadge2: "Clean UI",
  statusBadge: "Open to opportunities",
  stats: [
    { icon: "lucide:code-2", number: "50", suffix: "+", label: "Projects Built" },
    { icon: "lucide:coffee", number: "3", suffix: "+", label: "Years Experience" },
    { icon: "lucide:users", number: "20", suffix: "+", label: "Happy Clients" },
    { icon: "lucide:globe", number: "10", suffix: "+", label: "Countries Reached" },
  ],
  highlights: [
    { icon: "lucide:zap", title: "Performance First", desc: "I optimize every byte for lightning-fast load times." },
    { icon: "lucide:code-2", title: "Clean Code", desc: "Readable, maintainable, and well-documented code." },
    { icon: "lucide:award", title: "Best Practices", desc: "Accessibility, SEO, and security are built in." },
  ],
};

const PRESET_ICONS = [
  { id: "lucide:zap", label: "Lightning / Fast" },
  { id: "lucide:code-2", label: "Code / Dev" },
  { id: "lucide:award", label: "Award / Quality" },
  { id: "lucide:coffee", label: "Coffee / Experience" },
  { id: "lucide:users", label: "Users / Clients" },
  { id: "lucide:globe", label: "Globe / Worldwide" },
  { id: "lucide:briefcase", label: "Briefcase / Work" },
  { id: "lucide:cpu", label: "CPU / Tech" },
  { id: "lucide:layers", label: "Layers / Design" },
  { id: "lucide:shield-check", label: "Shield / Security" },
  { id: "lucide:terminal", label: "Terminal / CLI" },
  { id: "lucide:heart", label: "Heart / Passion" },
  { id: "lucide:star", label: "Star / Featured" },
  { id: "lucide:book-open", label: "Book / Learning" },
  { id: "lucide:rocket", label: "Rocket / Launch" },
];

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition-all";
const selectCls = "w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-indigo-500/60 transition-all cursor-pointer hover:bg-gray-700 font-medium";
const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

export default function AboutAdminPage() {
  const toast = useToast();
  const [data, setData] = useState<AboutData>(defaultData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/about");
      const json = await res.json();
      if (json && json.name) setData({ ...defaultData, ...json });
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: keyof AboutData, value: AboutData[keyof AboutData]) =>
    setData((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Saved!", "About section updated successfully.");
    } catch {
      toast.error("Save failed", "Could not update the about section.");
    } finally {
      setSaving(false);
    }
  };

  const updateBio = (i: number, v: string) =>
    setData((p) => { const b = [...p.bio]; b[i] = v; return { ...p, bio: b }; });
  const addBio = () => setData((p) => ({ ...p, bio: [...p.bio, ""] }));
  const removeBio = (i: number) =>
    setData((p) => ({ ...p, bio: p.bio.filter((_, idx) => idx !== i) }));

  // Stats helpers
  const updateStat = (i: number, key: keyof AboutData["stats"][0], v: string) =>
    setData((p) => { const s = [...p.stats]; s[i] = { ...s[i], [key]: v }; return { ...p, stats: s }; });
  const addStat = () => setData((p) => ({ ...p, stats: [...p.stats, { icon: "lucide:zap", number: "0", suffix: "+", label: "New Stat" }] }));
  const removeStat = (i: number) => setData((p) => ({ ...p, stats: p.stats.filter((_, idx) => idx !== i) }));
  const moveStat = (i: number, dir: number) => {
    if (i + dir < 0 || i + dir >= data.stats.length) return;
    setData(p => {
      const s = [...p.stats];
      [s[i], s[i + dir]] = [s[i + dir], s[i]];
      return { ...p, stats: s };
    });
  };

  // Highlight helpers
  const updateHighlight = (i: number, key: keyof AboutData["highlights"][0], v: string) =>
    setData((p) => { const h = [...p.highlights]; h[i] = { ...h[i], [key]: v }; return { ...p, highlights: h }; });
  const addHighlight = () => setData((p) => ({ ...p, highlights: [...p.highlights, { icon: "lucide:zap", title: "New Feature", desc: "Description here" }] }));
  const removeHighlight = (i: number) => setData((p) => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }));
  const moveHighlight = (i: number, dir: number) => {
    if (i + dir < 0 || i + dir >= data.highlights.length) return;
    setData(p => {
      const h = [...p.highlights];
      [h[i], h[i + dir]] = [h[i + dir], h[i]];
      return { ...p, highlights: h };
    });
  };

  if (loading) return (
    <>
      <AdminTopbar title="About / Hero" subtitle="Manage your hero & about section content" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    </>
  );

  return (
    <>
      <AdminTopbar title="About / Hero" subtitle="Manage your hero & about section content" />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <main className="flex-1 p-6 max-w-4xl">
        <div className="space-y-6">

          {/* Basic Info */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Full Name</label>
                <input className={inputCls} value={data.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div><label className={labelCls}>Greeting Text</label>
                <input className={inputCls} value={data.greeting} onChange={(e) => set("greeting", e.target.value)} /></div>
              <div><label className={labelCls}>Title (e.g. Frontend Developer)</label>
                <input className={inputCls} value={data.title} onChange={(e) => set("title", e.target.value)} /></div>
              <div><label className={labelCls}>Subtitle (e.g. Next.js Specialist)</label>
                <input className={inputCls} value={data.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Location</label>
                <input className={inputCls} value={data.location} onChange={(e) => set("location", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className={labelCls}>Tagline (shown in hero)</label>
                <input className={inputCls} value={data.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
            </div>

            {/* Available toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-700 bg-gray-800/30">
              <div>
                <p className="text-sm font-medium text-white">Available for Freelance Work</p>
                <p className="text-xs text-gray-500">Shows the availability badge on hero</p>
              </div>
              <button type="button" onClick={() => set("availableForWork", !data.availableForWork)}
                className={`transition-colors ${data.availableForWork ? "text-green-400" : "text-gray-600"}`}>
                {data.availableForWork ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>
          </section>

          {/* Bio */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Bio Paragraphs</h2>
            <div className="space-y-2">
              {data.bio.map((para, i) => (
                <div key={i} className="flex gap-2">
                  <textarea rows={2} className={`${inputCls} resize-none flex-1`} value={para}
                    onChange={(e) => updateBio(i, e.target.value)} placeholder={`Paragraph ${i + 1}`} />
                  <button onClick={() => removeBio(i)}
                    className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 mt-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={addBio}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-2">
                <Plus size={14} /> Add Paragraph
              </button>
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Social & Contact Links</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>GitHub URL</label>
                <input className={inputCls} value={data.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} /></div>
              <div><label className={labelCls}>LinkedIn URL</label>
                <input className={inputCls} value={data.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} /></div>
              <div><label className={labelCls}>Email Address</label>
                <input className={inputCls} value={data.emailAddress} onChange={(e) => set("emailAddress", e.target.value)} /></div>
              <div><label className={labelCls}>Resume / CV URL</label>
                <input className={inputCls} value={data.resumeUrl} onChange={(e) => set("resumeUrl", e.target.value)} placeholder="https://..." /></div>
            </div>
          </section>
          {/* Stats */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Professional Stats</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.stats.map((stat, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-800 bg-gray-800/20 space-y-3 relative group">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => moveStat(i, -1)} disabled={i === 0} className="p-1 text-gray-600 hover:text-white disabled:opacity-20"><ArrowUp size={12} /></button>
                    <button onClick={() => moveStat(i, 1)} disabled={i === data.stats.length - 1} className="p-1 text-gray-600 hover:text-white disabled:opacity-20"><ArrowDown size={12} /></button>
                    <button onClick={() => removeStat(i)} className="p-1 text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <Icon icon={stat.icon} className="text-xl text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <label className={labelCls}>Choose Icon</label>
                      <select className={selectCls} value={stat.icon} onChange={(e) => updateStat(i, "icon", e.target.value)}>
                        {PRESET_ICONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className={labelCls}>Number (e.g. 50)</label>
                      <input className={inputCls} value={stat.number} onChange={(e) => updateStat(i, "number", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Suffix (+)</label>
                      <input className={inputCls} value={stat.suffix} onChange={(e) => updateStat(i, "suffix", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Label (e.g. Projects Built)</label>
                    <input className={inputCls} value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addStat} className="h-full min-h-[160px] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-800 hover:border-indigo-500/50 text-gray-600 hover:text-indigo-400 transition-all">
                <Plus size={24} /> <span className="text-xs font-bold uppercase tracking-wider">Add Stat</span>
              </button>
            </div>
          </section>

          {/* Highlights */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Performance Highlights</h2>
            <div className="space-y-4">
              {data.highlights.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-800 bg-gray-800/20 space-y-3 relative group">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => moveHighlight(i, -1)} disabled={i === 0} className="p-1 text-gray-600 hover:text-white disabled:opacity-20"><ArrowUp size={12} /></button>
                    <button onClick={() => moveHighlight(i, 1)} disabled={i === data.highlights.length - 1} className="p-1 text-gray-600 hover:text-white disabled:opacity-20"><ArrowDown size={12} /></button>
                    <button onClick={() => removeHighlight(i)} className="p-1 text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <Icon icon={item.icon} className="text-xl text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <label className={labelCls}>Choose Icon</label>
                      <select className={selectCls} value={item.icon} onChange={(e) => updateHighlight(i, "icon", e.target.value)}>
                        {PRESET_ICONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex-1">
                      <label className={labelCls}>Title</label>
                      <input className={inputCls} value={item.title} onChange={(e) => updateHighlight(i, "title", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea rows={2} className={`${inputCls} resize-none`} value={item.desc} onChange={(e) => updateHighlight(i, "desc", e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addHighlight} className="w-full py-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-800 hover:border-indigo-500/50 text-gray-600 hover:text-indigo-400 transition-all">
                <Plus size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Add Highlight</span>
              </button>
            </div>
          </section>

          {/* Floating Badges */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Hero Floating Badges</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>Badge Top Right</label>
                <input className={inputCls} value={data.floatingBadge1} onChange={(e) => set("floatingBadge1", e.target.value)} /></div>
              <div><label className={labelCls}>Badge Bottom Left</label>
                <input className={inputCls} value={data.floatingBadge2} onChange={(e) => set("floatingBadge2", e.target.value)} /></div>
              <div><label className={labelCls}>Status Badge (below photo)</label>
                <input className={inputCls} value={data.statusBadge} onChange={(e) => set("statusBadge", e.target.value)} /></div>
            </div>
          </section>

          {/* Images */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Profile Images</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <ImageUpload label="Hero Profile Image" currentUrl={data.profileImage}
                onUpload={(url) => set("profileImage", url)} />
              <ImageUpload label="About Section Image" currentUrl={data.profileImage2}
                onUpload={(url) => set("profileImage2", url)} />
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end pb-6">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/25">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
