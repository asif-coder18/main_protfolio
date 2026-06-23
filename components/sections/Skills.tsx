"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Icon } from "@iconify/react";

interface Skill { name: string; level: number; icon: string; }
interface Category { _id?: string; title: string; color: string; order: number; skills: Skill[]; }
interface TechIcon { name: string; symbol: string; bg: string; text: string; order: number; }
interface SkillMeta { badge: string; heading: string; highlight: string; description: string; }

const DEFAULT_META: SkillMeta = {
  badge: "Skills",
  heading: "My Tech Stack",
  highlight: "Tech Stack",
  description: "Technologies I work with to build modern, performant web applications.",
};

const defaultCategories: Category[] = [
  { title: "Frontend", color: "indigo", order: 0, skills: [
    { name: "Next.js", level: 95, icon: "logos:nextjs-icon" }, { name: "React", level: 92, icon: "logos:react" },
    { name: "TypeScript", level: 88, icon: "logos:typescript-icon" }, { name: "JavaScript", level: 93, icon: "logos:javascript" },
  ]},
  { title: "Styling", color: "purple", order: 1, skills: [
    { name: "Tailwind CSS", level: 95, icon: "🌊" }, { name: "CSS / SCSS", level: 90, icon: "🎨" },
    { name: "Framer Motion", level: 82, icon: "✨" }, { name: "HTML5", level: 97, icon: "🌐" },
  ]},
  { title: "Tools & Others", color: "pink", order: 2, skills: [
    { name: "Git / GitHub", level: 88, icon: "🔀" }, { name: "REST APIs", level: 85, icon: "🔌" },
    { name: "Figma", level: 75, icon: "🎭" }, { name: "Node.js", level: 70, icon: "🟢" },
  ]},
];

const defaultTechIcons: TechIcon[] = [
  { name: "HTML5", bg: "bg-orange-500/10", text: "text-orange-400", symbol: "logos:html-5", order: 0 },
  { name: "CSS3", bg: "bg-blue-500/10", text: "text-blue-400", symbol: "logos:css-3", order: 1 },
  { name: "JavaScript", bg: "bg-yellow-500/10", text: "text-yellow-400", symbol: "logos:javascript", order: 2 },
  { name: "TypeScript", bg: "bg-blue-600/10", text: "text-blue-500", symbol: "logos:typescript-icon", order: 3 },
  { name: "React", bg: "bg-cyan-500/10", text: "text-cyan-400", symbol: "logos:react", order: 4 },
  { name: "Next.js", bg: "bg-gray-500/10", text: "text-gray-300", symbol: "logos:nextjs-icon", order: 5 },
  { name: "Tailwind", bg: "bg-teal-500/10", text: "text-teal-400", symbol: "logos:tailwindcss-icon", order: 6 },
  { name: "Git", bg: "bg-red-500/10", text: "text-red-400", symbol: "logos:git-icon", order: 7 },
];

const colorMap: Record<string, { bar: string; glow: string; badge: string }> = {
  indigo: { bar: "bg-indigo-500", glow: "shadow-indigo-500/30", badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  purple: { bar: "bg-purple-500", glow: "shadow-purple-500/30", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  pink: { bar: "bg-pink-500", glow: "shadow-pink-500/30", badge: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  blue: { bar: "bg-blue-500", glow: "shadow-blue-500/30", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  green: { bar: "bg-green-500", glow: "shadow-green-500/30", badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  orange: { bar: "bg-orange-500", glow: "shadow-orange-500/30", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  yellow: { bar: "bg-yellow-500", glow: "shadow-yellow-500/30", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  cyan: { bar: "bg-cyan-500", glow: "shadow-cyan-500/30", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  teal: { bar: "bg-teal-500", glow: "shadow-teal-500/30", badge: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  red: { bar: "bg-red-500", glow: "shadow-red-500/30", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
};

// Helper to check if string is an Iconify name
const isIconify = (icon: string) => icon && icon.includes(":");

function SkillBar({ name, level, icon, color, delay, isInView }: {
  name: string; level: number; icon: string; color: string; delay: number; isInView: boolean;
}) {
  const colors = colorMap[color] ?? colorMap.indigo;
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            {isIconify(icon) ? (
              <Icon icon={icon} className="w-full h-full" />
            ) : (
              <span className="text-sm">{icon}</span>
            )}
          </div>
          <span className="text-sm font-medium text-[var(--foreground)]">{name}</span>
        </div>
        <span className="text-xs font-semibold text-[var(--muted)]">{level}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colors.bar} shadow-sm ${colors.glow}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [techIcons, setTechIcons] = useState<TechIcon[]>(defaultTechIcons);
  const [meta, setMeta] = useState<SkillMeta>(DEFAULT_META);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((json) => {
        if (json.categories?.length) setCategories(json.categories);
        if (json.techIcons?.length) setTechIcons(json.techIcons);
        if (json.skillMeta) setMeta({ ...DEFAULT_META, ...json.skillMeta });
      })
      .catch(() => {});
  }, []);

  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--card)]">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            {meta.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {meta.highlight && meta.heading.includes(meta.highlight) ? (
              <>
                {meta.heading.split(meta.highlight)[0]}
                <span className="gradient-text">{meta.highlight}</span>
                {meta.heading.split(meta.highlight)[1]}
              </>
            ) : (
              meta.heading
            )}
          </h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto text-lg">
            {meta.description}
          </p>
        </motion.div>

        {/* Tech icons row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {techIcons.map((tech, i) => (
            <motion.div
              key={tech.name + i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
              whileHover={{ scale: 1.1, y: -3 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${tech.bg} ${tech.text} border-current/20 text-sm font-semibold cursor-default`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isIconify(tech.symbol) ? (
                  <Icon icon={tech.symbol} className="w-full h-full" />
                ) : (
                  <span className="text-base">{tech.symbol}</span>
                )}
              </div>
              <span>{tech.name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Skill bars grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, catIdx) => {
            const colors = colorMap[category.color] ?? colorMap.indigo;
            return (
              <motion.div
                key={category._id || `cat-${catIdx}-${category.title}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + catIdx * 0.15 }}
                className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:border-indigo-500/20 transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors.badge}`}>
                    {category.title}
                  </span>
                </div>
                <div className="space-y-5">
                  {category.skills.map((skill, skillIdx) => (
                    <SkillBar
                      key={skill.name}
                      {...skill}
                      color={category.color}
                      delay={0.6 + catIdx * 0.15 + skillIdx * 0.1}
                      isInView={isInView}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
