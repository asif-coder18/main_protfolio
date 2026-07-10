"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Block, CustomSection } from "@/app/api/custom-sections/route";

// ── Individual block renderers ────────────────────────────────────────────────

function HeadingBlock({ b }: { b: Block }) {
  const Tag = (b.level ?? "h2") as keyof JSX.IntrinsicElements;
  const sizeMap = { h1: "text-4xl sm:text-5xl", h2: "text-3xl sm:text-4xl", h3: "text-2xl sm:text-3xl" };
  const alignMap = { left: "text-left", center: "text-center", right: "text-right" };
  return (
    <Tag
      className={`font-bold text-[var(--foreground)] ${sizeMap[b.level ?? "h2"]} ${alignMap[b.align ?? "center"]}`}
      dangerouslySetInnerHTML={{ __html: b.text ?? "" }}
    />
  );
}

function ParagraphBlock({ b }: { b: Block }) {
  const alignMap = { left: "text-left", center: "text-center", right: "text-right" };
  return (
    <p
      className={`text-[var(--muted)] leading-relaxed text-base ${alignMap[b.align ?? "left"]}`}
      dangerouslySetInnerHTML={{ __html: b.text ?? "" }}
    />
  );
}

function ImageBlock({ b }: { b: Block }) {
  if (!b.src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={b.src}
      alt={b.alt ?? ""}
      className="rounded-2xl object-cover max-w-full mx-auto"
      style={{ maxWidth: "100%" }}
    />
  );
}

function ButtonBlock({ b }: { b: Block }) {
  const base = "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200";
  const variant =
    b.variant === "outline"
      ? "border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25";
  return (
    <div className="flex justify-center">
      <a href={b.href ?? "#"} target="_blank" rel="noopener noreferrer" className={`${base} ${variant}`}>
        {b.label ?? "Click here"}
      </a>
    </div>
  );
}

function CardBlock({ b }: { b: Block }) {
  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:border-indigo-500/20 transition-all duration-300">
      {b.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.imageUrl} alt={b.title ?? ""} className="w-full h-36 object-cover rounded-xl mb-4" />
      )}
      {b.icon && <div className="text-3xl mb-3">{b.icon}</div>}
      {b.title && <h3 className="font-bold text-[var(--foreground)] mb-2">{b.title}</h3>}
      {b.description && <p className="text-sm text-[var(--muted)] leading-relaxed">{b.description}</p>}
      {b.href && (
        <a
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View →
        </a>
      )}
    </div>
  );
}

const SOCIAL_ICONS: Record<string, string> = {
  github:    "💻",
  linkedin:  "💼",
  twitter:   "🐦",
  x:         "✖️",
  youtube:   "▶️",
  instagram: "📸",
  facebook:  "📘",
  tiktok:    "🎵",
  discord:   "🎮",
  website:   "🌐",
  email:     "📧",
  other:     "🔗",
};

function SocialBlock({ b }: { b: Block }) {
  const icon = SOCIAL_ICONS[b.platform?.toLowerCase() ?? "other"] ?? "🔗";
  return (
    <div className="flex justify-center">
      <a
        href={b.url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 group"
      >
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors">
            {b.platform ?? "Social"}
          </p>
          {b.username && (
            <p className="text-xs text-[var(--muted)]">{b.username}</p>
          )}
        </div>
      </a>
    </div>
  );
}

function DividerBlock({ b }: { b: Block }) {
  const styleMap = {
    dashed: "border-dashed",
    dotted: "border-dotted",
    solid:  "border-solid",
  };
  return (
    <hr className={`border-t border-[var(--border)] ${styleMap[b.style ?? "solid"]} my-4`} />
  );
}

function GridBlock({ b }: { b: Block }) {
  const cols = b.columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  return (
    <div className={`grid ${cols} gap-6`}>
      {(b.cards ?? []).map((card, i) => (
        <CardBlock key={i} b={card} />
      ))}
    </div>
  );
}

// ── Block dispatcher ──────────────────────────────────────────────────────────
function RenderBlock({ block, delay }: { block: Block; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {block.type === "heading"   && <HeadingBlock   b={block} />}
      {block.type === "paragraph" && <ParagraphBlock b={block} />}
      {block.type === "image"     && <ImageBlock     b={block} />}
      {block.type === "button"    && <ButtonBlock    b={block} />}
      {block.type === "card"      && <CardBlock      b={block} />}
      {block.type === "social"    && <SocialBlock    b={block} />}
      {block.type === "divider"   && <DividerBlock   b={block} />}
      {block.type === "grid"      && <GridBlock      b={block} />}
    </motion.div>
  );
}

// ── Main section renderer ─────────────────────────────────────────────────────
export function CustomSectionRenderer({ section }: { section: CustomSection }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const bgStyle = section.bgColor
    ? section.bgColor.startsWith("#") || section.bgColor.startsWith("rgb")
      ? { backgroundColor: section.bgColor }
      : {}
    : {};
  const bgClass = section.bgColor && !section.bgColor.startsWith("#") && !section.bgColor.startsWith("rgb")
    ? section.bgColor
    : "";

  return (
    <section
      id={section.sectionId}
      ref={ref}
      className={`py-24 px-4 sm:px-6 lg:px-8 ${bgClass}`}
      style={bgStyle}
    >
      <motion.div
        className="max-w-5xl mx-auto space-y-8"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
      >
        {section.blocks.map((block, i) => (
          <RenderBlock key={block.id ?? i} block={block} delay={i * 0.08} />
        ))}
      </motion.div>
    </section>
  );
}
