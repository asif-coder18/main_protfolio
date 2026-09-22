"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

interface Stat { icon: string; number: string; suffix: string; label: string; }
interface Highlight { icon: string; title: string; desc: string; }

interface AboutData {
  name?: string;
  bio?: string[];
  profileImage2?: string;
  stats?: Stat[];
  highlights?: Highlight[];
}

const defaultStats: Stat[] = [
  { icon: "lucide:code-2", number: "50", suffix: "+", label: "Projects Built" },
  { icon: "lucide:coffee", number: "3", suffix: "+", label: "Years Experience" },
  { icon: "lucide:users", number: "20", suffix: "+", label: "Happy Clients" },
  { icon: "lucide:globe", number: "10", suffix: "+", label: "Countries Reached" },
];

const defaultHighlights: Highlight[] = [
  { icon: "lucide:zap", title: "Performance First", desc: "I optimize every byte for lightning-fast load times and smooth interactions." },
  { icon: "lucide:code-2", title: "Clean Code", desc: "Readable, maintainable, and well-documented code is my standard." },
  { icon: "lucide:award", title: "Best Practices", desc: "Accessibility, SEO, and security are built in from the start." },
];

const defaultBio = [
  "Hey! I'm Asiful Maula Abir, a frontend developer with a deep passion for building exceptional web experiences. I specialize in Next.js and React, crafting applications that are not just functional but truly delightful to use.",
  "I build fast, responsive, and user-friendly web applications — from sleek landing pages to complex SaaS platforms. I believe great software lives at the intersection of technical excellence and thoughtful design.",
  "When I'm not coding, you'll find me exploring new technologies, contributing to open source, or sharing knowledge through community discussions and side projects.",
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [data, setData] = useState<Required<AboutData>>({
    name: "Asiful Maula Abir",
    bio: defaultBio,
    profileImage2: "/profile1.jpg",
    stats: defaultStats,
    highlights: defaultHighlights,
  });

  useEffect(() => {
    fetch("/api/about", { cache: "no-store" })
      .then((r) => r.json())
      .then((json: AboutData) => {
        if (!json?.name) return;
        setData({
          name: json.name ?? "Asiful Maula Abir",
          bio: json.bio?.length ? json.bio : defaultBio,
          profileImage2: json.profileImage2 ?? "/profile1.jpg",
          stats: json.stats?.length ? json.stats : defaultStats,
          highlights: json.highlights?.length ? json.highlights : defaultHighlights,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            About Me
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Passionate about{" "}
            <span className="gradient-text">great UX</span>
          </h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto text-lg">
            A frontend developer who loves turning ideas into polished digital experiences.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="space-y-5 text-[var(--muted)] leading-relaxed text-base">
              {data.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Highlights */}
            <div className="mt-8 space-y-4">
              {data.highlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-indigo-500/30 transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors duration-200">
                    <Icon icon={item.icon} className="text-xl text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Stats + Avatar */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Avatar */}
            <div className="relative">
              <motion.div
                className="w-56 h-56 rounded-2xl border border-indigo-500/20 overflow-hidden"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                {(data.profileImage2 || "/profile1.jpg") && (
                  <Image
                    src={data.profileImage2 || "/profile1.jpg"}
                    alt={data.name || "Profile"}
                    fill
                    className="object-cover object-top"
                  />
                )}
              </motion.div>
              <div className="absolute -inset-3 rounded-2xl border border-indigo-500/10 -z-10" />
              <div className="absolute -inset-6 rounded-2xl border border-purple-500/5 -z-20" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[var(--border)] text-xs font-medium whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Open to opportunities
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {data.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center hover:border-indigo-500/30 transition-colors duration-200 group"
                >
                  <div className="mb-2 group-hover:scale-110 transition-transform duration-200">
                    <Icon icon={stat.icon} className="text-2xl text-indigo-400 mx-auto" />
                  </div>
                  <div className="text-2xl font-bold gradient-text">{stat.number}{stat.suffix}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
