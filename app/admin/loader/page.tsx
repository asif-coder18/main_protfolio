"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import {
  Plus, Trash2, Edit2, X, Save, Eye, EyeOff,
  CheckCircle, Loader2, Layers, Zap, Monitor, Pipette,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker, HexColorInput } from "react-colorful";

// ── Types ─────────────────────────────────────────────────────────────────────
interface LoaderSettings {
  _id?: string;
  name: string;
  title: string;
  subtitle: string;
  subtitleColor: string;
  subtitleSize: string;
  subtitleWeight: string;
  imageUrl: string;
  loaderType: string;
  progressColor: string;
  bgGradient: string;
  backgroundStyle: string;
  imageShape: string;
  imageSize: number;
  duration: number;
  showProgressBar: boolean;
  showPercentage: boolean;
  allowSkip: boolean;
  customCss: string;
  template: string;
  isActive: boolean;
  order: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const LOADER_TYPES = [
  { value: "progress-bar", label: "Progress Bar" },
  { value: "pulse", label: "Pulse" },
  { value: "spinner", label: "Spinner" },
  { value: "dots", label: "Dots" },
  { value: "percentage", label: "Percentage" },
];

const IMAGE_SHAPES = [
  { value: "rounded-2xl", label: "Rounded Square" },
  { value: "rounded-full", label: "Circle" },
  { value: "rounded-none", label: "Square" },
  { value: "rounded-3xl", label: "Extra Rounded" },
];

const TEMPLATES = [
  { value: "default", label: "Default", desc: "Clean dark with gradient" },
  { value: "minimal", label: "Minimal", desc: "Simple, no frills" },
  { value: "glassmorphism", label: "Glassmorphism", desc: "Frosted glass effect" },
  { value: "neon", label: "Neon", desc: "Glowing neon accents" },
];

const PRESET_COLORS = [
  "#8b5cf6", "#6366f1", "#ec4899", "#14b8a6",
  "#f59e0b", "#10b981", "#ef4444", "#3b82f6",
  "#ffffff", "#a855f7",
];

const emptyLoader = (): LoaderSettings => ({
  name: "My Loader",
  title: "Asiful Maula Abir",
  subtitle: "Frontend Developer",
  subtitleColor: "#9ca3af",
  subtitleSize: "sm",
  subtitleWeight: "normal",
  imageUrl: "/profile.jpg",
  loaderType: "progress-bar",
  progressColor: "#8b5cf6",
  bgGradient: "",
  backgroundStyle: "none",
  imageShape: "rounded-2xl",
  imageSize: 120,
  duration: 2000,
  showProgressBar: true,
  showPercentage: false,
  allowSkip: false,
  customCss: "",
  template: "default",
  isActive: false,
  order: 0,
});

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all";
const labelCls =
  "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

// Convert a raw CSS string like "background:#000;color:red;" into a React
// CSSProperties object. Handles camelCase conversion automatically.
function parseCssString(css: string): React.CSSProperties {
  if (!css) return {};
  return css
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce<React.CSSProperties>((acc, decl) => {
      const colon = decl.indexOf(":");
      if (colon === -1) return acc;
      const prop = decl.slice(0, colon).trim();
      const val  = decl.slice(colon + 1).trim();
      // Convert kebab-case → camelCase
      const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      return { ...acc, [camel]: val };
    }, {});
}

// ── Background Style Presets ──────────────────────────────────────────────────
const BACKGROUND_STYLES = [
  {
    id: "none",
    label: "None",
    desc: "Template default",
    css: "",
    preview: "#111111",
  },
  {
    id: "solid-black",
    label: "Solid Black",
    desc: "Pure black",
    css: "background:#000000;",
    preview: "#000000",
  },
  {
    id: "dark-purple",
    label: "Dark Purple",
    desc: "Deep violet dark",
    css: "background:radial-gradient(ellipse 80% 70% at 50% 30%,#1a0a2e 0%,#0a0014 60%,#000 100%);",
    preview: "radial-gradient(ellipse at center,#1a0a2e 0%,#000 100%)",
  },
  {
    id: "neon-blue",
    label: "Neon Blue",
    desc: "Electric blue glow",
    css: "background:radial-gradient(ellipse 80% 70% at 50% 30%,#0d2b6b 0%,#020818 60%,#000 100%);",
    preview: "radial-gradient(ellipse at center,#0d2b6b 0%,#000 100%)",
  },
  {
    id: "glass-effect",
    label: "Glass Effect",
    desc: "Frosted dark glass",
    css: "background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.06);",
    preview: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
  },
  {
    id: "gradient-purple",
    label: "Gradient Purple",
    desc: "Purple to black",
    css: "background:linear-gradient(160deg,#2d1b69 0%,#11094a 40%,#000 100%);",
    preview: "linear-gradient(160deg,#2d1b69 0%,#000 100%)",
  },
  {
    id: "gradient-pink",
    label: "Gradient Pink",
    desc: "Pink to dark",
    css: "background:linear-gradient(160deg,#4a0a2e 0%,#1a0010 50%,#000 100%);",
    preview: "linear-gradient(160deg,#4a0a2e 0%,#000 100%)",
  },
  {
    id: "cyber-green",
    label: "Cyber Green",
    desc: "Matrix green glow",
    css: "background:radial-gradient(ellipse 80% 70% at 50% 30%,#003d1f 0%,#000e08 60%,#000 100%);",
    preview: "radial-gradient(ellipse at center,#003d1f 0%,#000 100%)",
  },
  {
    id: "midnight-dark",
    label: "Midnight Dark",
    desc: "Deep navy black",
    css: "background:linear-gradient(180deg,#0a0a1a 0%,#050510 50%,#000 100%);",
    preview: "linear-gradient(180deg,#0a0a1a 0%,#000 100%)",
  },
  {
    id: "ocean-blue",
    label: "Ocean Blue",
    desc: "Deep ocean tones",
    css: "background:radial-gradient(ellipse 80% 70% at 50% 30%,#0a2a4a 0%,#020d1a 60%,#000 100%);",
    preview: "radial-gradient(ellipse at center,#0a2a4a 0%,#000 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    desc: "Warm amber dark",
    css: "background:linear-gradient(160deg,#3d1500 0%,#1a0800 50%,#000 100%);",
    preview: "linear-gradient(160deg,#3d1500 0%,#000 100%)",
  },
  {
    id: "aurora",
    label: "Aurora",
    desc: "Northern lights",
    css: "background:radial-gradient(ellipse 100% 80% at 50% 20%,#0d3b2e 0%,#1a0a2e 50%,#000 100%);",
    preview: "radial-gradient(ellipse at center,#0d3b2e 0%,#1a0a2e 50%,#000 100%)",
  },
] as const;

type BackgroundStyleId = typeof BACKGROUND_STYLES[number]["id"];

// Resolve a stored backgroundStyle id → CSS string
function resolveBackgroundCss(id: string): string {
  return BACKGROUND_STYLES.find((s) => s.id === id)?.css ?? "";
}

// ── Background Style Picker ───────────────────────────────────────────────────
function BackgroundStylePicker({
  value,
  onChange,
}: {
  value: string;           // backgroundStyle id
  onChange: (id: string, css: string) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Current badge */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0"
          style={{
            background:
              BACKGROUND_STYLES.find((s) => s.id === value)?.preview ?? "#111",
          }}
        />
        <span className="text-xs text-gray-400 font-medium">
          {BACKGROUND_STYLES.find((s) => s.id === value)?.label ?? "None"}
        </span>
        <span className="text-xs text-gray-600">
          — {BACKGROUND_STYLES.find((s) => s.id === value)?.desc ?? ""}
        </span>
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-3 gap-2">
        {BACKGROUND_STYLES.map((style) => {
          const isActive = value === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id, style.css)}
              className={`relative h-16 rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.03] focus:outline-none ${
                isActive
                  ? "border-indigo-400 shadow-lg shadow-indigo-500/20"
                  : "border-gray-700 hover:border-gray-500"
              }`}
              style={{ background: style.preview }}
            >
              <span className="absolute bottom-0 inset-x-0 px-1 py-1 text-[10px] font-medium text-white/80 bg-black/50 text-center leading-tight truncate">
                {style.label}
              </span>
              {isActive && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-400 flex items-center justify-center">
                  <CheckCircle size={9} className="text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Gradient Presets ──────────────────────────────────────────────────────────
const GRADIENT_PRESETS = [
  {
    id: "purple-dark",
    label: "Purple Dark",
    css: "radial-gradient(ellipse 80% 70% at 50% 30%, #2d1b69 0%, #0f0a1e 60%, #000000 100%)",
    preview: "linear-gradient(135deg, #2d1b69 0%, #0f0a1e 60%, #000 100%)",
  },
  {
    id: "neon-blue",
    label: "Neon Blue",
    css: "radial-gradient(ellipse 80% 70% at 50% 30%, #0d2b6b 0%, #050d1f 60%, #000000 100%)",
    preview: "linear-gradient(135deg, #0d2b6b 0%, #050d1f 60%, #000 100%)",
  },
  {
    id: "pink-glow",
    label: "Pink Glow",
    css: "radial-gradient(ellipse 80% 70% at 50% 30%, #5c0a3a 0%, #1a0010 60%, #000000 100%)",
    preview: "linear-gradient(135deg, #5c0a3a 0%, #1a0010 60%, #000 100%)",
  },
  {
    id: "green-cyber",
    label: "Green Cyber",
    css: "radial-gradient(ellipse 80% 70% at 50% 30%, #003d1f 0%, #000e08 60%, #000000 100%)",
    preview: "linear-gradient(135deg, #003d1f 0%, #000e08 60%, #000 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    css: "radial-gradient(ellipse 80% 70% at 50% 30%, #0a2a4a 0%, #020d1a 60%, #000000 100%)",
    preview: "linear-gradient(135deg, #0a2a4a 0%, #020d1a 60%, #000 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    css: "radial-gradient(ellipse 80% 70% at 50% 30%, #4a1a00 0%, #1a0800 60%, #000000 100%)",
    preview: "linear-gradient(135deg, #4a1a00 0%, #1a0800 60%, #000 100%)",
  },
  {
    id: "glass-purple",
    label: "Glass Purple",
    css: "linear-gradient(160deg, #1a0a2e 0%, #0d0618 50%, #1a0a2e 100%)",
    preview: "linear-gradient(160deg, #1a0a2e 0%, #0d0618 50%, #1a0a2e 100%)",
  },
  {
    id: "midnight",
    label: "Midnight",
    css: "linear-gradient(180deg, #0a0a0f 0%, #111128 50%, #0a0a0f 100%)",
    preview: "linear-gradient(180deg, #0a0a0f 0%, #111128 50%, #0a0a0f 100%)",
  },
  {
    id: "aurora",
    label: "Aurora",
    css: "radial-gradient(ellipse 100% 80% at 50% 20%, #0d3b2e 0%, #1a0a2e 50%, #000000 100%)",
    preview: "linear-gradient(135deg, #0d3b2e 0%, #1a0a2e 50%, #000 100%)",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    css: "radial-gradient(ellipse 80% 70% at 50% 30%, #2a0a3e 0%, #0a001a 40%, #001a1a 100%)",
    preview: "linear-gradient(135deg, #2a0a3e 0%, #0a001a 40%, #001a1a 100%)",
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    css: "radial-gradient(ellipse 80% 70% at 50% 30%, #3d1a1a 0%, #1a0a0a 60%, #000000 100%)",
    preview: "linear-gradient(135deg, #3d1a1a 0%, #1a0a0a 60%, #000 100%)",
  },
  {
    id: "deep-space",
    label: "Deep Space",
    css: "radial-gradient(ellipse 60% 50% at 50% 40%, #0a0a2e 0%, #000000 70%)",
    preview: "linear-gradient(135deg, #0a0a2e 0%, #000 70%)",
  },
] as const;

type GradientId = typeof GRADIENT_PRESETS[number]["id"] | "custom" | "none";

// Resolve a stored bgGradient CSS string back to a preset id (or "custom"/"none")
function resolveGradientId(css: string): GradientId {
  if (!css) return "none";
  const match = GRADIENT_PRESETS.find((p) => p.css === css);
  return match ? match.id : "custom";
}

// ── Gradient Picker Component ─────────────────────────────────────────────────
function GradientPicker({
  value,
  onChange,
}: {
  value: string;          // raw CSS stored in bgGradient
  onChange: (css: string) => void;
}) {
  const activeId = resolveGradientId(value);

  // Custom builder state — only shown when "custom" tab is active
  const [showCustom, setShowCustom] = useState(false);
  const [fromColor, setFromColor] = useState("#1a0533");
  const [toColor, setToColor] = useState("#000000");
  const [direction, setDirection] = useState("135deg");

  const DIRECTIONS = [
    { label: "↗ Diagonal", value: "135deg" },
    { label: "↓ Down", value: "180deg" },
    { label: "→ Right", value: "90deg" },
    { label: "↙ Radial", value: "radial" },
  ];

  const applyCustom = () => {
    const css =
      direction === "radial"
        ? `radial-gradient(ellipse 80% 70% at 50% 30%, ${fromColor} 0%, ${toColor} 100%)`
        : `linear-gradient(${direction}, ${fromColor} 0%, ${toColor} 100%)`;
    onChange(css);
  };

  // Keep custom preview in sync
  const customPreviewCss =
    direction === "radial"
      ? `radial-gradient(ellipse 80% 70% at 50% 30%, ${fromColor} 0%, ${toColor} 100%)`
      : `linear-gradient(${direction}, ${fromColor} 0%, ${toColor} 100%)`;

  return (
    <div className="space-y-3">
      {/* Current selection badge */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0"
          style={{
            background: value || "#111",
          }}
        />
        <span className="text-xs text-gray-400 font-medium">
          {activeId === "none"
            ? "Template default"
            : activeId === "custom"
            ? "Custom gradient"
            : GRADIENT_PRESETS.find((p) => p.id === activeId)?.label ?? ""}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-auto text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <X size={11} /> Reset
          </button>
        )}
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* "None" card */}
        <button
          type="button"
          onClick={() => onChange("")}
          className={`relative h-16 rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.03] ${
            activeId === "none"
              ? "border-indigo-400 shadow-lg shadow-indigo-500/20"
              : "border-gray-700 hover:border-gray-500"
          }`}
          style={{ background: "#111" }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-medium">
            Default
          </span>
          {activeId === "none" && (
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-indigo-400 flex items-center justify-center">
              <CheckCircle size={8} className="text-white" />
            </span>
          )}
        </button>

        {/* Preset cards */}
        {GRADIENT_PRESETS.map((preset) => {
          const isActive = activeId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => { onChange(preset.css); setShowCustom(false); }}
              className={`relative h-16 rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.03] ${
                isActive
                  ? "border-indigo-400 shadow-lg shadow-indigo-500/20"
                  : "border-gray-700 hover:border-gray-500"
              }`}
              style={{ background: preset.preview }}
            >
              <span className="absolute bottom-0 inset-x-0 px-1.5 py-1 text-[10px] font-medium text-white/80 bg-black/40 text-center leading-tight">
                {preset.label}
              </span>
              {isActive && (
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-indigo-400 flex items-center justify-center">
                  <CheckCircle size={8} className="text-white" />
                </span>
              )}
            </button>
          );
        })}

        {/* Custom builder card */}
        <button
          type="button"
          onClick={() => setShowCustom((s) => !s)}
          className={`relative h-16 rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.03] ${
            showCustom || activeId === "custom"
              ? "border-indigo-400 shadow-lg shadow-indigo-500/20"
              : "border-dashed border-gray-600 hover:border-gray-400"
          }`}
          style={{
            background:
              activeId === "custom" ? value : customPreviewCss,
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white/90 bg-black/30">
            + Custom
          </span>
        </button>
      </div>

      {/* Custom builder panel */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Custom Gradient Builder
              </p>

              {/* Live mini preview */}
              <div
                className="w-full h-12 rounded-lg border border-white/10"
                style={{ background: customPreviewCss }}
              />

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Start color</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fromColor}
                      onChange={(e) => setFromColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-gray-600 bg-transparent cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={fromColor}
                      onChange={(e) => setFromColor(e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-gray-700 bg-gray-900 text-white text-xs font-mono focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">End color</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={toColor}
                      onChange={(e) => setToColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-gray-600 bg-transparent cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={toColor}
                      onChange={(e) => setToColor(e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-gray-700 bg-gray-900 text-white text-xs font-mono focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>
                </div>
              </div>

              {/* Direction */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Direction</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {DIRECTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDirection(d.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        direction === d.value
                          ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                          : "bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply button */}
              <button
                type="button"
                onClick={applyCustom}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
              >
                Apply Custom Gradient
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Color Picker Component ────────────────────────────────────────────────────
function TitleColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger row */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-indigo-500/60 transition-all group"
      >
        {/* Swatch */}
        <span
          className="w-7 h-7 rounded-lg border border-white/10 flex-shrink-0 shadow-inner"
          style={{ backgroundColor: value }}
        />
        {/* Hex value */}
        <span className="flex-1 text-left text-sm font-mono text-gray-300 uppercase">
          {value}
        </span>
        <Pipette size={14} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/60 p-4 w-64"
          >
            {/* react-colorful saturation/hue picker */}
            <HexColorPicker
              color={value}
              onChange={onChange}
              style={{ width: "100%", height: 180 }}
            />

            {/* Hex input */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">#</span>
              <HexColorInput
                color={value}
                onChange={onChange}
                prefixed={false}
                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm font-mono uppercase focus:outline-none focus:border-indigo-500/60 transition-all"
                placeholder="8b5cf6"
              />
              {/* Live swatch */}
              <span
                className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0"
                style={{ backgroundColor: value }}
              />
            </div>

            {/* Preset swatches */}
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    title={c}
                    className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none"
                    style={{
                      backgroundColor: c,
                      borderColor: value.toLowerCase() === c.toLowerCase() ? "#fff" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Developer CSS Override (collapsible) ─────────────────────────────────────
function DeveloperCssOverride({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/40 hover:bg-gray-800/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Edit2 size={13} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-400">
            Developer Override
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-medium">
            Advanced
          </span>
          {value && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              Active
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      {/* Collapsible body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Raw CSS applied directly to the loader container element.
                Overrides the background style selected above.
                For developers only.
              </p>
              <textarea
                rows={5}
                className={`${inputCls} resize-none font-mono text-xs`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={"/* e.g. */\nbackground: #000;\nopacity: 0.95;"}
                spellCheck={false}
              />
              {value && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear override
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Live Preview Component ────────────────────────────────────────────────────
function LoaderPreview({ cfg, progress }: { cfg: LoaderSettings; progress: number }) {
  const bgStyle =
    cfg.template === "glassmorphism"
      ? "bg-gray-900/60 backdrop-blur-xl"
      : cfg.template === "neon"
      ? "bg-black"
      : cfg.template === "minimal"
      ? "bg-gray-950"
      : "bg-gray-950";

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden ${bgStyle}`}
      style={cfg.customCss ? parseCssString(cfg.customCss) : undefined}
    >
      {/* Background gradient blob */}
      {cfg.template !== "minimal" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: cfg.bgGradient
              ? cfg.bgGradient
              : `radial-gradient(ellipse 60% 50% at 50% 40%, #8b5cf622 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Neon glow ring */}
      {cfg.template === "neon" && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: cfg.imageSize + 40,
            height: cfg.imageSize + 40,
            boxShadow: `0 0 40px 10px #8b5cf655`,
            border: `2px solid #8b5cf644`,
            borderRadius: cfg.imageShape === "rounded-full" ? "9999px" : "1rem",
          }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Profile image */}
        <div
          className="overflow-hidden shadow-2xl"
          style={{
            width: cfg.imageSize,
            height: cfg.imageSize,
            borderRadius:
              cfg.imageShape === "rounded-full"
                ? "9999px"
                : cfg.imageShape === "rounded-none"
                ? "0"
                : cfg.imageShape === "rounded-3xl"
                ? "1.5rem"
                : "1rem",
            boxShadow:
              cfg.template === "neon"
                ? `0 0 30px #8b5cf666`
                : `0 20px 40px rgba(0,0,0,0.5)`,
          }}
        >
          {cfg.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cfg.imageUrl}
              alt={cfg.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: `linear-gradient(135deg, #8b5cf6, #6366f1)` }}
            >
              {cfg.title.charAt(0)}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <p
            className="font-bold text-lg leading-tight"
            style={{ color: cfg.progressColor }}
          >
            {cfg.title || "Your Name"}
          </p>
          <p
            className="mt-0.5"
            style={{
              color: cfg.subtitleColor || "#9ca3af",
              fontSize:
                cfg.subtitleSize === "xs" ? "0.75rem"
                : cfg.subtitleSize === "base" ? "1rem"
                : cfg.subtitleSize === "lg" ? "1.125rem"
                : "0.875rem",
              fontWeight:
                cfg.subtitleWeight === "medium" ? 500
                : cfg.subtitleWeight === "semibold" ? 600
                : 400,
            }}
          >
            {cfg.subtitle || "Your Title"}
          </p>
        </div>

        {/* Loader indicator */}
        {cfg.showProgressBar && (
          <div className="w-40">
            {cfg.loaderType === "progress-bar" && (
              <div>
                <div className="w-full h-1 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, #8b5cf6, #6366f1)`,
                    }}
                  />
                </div>
                {cfg.showPercentage && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {Math.round(progress)}%
                  </p>
                )}
              </div>
            )}

            {cfg.loaderType === "pulse" && (
              <div className="flex justify-center">
                <div
                  className="w-3 h-3 rounded-full animate-ping"
                  style={{ backgroundColor: "#8b5cf6" }}
                />
              </div>
            )}

            {cfg.loaderType === "spinner" && (
              <div className="flex justify-center">
                <div
                  className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#8b5cf644", borderTopColor: "#8b5cf6" }}
                />
              </div>
            )}

            {cfg.loaderType === "dots" && (
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "#8b5cf6",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {cfg.loaderType === "percentage" && (
              <p
                className="text-center text-2xl font-bold tabular-nums"
                style={{ color: "#8b5cf6" }}
              >
                {Math.round(progress)}%
              </p>
            )}
          </div>
        )}

        {/* Skip button */}
        {cfg.allowSkip && (
          <button
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1"
          >
            Skip →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Editor Form ───────────────────────────────────────────────────────────────
function LoaderEditor({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: LoaderSettings;
  onSave: (cfg: LoaderSettings) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [cfg, setCfg] = useState<LoaderSettings>(initial);
  const [previewProgress, setPreviewProgress] = useState(65);
  const [activeTab, setActiveTab] = useState<"content" | "style" | "animation" | "advanced">("content");

  // Animate preview progress bar
  useEffect(() => {
    const id = setInterval(() => {
      setPreviewProgress((p) => (p >= 100 ? 0 : p + 1));
    }, 40);
    return () => clearInterval(id);
  }, []);

  const set = <K extends keyof LoaderSettings>(key: K, value: LoaderSettings[K]) =>
    setCfg((prev) => ({ ...prev, [key]: value }));

  const tabs = [
    { id: "content", label: "Content", icon: Layers },
    { id: "style", label: "Style", icon: Monitor },
    { id: "animation", label: "Animation", icon: Zap },
    { id: "advanced", label: "Advanced", icon: Edit2 },
  ] as const;

  return (
    <div className="grid xl:grid-cols-[1fr_380px] gap-6">
      {/* ── Left: Editor ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h3 className="font-semibold text-white text-sm">
              {cfg._id ? `Editing: ${cfg.name}` : "New Loader"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Changes reflect in preview instantly</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(cfg)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-all -mb-px ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6 space-y-5">
          {/* ── CONTENT TAB ── */}
          {activeTab === "content" && (
            <>
              <div>
                <label className={labelCls}>Loader Name (internal)</label>
                <input
                  className={inputCls}
                  value={cfg.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Main Loader"
                />
              </div>
              <div>
                <label className={labelCls}>Display Title</label>
                <input
                  className={inputCls}
                  value={cfg.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Asiful Maula Abir"
                />
              </div>

              {/* ── Subtitle section ── */}
              <div className="rounded-xl border border-gray-700 bg-gray-800/20 overflow-hidden">
                {/* Subtitle header */}
                <div className="px-4 py-2.5 border-b border-gray-700 bg-gray-800/40">
                  <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Subtitle</p>
                </div>
                <div className="p-4 space-y-4">
                  {/* Text */}
                  <div>
                    <label className={labelCls}>Subtitle Text</label>
                    <input
                      className={inputCls}
                      value={cfg.subtitle}
                      onChange={(e) => set("subtitle", e.target.value)}
                      placeholder="Frontend Developer"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className={labelCls}>Subtitle Color</label>
                    <TitleColorPicker
                      value={cfg.subtitleColor || "#9ca3af"}
                      onChange={(c) => set("subtitleColor", c)}
                    />
                  </div>

                  {/* Size + Weight row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Font Size</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(["xs", "sm", "base", "lg"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set("subtitleSize", s)}
                            className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                              (cfg.subtitleSize || "sm") === s
                                ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                                : "bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600"
                            }`}
                          >
                            {s === "xs" ? "XS" : s === "sm" ? "SM" : s === "base" ? "MD" : "LG"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Font Weight</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(["normal", "medium", "semibold"] as const).map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => set("subtitleWeight", w)}
                            className={`py-1.5 rounded-lg text-xs transition-all ${
                              (cfg.subtitleWeight || "normal") === w
                                ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold"
                                : "bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 font-medium"
                            }`}
                          >
                            {w.charAt(0).toUpperCase() + w.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live mini preview */}
                  <div className="flex items-center justify-center py-3 rounded-xl bg-gray-900 border border-gray-700">
                    <p
                      style={{
                        color: cfg.subtitleColor || "#9ca3af",
                        fontSize:
                          cfg.subtitleSize === "xs" ? "0.75rem"
                          : cfg.subtitleSize === "base" ? "1rem"
                          : cfg.subtitleSize === "lg" ? "1.125rem"
                          : "0.875rem",
                        fontWeight:
                          cfg.subtitleWeight === "medium" ? 500
                          : cfg.subtitleWeight === "semibold" ? 600
                          : 400,
                      }}
                    >
                      {cfg.subtitle || "Frontend Developer"}
                    </p>
                  </div>
                </div>
              </div>
              <ImageUpload
                label="Profile / Logo Image"
                currentUrl={cfg.imageUrl}
                onUpload={(url) => set("imageUrl", url)}
              />
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={cfg.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300 cursor-pointer">
                  <span className="font-medium text-white">Set as Active Loader</span>
                  <span className="block text-xs text-gray-500">Only one loader can be active at a time</span>
                </label>
              </div>
            </>
          )}

          {/* ── STYLE TAB ── */}
          {activeTab === "style" && (
            <>
              {/* Template */}
              <div>
                <label className={labelCls}>Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => set("template", t.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        cfg.template === t.value
                          ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                          : "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <p className="text-xs font-semibold">{t.label}</p>
                      <p className="text-xs opacity-60 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title text color */}
              <div>
                <label className={labelCls}>Title Text Color</label>
                <p className="text-xs text-gray-600 mb-2">
                  Applies only to the display name/title text
                </p>
                <TitleColorPicker
                  value={cfg.progressColor}
                  onChange={(c) => set("progressColor", c)}
                />
              </div>

              {/* Image shape */}
              <div>
                <label className={labelCls}>Image Shape</label>
                <div className="grid grid-cols-2 gap-2">
                  {IMAGE_SHAPES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => set("imageShape", s.value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        cfg.imageShape === s.value
                          ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                          : "border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image size */}
              <div>
                <label className={labelCls}>Image Size — {cfg.imageSize}px</label>
                <input
                  type="range"
                  min={60}
                  max={200}
                  value={cfg.imageSize}
                  onChange={(e) => set("imageSize", Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>60px</span><span>200px</span>
                </div>
              </div>

              {/* Background gradient */}
              <div>
                <label className={labelCls}>Background Gradient</label>
                <GradientPicker
                  value={cfg.bgGradient}
                  onChange={(css) => set("bgGradient", css)}
                />
              </div>
            </>
          )}

          {/* ── ANIMATION TAB ── */}
          {activeTab === "animation" && (
            <>
              {/* Loader type */}
              <div>
                <label className={labelCls}>Loading Indicator Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {LOADER_TYPES.map((lt) => (
                    <button
                      key={lt.value}
                      onClick={() => set("loaderType", lt.value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                        cfg.loaderType === lt.value
                          ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                          : "border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.progressColor }} />
                      {lt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show/hide progress bar */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700">
                <input
                  type="checkbox"
                  id="showProgressBar"
                  checked={cfg.showProgressBar}
                  onChange={(e) => set("showProgressBar", e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <label htmlFor="showProgressBar" className="text-sm text-gray-300 cursor-pointer">
                  Show loading indicator
                </label>
              </div>

              {/* Show percentage */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700">
                <input
                  type="checkbox"
                  id="showPercentage"
                  checked={cfg.showPercentage}
                  onChange={(e) => set("showPercentage", e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <label htmlFor="showPercentage" className="text-sm text-gray-300 cursor-pointer">
                  Show percentage number (progress-bar only)
                </label>
              </div>

              {/* Duration */}
              <div>
                <label className={labelCls}>
                  Loading Duration
                  <span className="ml-1 normal-case font-normal text-gray-500">
                    (seconds)
                  </span>
                </label>

                {/* Slider + number input side by side */}
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min={0.1}
                    max={4.0}
                    step={0.1}
                    value={+(cfg.duration / 1000).toFixed(1)}
                    onChange={(e) =>
                      set("duration", Math.round(parseFloat(e.target.value) * 1000))
                    }
                    className="flex-1 accent-indigo-500"
                  />
                  {/* Numeric input — edits in seconds, stores ms */}
                  <div className="relative flex-shrink-0 w-24">
                    <input
                      type="number"
                      min={0.1}
                      max={4.0}
                      step={0.1}
                      value={+(cfg.duration / 1000).toFixed(1)}
                      onChange={(e) => {
                        const raw = parseFloat(e.target.value);
                        if (isNaN(raw)) return;
                        const clamped = Math.min(4.0, Math.max(0.1, raw));
                        set("duration", Math.round(clamped * 1000));
                      }}
                      className="w-full px-3 py-2 pr-7 rounded-xl border border-gray-700 bg-gray-800/50 text-white text-sm text-right focus:outline-none focus:border-indigo-500/60 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">
                      s
                    </span>
                  </div>
                </div>

                {/* Tick marks */}
                <div className="flex justify-between text-xs text-gray-600 mt-1 px-0.5">
                  <span>0.1s</span>
                  <span>1s</span>
                  <span>2s</span>
                  <span>3s</span>
                  <span>4s</span>
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((s) => {
                    const ms = Math.round(s * 1000);
                    const active = cfg.duration === ms;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set("duration", ms)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          active
                            ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                            : "bg-gray-800 border border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {s}s
                      </button>
                    );
                  })}
                </div>

                {/* Validation hint */}
                <p className="text-xs text-gray-600 mt-1.5">
                  Range: 0.1s – 4.0s · Decimals allowed (e.g. 1.5, 2.7)
                </p>
              </div>

              {/* Allow skip */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700">
                <input
                  type="checkbox"
                  id="allowSkip"
                  checked={cfg.allowSkip}
                  onChange={(e) => set("allowSkip", e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <label htmlFor="allowSkip" className="text-sm text-gray-300 cursor-pointer">
                  Allow visitors to skip the loader
                </label>
              </div>
            </>
          )}

          {/* ── ADVANCED TAB ── */}
          {activeTab === "advanced" && (
            <>
              {/* Background Style */}
              <div>
                <label className={labelCls}>Background Style</label>
                <p className="text-xs text-gray-600 mb-3">
                  Click a style to apply it instantly — no coding required
                </p>
                <BackgroundStylePicker
                  value={cfg.backgroundStyle || "none"}
                  onChange={(id, css) => {
                    set("backgroundStyle", id);
                    // Only overwrite customCss when picking a preset (not "none" which clears)
                    if (id === "none") {
                      set("customCss", "");
                    } else {
                      set("customCss", css);
                    }
                  }}
                />
              </div>

              {/* Display Order */}
              <div>
                <label className={labelCls}>Display Order</label>
                <input
                  type="number"
                  className={inputCls}
                  value={cfg.order}
                  onChange={(e) => set("order", Number(e.target.value))}
                />
              </div>

              {/* Developer Override — collapsible */}
              <DeveloperCssOverride
                value={cfg.customCss}
                onChange={(v) => {
                  set("customCss", v);
                  // If admin types custom CSS, mark backgroundStyle as custom
                  if (v) set("backgroundStyle", "custom");
                  else set("backgroundStyle", "none");
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Right: Live Preview ── */}
      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Live Preview</p>
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Real-time
            </span>
          </div>
          <div className="relative" style={{ height: 380 }}>
            <LoaderPreview cfg={cfg} progress={previewProgress} />
          </div>
        </div>

        {/* Config summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Config JSON</p>
          <pre className="text-xs text-gray-500 overflow-auto max-h-48 font-mono leading-relaxed">
            {JSON.stringify(
              {
                title: cfg.title,
                subtitle: cfg.subtitle,
                imageUrl: cfg.imageUrl,
                loaderType: cfg.loaderType,
                progressColor: cfg.progressColor,
                template: cfg.template,
                isActive: cfg.isActive,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoaderAdminPage() {
  const toast = useToast();
  const [loaders, setLoaders] = useState<LoaderSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LoaderSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);

  // Animate preview progress
  useEffect(() => {
    if (!previewId) return;
    setPreviewProgress(0);
    const id = setInterval(() => {
      setPreviewProgress((p) => {
        if (p >= 100) { clearInterval(id); return 100; }
        return p + Math.random() * 12 + 4;
      });
    }, 80);
    return () => clearInterval(id);
  }, [previewId]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/loader");
      const data = await res.json();
      setLoaders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Load failed", "Could not fetch loader settings.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleSave = async (cfg: LoaderSettings) => {
    setSaving(true);
    try {
      const isNew = !cfg._id;
      const url = isNew ? "/api/loader" : `/api/loader/${cfg._id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });

      if (res.status === 401) {
        toast.error("Session expired", "Please log in again.");
        setTimeout(() => { window.location.href = "/admin/login"; }, 1500);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      toast.success("Saved!", isNew ? "Loader created." : "Loader updated.");
      setEditing(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save loader settings.";
      toast.error("Save failed", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this loader? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/loader/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted", "Loader removed.");
      setLoaders((prev) => prev.filter((l) => l._id !== id));
    } catch {
      toast.error("Delete failed", "Could not delete loader.");
    }
  };

  const handleActivate = async (loader: LoaderSettings) => {
    try {
      const res = await fetch(`/api/loader/${loader._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loader, isActive: true }),
      });
      if (!res.ok) throw new Error();
      toast.success("Activated!", `"${loader.name}" is now the active loader.`);
      await load();
    } catch {
      toast.error("Failed", "Could not activate loader.");
    }
  };

  const activeLoader = loaders.find((l) => l.isActive);
  const previewLoader = loaders.find((l) => l._id === previewId);

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <AdminTopbar
        title="Loader Settings"
        subtitle="Manage your website loading screen"
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* ── Header bar ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Loading Screen Manager</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {loaders.length} loader{loaders.length !== 1 ? "s" : ""} ·{" "}
              {activeLoader ? (
                <span className="text-green-400">Active: {activeLoader.name}</span>
              ) : (
                <span className="text-yellow-400">No active loader</span>
              )}
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(emptyLoader())}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={16} />
              New Loader
            </button>
          )}
        </div>

        {/* ── Editor (shown when editing) ── */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LoaderEditor
                initial={editing}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                saving={saving}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loader cards ── */}
        {!editing && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-indigo-400" />
              </div>
            ) : loaders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                  <Layers size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">No loaders yet</p>
                <p className="text-gray-600 text-sm mt-1">Create your first loading screen</p>
                <button
                  onClick={() => setEditing(emptyLoader())}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
                >
                  <Plus size={14} />
                  Create Loader
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loaders.map((loader) => (
                  <motion.div
                    key={loader._id}
                    layout
                    className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all ${
                      loader.isActive
                        ? "border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    {/* Mini preview */}
                    <div
                      className="relative cursor-pointer"
                      style={{ height: 200 }}
                      onClick={() =>
                        setPreviewId(previewId === loader._id ? null : loader._id!)
                      }
                    >
                      <LoaderPreview
                        cfg={loader}
                        progress={previewId === loader._id ? previewProgress : 65}
                      />
                      {/* Overlay hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                        <span className="text-xs text-white font-medium flex items-center gap-1.5">
                          <Eye size={14} />
                          {previewId === loader._id ? "Stop preview" : "Animate preview"}
                        </span>
                      </div>
                      {/* Active badge */}
                      {loader.isActive && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold">
                          <CheckCircle size={10} />
                          Active
                        </div>
                      )}
                    </div>

                    {/* Card footer */}
                    <div className="p-4 border-t border-gray-800">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{loader.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {loader.title} · {loader.template} · {loader.loaderType}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                            loader.isActive
                              ? "bg-green-500/15 text-green-400"
                              : "bg-gray-800 text-gray-500"
                          }`}
                        >
                          {loader.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!loader.isActive && (
                          <button
                            onClick={() => handleActivate(loader)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-all border border-indigo-500/20"
                          >
                            <Zap size={12} />
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => setEditing(loader)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-all"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(loader._id!)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all border border-red-500/20"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Full-screen preview modal ── */}
        <AnimatePresence>
          {previewLoader && !editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] flex flex-col"
            >
              <div className="absolute inset-0">
                <LoaderPreview cfg={previewLoader} progress={previewProgress} />
              </div>
              <button
                onClick={() => setPreviewId(null)}
                className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 backdrop-blur text-white text-sm font-medium hover:bg-black/80 transition-all border border-white/10"
              >
                <X size={14} />
                Close Preview
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
