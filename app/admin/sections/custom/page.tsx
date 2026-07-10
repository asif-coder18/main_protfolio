"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Plus, Trash2, Save, ChevronUp, ChevronDown, Edit2, X,
  Type, AlignLeft, Image as ImageIcon, MousePointerClick,
  LayoutGrid, Share2, Minus, Columns, Loader2, ArrowLeft,
} from "lucide-react";
import type { Block, BlockType, CustomSection } from "@/app/api/custom-sections/route";

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: "heading",   label: "Heading",      icon: <Type size={16} />,             desc: "H1, H2 or H3 title text" },
  { type: "paragraph", label: "Paragraph",    icon: <AlignLeft size={16} />,        desc: "Body text / description" },
  { type: "image",     label: "Image",        icon: <ImageIcon size={16} />,        desc: "Upload or URL image" },
  { type: "button",    label: "Button",       icon: <MousePointerClick size={16} />,desc: "CTA or link button" },
  { type: "card",      label: "Card",         icon: <LayoutGrid size={16} />,       desc: "Title + description card" },
  { type: "social",    label: "Social Link",  icon: <Share2 size={16} />,           desc: "GitHub, LinkedIn, etc." },
  { type: "divider",   label: "Divider",      icon: <Minus size={16} />,            desc: "Horizontal separator" },
  { type: "grid",      label: "Card Grid",    icon: <Columns size={16} />,          desc: "2 or 3 column card grid" },
];

function emptyBlock(type: BlockType): Block {
  const base: Block = { id: uid(), type };
  switch (type) {
    case "heading":   return { ...base, text: "Section Title", level: "h2", align: "center" };
    case "paragraph": return { ...base, text: "Write your content here.", align: "left" };
    case "image":     return { ...base, src: "", alt: "" };
    case "button":    return { ...base, label: "Click Here", href: "#", variant: "primary" };
    case "card":      return { ...base, title: "Card Title", description: "Card description.", icon: "✨", href: "" };
    case "social":    return { ...base, platform: "GitHub", username: "@username", url: "https://github.com" };
    case "divider":   return { ...base, style: "solid" };
    case "grid":      return { ...base, columns: 3, cards: [
      { id: uid(), type: "card", title: "Card 1", description: "Description", icon: "⭐" },
      { id: uid(), type: "card", title: "Card 2", description: "Description", icon: "🚀" },
      { id: uid(), type: "card", title: "Card 3", description: "Description", icon: "💡" },
    ]};
    default: return base;
  }
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5";
const ALIGN_OPTIONS = ["left", "center", "right"] as const;
const LEVEL_OPTIONS = ["h1", "h2", "h3"] as const;
const PLATFORM_OPTIONS = ["GitHub","LinkedIn","Twitter","X","YouTube","Instagram","Facebook","TikTok","Discord","Website","Email","Other"];

// ── Block Editor ─────────────────────────────────────────────────────────────
function BlockEditor({ block, onChange, onDelete, onUp, onDown, isFirst, isLast }: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onUp: () => void; onDown: () => void;
  isFirst: boolean; isLast: boolean;
}) {
  const set = (patch: Partial<Block>) => onChange({ ...block, ...patch });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Block header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-800/30">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
          {block.type}
        </span>
        <div className="flex-1" />
        <button onClick={onUp}   disabled={isFirst} className="p-1 text-gray-600 hover:text-white disabled:opacity-20 transition-colors"><ChevronUp size={14} /></button>
        <button onClick={onDown} disabled={isLast}  className="p-1 text-gray-600 hover:text-white disabled:opacity-20 transition-colors"><ChevronDown size={14} /></button>
        <button onClick={onDelete} className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
      </div>

      {/* Block fields */}
      <div className="p-4 space-y-3">

        {/* HEADING */}
        {block.type === "heading" && <>
          <div><label className={labelCls}>Text</label>
            <input className={inputCls} value={block.text ?? ""} onChange={e => set({ text: e.target.value })} placeholder="Section heading..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Level</label>
              <select className={inputCls} value={block.level ?? "h2"} onChange={e => set({ level: e.target.value as Block["level"] })}>
                {LEVEL_OPTIONS.map(l => <option key={l}>{l.toUpperCase()}</option>)}
              </select></div>
            <div><label className={labelCls}>Alignment</label>
              <select className={inputCls} value={block.align ?? "center"} onChange={e => set({ align: e.target.value as Block["align"] })}>
                {ALIGN_OPTIONS.map(a => <option key={a}>{a}</option>)}
              </select></div>
          </div>
        </>}

        {/* PARAGRAPH */}
        {block.type === "paragraph" && <>
          <div><label className={labelCls}>Text (HTML allowed)</label>
            <textarea rows={4} className={`${inputCls} resize-none`} value={block.text ?? ""} onChange={e => set({ text: e.target.value })} placeholder="Your paragraph text..." /></div>
          <div><label className={labelCls}>Alignment</label>
            <select className={inputCls} value={block.align ?? "left"} onChange={e => set({ align: e.target.value as Block["align"] })}>
              {ALIGN_OPTIONS.map(a => <option key={a}>{a}</option>)}
            </select></div>
        </>}

        {/* IMAGE */}
        {block.type === "image" && <>
          <ImageUpload label="Image" currentUrl={block.src} onUpload={url => set({ src: url })} />
          <div><label className={labelCls}>Alt Text</label>
            <input className={inputCls} value={block.alt ?? ""} onChange={e => set({ alt: e.target.value })} placeholder="Describe the image..." /></div>
        </>}

        {/* BUTTON */}
        {block.type === "button" && <>
          <div><label className={labelCls}>Label</label>
            <input className={inputCls} value={block.label ?? ""} onChange={e => set({ label: e.target.value })} placeholder="Button text" /></div>
          <div><label className={labelCls}>URL</label>
            <input className={inputCls} value={block.href ?? ""} onChange={e => set({ href: e.target.value })} placeholder="https://..." /></div>
          <div><label className={labelCls}>Style</label>
            <select className={inputCls} value={block.variant ?? "primary"} onChange={e => set({ variant: e.target.value as Block["variant"] })}>
              <option value="primary">Primary (filled)</option>
              <option value="outline">Outline</option>
            </select></div>
        </>}

        {/* CARD */}
        {block.type === "card" && <>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Emoji Icon</label>
              <input className={inputCls} value={block.icon ?? ""} onChange={e => set({ icon: e.target.value })} placeholder="✨" /></div>
            <div><label className={labelCls}>Title</label>
              <input className={inputCls} value={block.title ?? ""} onChange={e => set({ title: e.target.value })} placeholder="Card title" /></div>
          </div>
          <div><label className={labelCls}>Description</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={block.description ?? ""} onChange={e => set({ description: e.target.value })} placeholder="Card description..." /></div>
          <ImageUpload label="Card Image (optional)" currentUrl={block.imageUrl} onUpload={url => set({ imageUrl: url })} />
          <div><label className={labelCls}>Link URL (optional)</label>
            <input className={inputCls} value={block.href ?? ""} onChange={e => set({ href: e.target.value })} placeholder="https://..." /></div>
        </>}

        {/* SOCIAL */}
        {block.type === "social" && <>
          <div><label className={labelCls}>Platform</label>
            <select className={inputCls} value={block.platform ?? "GitHub"} onChange={e => set({ platform: e.target.value })}>
              {PLATFORM_OPTIONS.map(p => <option key={p}>{p}</option>)}
            </select></div>
          <div><label className={labelCls}>Username / Handle</label>
            <input className={inputCls} value={block.username ?? ""} onChange={e => set({ username: e.target.value })} placeholder="@username" /></div>
          <div><label className={labelCls}>Profile URL</label>
            <input className={inputCls} value={block.url ?? ""} onChange={e => set({ url: e.target.value })} placeholder="https://github.com/..." /></div>
        </>}

        {/* DIVIDER */}
        {block.type === "divider" && <>
          <div><label className={labelCls}>Line Style</label>
            <select className={inputCls} value={block.style ?? "solid"} onChange={e => set({ style: e.target.value as Block["style"] })}>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select></div>
        </>}

        {/* GRID */}
        {block.type === "grid" && <>
          <div><label className={labelCls}>Columns</label>
            <select className={inputCls} value={String(block.columns ?? 3)} onChange={e => set({ columns: Number(e.target.value) as 2|3 })}>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
            </select></div>
          <div className="space-y-3">
            <label className={labelCls}>Cards in Grid</label>
            {(block.cards ?? []).map((card, ci) => (
              <div key={card.id ?? ci} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Card {ci + 1}</span>
                  <button onClick={() => set({ cards: (block.cards ?? []).filter((_, i) => i !== ci) })}
                    className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputCls} value={card.icon ?? ""} onChange={e => {
                    const cards = [...(block.cards ?? [])]; cards[ci] = { ...cards[ci], icon: e.target.value }; set({ cards });
                  }} placeholder="Emoji icon" />
                  <input className={inputCls} value={card.title ?? ""} onChange={e => {
                    const cards = [...(block.cards ?? [])]; cards[ci] = { ...cards[ci], title: e.target.value }; set({ cards });
                  }} placeholder="Card title" />
                </div>
                <input className={inputCls} value={card.description ?? ""} onChange={e => {
                  const cards = [...(block.cards ?? [])]; cards[ci] = { ...cards[ci], description: e.target.value }; set({ cards });
                }} placeholder="Card description" />
                <input className={inputCls} value={card.href ?? ""} onChange={e => {
                  const cards = [...(block.cards ?? [])]; cards[ci] = { ...cards[ci], href: e.target.value }; set({ cards });
                }} placeholder="Link URL (optional)" />
              </div>
            ))}
            <button onClick={() => set({ cards: [...(block.cards ?? []), { id: uid(), type: "card", title: "", description: "", icon: "✨" }] })}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              <Plus size={12} /> Add Card
            </button>
          </div>
        </>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomSectionBuilderPage() {
  const router = useRouter();
  const toast = useToast();

  const [label, setLabel] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for ?edit=<id> param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("edit");
    if (!id) return;
    setLoading(true);
    setEditingId(id);
    fetch(`/api/custom-sections/${id}`)
      .then(r => r.json())
      .then((data: CustomSection) => {
        setLabel(data.label);
        setSectionId(data.sectionId);
        setBgColor(data.bgColor ?? "");
        setBlocks(data.blocks ?? []);
      })
      .catch(() => toast.error("Load failed", "Could not load section."))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // Auto-generate sectionId from label
  const handleLabelChange = (v: string) => {
    setLabel(v);
    if (!editingId) {
      setSectionId(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const addBlock = (type: BlockType) => setBlocks(p => [...p, emptyBlock(type)]);

  const updateBlock = (i: number, b: Block) =>
    setBlocks(p => { const n = [...p]; n[i] = b; return n; });

  const deleteBlock = (i: number) => setBlocks(p => p.filter((_, idx) => idx !== i));

  const moveBlock = (i: number, dir: -1 | 1) => setBlocks(p => {
    const n = [...p];
    [n[i], n[i + dir]] = [n[i + dir], n[i]];
    return n;
  });

  const handleSave = async () => {
    if (!label.trim()) { toast.error("Name required", "Give this section a name."); return; }
    if (blocks.length === 0) { toast.error("Add blocks", "Add at least one content block."); return; }

    setSaving(true);
    try {
      const payload: Partial<CustomSection> = { label, sectionId, bgColor, blocks, visible: true, order: 99 };

      if (editingId) {
        // Update existing
        const res = await fetch(`/api/custom-sections/${editingId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Updated!", "Section saved.");
      } else {
        // Create new + add to section-settings
        const res = await fetch("/api/custom-sections", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();

        // Also register in section-settings so it appears on homepage
        const settingsRes = await fetch("/api/section-settings");
        const current = await settingsRes.json();
        const maxOrder = (current as { order: number }[]).reduce((m, s) => Math.max(m, s.order), 0);
        await fetch("/api/section-settings", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            ...current,
            { id: sectionId, label, order: maxOrder + 1, visible: true },
          ]),
        });

        toast.success("Created!", "New section added to your homepage.");
      }

      router.push("/admin/sections");
    } catch {
      toast.error("Save failed", "Could not save section.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <AdminTopbar title="Section Builder" subtitle="Loading..." />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-indigo-400" />
      </div>
    </>
  );

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <AdminTopbar
        title={editingId ? "Edit Section" : "New Section"}
        subtitle="Build your custom homepage section with content blocks"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Back */}
          <button onClick={() => router.push("/admin/sections")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to Section Manager
          </button>

          {/* Section meta */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Section Info</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Section Name <span className="text-red-400">*</span></label>
                <input className={inputCls} value={label} onChange={e => handleLabelChange(e.target.value)} placeholder="e.g. Certifications" />
              </div>
              <div>
                <label className={labelCls}>Section ID (auto)</label>
                <input className={inputCls} value={sectionId} onChange={e => setSectionId(e.target.value)}
                  placeholder="certifications" readOnly={!!editingId}
                  style={{ opacity: editingId ? 0.5 : 1 }} />
                <p className="text-[10px] text-gray-600 mt-1">Used as the URL anchor: <code className="text-indigo-400">#{sectionId}</code></p>
              </div>
            </div>
            <div>
              <label className={labelCls}>Background Color (Tailwind class or hex, optional)</label>
              <input className={inputCls} value={bgColor} onChange={e => setBgColor(e.target.value)}
                placeholder="bg-gray-900 or #1a1a2e" />
              <p className="text-[10px] text-gray-600 mt-1">Leave empty to use default site background</p>
            </div>
          </div>

          {/* Block list */}
          <div className="space-y-4">
            {blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-2xl text-gray-600">
                <Columns size={32} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">No blocks yet</p>
                <p className="text-xs mt-1">Add blocks from the panel below</p>
              </div>
            )}
            {blocks.map((block, i) => (
              <BlockEditor
                key={block.id ?? i}
                block={block}
                onChange={b => updateBlock(i, b)}
                onDelete={() => deleteBlock(i)}
                onUp={() => moveBlock(i, -1)}
                onDown={() => moveBlock(i, 1)}
                isFirst={i === 0}
                isLast={i === blocks.length - 1}
              />
            ))}
          </div>

          {/* Add block palette */}
          <div className="bg-gray-900 border border-indigo-500/20 rounded-2xl p-6">
            <p className="text-sm font-semibold text-white mb-4">Add Content Block</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BLOCK_TYPES.map(bt => (
                <button key={bt.type} onClick={() => addBlock(bt.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 bg-gray-800/30 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-gray-400 hover:text-indigo-300 transition-all group">
                  <span className="text-indigo-500 group-hover:text-indigo-400 transition-colors">{bt.icon}</span>
                  <span className="text-xs font-semibold">{bt.label}</span>
                  <span className="text-[10px] text-gray-600 text-center leading-tight">{bt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pb-8">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving…" : editingId ? "Update Section" : "Create Section"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
