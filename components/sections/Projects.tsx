"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ExternalLink, Star } from "lucide-react";
import { GithubIcon } from "@/components/icons/SocialIcons";

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  imageUrl: string;
  gradient: string;
  tags: string[];
  live: string;
  github: string;
  featured: boolean;
  stars: number;
}

const defaultProjects: Project[] = [
  {
    _id: "1",
    title: "ShopFlow — E-Commerce Platform",
    description: "A full-featured e-commerce platform with real-time inventory, Stripe payments, and a blazing-fast storefront built with Next.js App Router and server components.",
    image: "🛒", imageUrl: "", gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
    tags: ["Next.js", "TypeScript", "Stripe", "Prisma", "Tailwind"],
    live: "https://example.com", github: "https://github.com", featured: true, stars: 128,
  },
  {
    _id: "2",
    title: "TaskBoard — Project Management",
    description: "A Kanban-style project management tool with drag-and-drop, real-time collaboration, and team workspaces. Inspired by Trello but built for developers.",
    image: "📋", imageUrl: "", gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    tags: ["React", "Next.js", "Socket.io", "MongoDB", "Tailwind"],
    live: "https://example.com", github: "https://github.com", featured: true, stars: 94,
  },
  {
    _id: "3",
    title: "WeatherNow — Weather Dashboard",
    description: "A beautiful weather dashboard with animated forecasts, location search, and interactive charts. Uses OpenWeather API with smart caching for performance.",
    image: "🌤", imageUrl: "", gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    tags: ["Next.js", "TypeScript", "Chart.js", "OpenWeather API"],
    live: "https://example.com", github: "https://github.com", featured: false, stars: 67,
  },
  {
    _id: "4",
    title: "BlogCMS — Headless Blog",
    description: "A headless CMS-powered blog with MDX support, syntax highlighting, dark mode, and a custom admin dashboard. Achieves 100/100 Lighthouse scores.",
    image: "✍️", imageUrl: "", gradient: "from-green-500/20 via-teal-500/10 to-transparent",
    tags: ["Next.js", "MDX", "Contentlayer", "Tailwind", "Vercel"],
    live: "https://example.com", github: "https://github.com", featured: false, stars: 52,
  },
];

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState("All");
  const [projects, setProjects] = useState<Project[]>(defaultProjects);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          setProjects(json);
        }
      })
      .catch(() => {});
  }, []);

  // Compute unique filters dynamically from tags
  const filters = ["All", ...Array.from(new Set(projects.flatMap((p) => p.tags)))].slice(0, 6); // Max 6 filters

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.tags.includes(activeFilter));

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
            Projects
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Things I&apos;ve <span className="gradient-text">Built</span>
          </h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto text-lg">
            A selection of projects that showcase my skills and passion for
            building great products.
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
                ) : (
                  <motion.span
                    className="text-7xl select-none"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {project.image}
                  </motion.span>
                )}

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
