"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ExternalLink, Star } from "lucide-react";
import { GithubIcon } from "@/components/icons/SocialIcons";

interface Project {
  _id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  gradient: string;
  tags: string[];
  live: string;
  github: string;
  featured: boolean;
  stars: number;
}

interface SectionSettings {
  badgeText: string;
  headingText: string;
  highlightedWord: string;
  description: string;
  categories: string[];
}

const DEFAULT_SETTINGS: SectionSettings = {
  badgeText: "Projects",
  headingText: "Things I've Built",
  highlightedWord: "Built",
  description:
    "A selection of projects that showcase my skills and passion for building great products.",
  categories: [],
};

const defaultProjects: Project[] = [
  {
    _id: "1",
    title: "ShopFlow — E-Commerce Platform",
    description: "A full-featured e-commerce platform with real-time inventory, Stripe payments, and a blazing-fast storefront built with Next.js App Router and server components.",
    icon: "🛒", imageUrl: "", gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
    tags: ["Next.js", "TypeScript", "Stripe", "Prisma", "Tailwind"],
    live: "https://example.com", github: "https://github.com", featured: true, stars: 128,
  },
  {
    _id: "2",
    title: "TaskBoard — Project Management",
    description: "A Kanban-style project management tool with drag-and-drop, real-time collaboration, and team workspaces. Inspired by Trello but built for developers.",
    icon: "📋", imageUrl: "", gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    tags: ["React", "Next.js", "Socket.io", "MongoDB", "Tailwind"],
    live: "https://example.com", github: "https://github.com", featured: true, stars: 94,
  },
  {
    _id: "3",
    title: "WeatherNow — Weather Dashboard",
    description: "A beautiful weather dashboard with animated forecasts, location search, and interactive charts. Uses OpenWeather API with smart caching for performance.",
    icon: "🌤", imageUrl: "", gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    tags: ["Next.js", "TypeScript", "Chart.js", "OpenWeather API"],
    live: "https://example.com", github: "https://github.com", featured: false, stars: 67,
  },
  {
    _id: "4",
    title: "BlogCMS — Headless Blog",
    description: "A headless CMS-powered blog with MDX support, syntax highlighting, dark mode, and a custom admin dashboard. Achieves 100/100 Lighthouse scores.",
    icon: "✍️", imageUrl: "", gradient: "from-green-500/20 via-teal-500/10 to-transparent",
    tags: ["Next.js", "MDX", "Contentlayer", "Tailwind", "Vercel"],
    live: "https://example.com", github: "https://github.com", featured: false, stars: 52,
  },
];

/** Split a heading into [before, highlighted, after] parts */
function splitHeading(heading: string, word: string) {
  if (!word) return { before: heading, highlighted: "", after: "" };
  const idx = heading.indexOf(word);
  if (idx === -1) return { before: heading, highlighted: "", after: "" };
  return {
    before: heading.slice(0, idx),
    highlighted: word,
    after: heading.slice(idx + word.length),
  };
}

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState("All");
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [settings, setSettings] = useState<SectionSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Fetch projects
    fetch("/api/projects")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          setProjects(json);
        }
      })
      .catch(() => {});

    // Fetch section settings
    fetch("/api/project-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            badgeText: data.badgeText || DEFAULT_SETTINGS.badgeText,
            headingText: data.headingText || DEFAULT_SETTINGS.headingText,
            highlightedWord: data.highlightedWord || DEFAULT_SETTINGS.highlightedWord,
            description: data.description || DEFAULT_SETTINGS.description,
            categories: Array.isArray(data.categories) && data.categories.length > 0
              ? data.categories
              : [],
          });
        }
      })
      .catch(() => {});
  }, []);

  // Build filter list: use DB categories if defined, else auto-generate from tags
  const filters =
    settings.categories.length > 0
      ? ["All", ...settings.categories]
      : ["All", ...Array.from(new Set(projects.flatMap((p) => p.tags)))].slice(0, 6);

  // Reset active filter if it's no longer in the list
  useEffect(() => {
    if (activeFilter !== "All" && !filters.includes(activeFilter)) {
      setActiveFilter("All");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.join(",")]);

  const filtered =
    activeFilter === "All"
      ? projects
      : settings.categories.length > 0
        // If using custom categories, filter by tag match
        ? projects.filter((p) => p.tags.includes(activeFilter))
        : projects.filter((p) => p.tags.includes(activeFilter));

  const { before, highlighted, after } = splitHeading(
    settings.headingText,
    settings.highlightedWord
  );

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            {settings.badgeText}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {before}
            {highlighted && (
              <span className="gradient-text">{highlighted}</span>
            )}
            {after}
          </h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto text-lg">
            {settings.description}
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {filters.map((filter) => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/30"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((project, i) => (
            <motion.article
              key={project._id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              layout
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              {/* Project image / hero */}
              <div
                className={`relative h-48 bg-gradient-to-br ${project.gradient} flex items-center justify-center overflow-hidden`}
              >
                {project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : project.icon ? (
                  <motion.span
                    className="text-7xl select-none"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {project.icon}
                  </motion.span>
                ) : null}

                {/* Featured badge */}
                {project.featured && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                    <Star size={10} fill="currentColor" />
                    Featured
                  </div>
                )}

                {/* Stars */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full glass border border-[var(--border)] text-[var(--muted)] text-xs">
                  <Star size={10} />
                  {project.stars}
                </div>

                {/* Hover overlay with links */}
                <motion.div
                  className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                >
                  {project.live && (
                    <motion.a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} />
                      Live Demo
                    </motion.a>
                  )}
                  {project.github && (
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GithubIcon width={14} height={14} />
                      Code
                    </motion.a>
                  )}
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 group-hover:text-indigo-400 transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-indigo-400 transition-colors duration-200"
                    >
                      <ExternalLink size={14} />
                      Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-200"
                    >
                      <GithubIcon width={14} height={14} />
                      Source Code
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
