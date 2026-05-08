"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Briefcase, GraduationCap, MapPin, Calendar } from "lucide-react";

interface Experience {
  _id: string;
  type: "work" | "education";
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  tags: string[];
  keyFocus: string[];
  current: boolean;
}

const defaultExperiences: Experience[] = [
  {
    _id: "1",
    type: "work",
    title: "Frontend Developer (Student)",
    company: "Self-Directed / Freelance",
    location: "Dhaka, Bangladesh",
    period: "2025 – Present",
    description: "Developing modern web applications using Next.js, focusing on performance, responsiveness, and clean user interfaces. Continuously improving skills through real-world projects and hands-on practice.",
    tags: ["Next.js", "React", "Tailwind CSS", "Responsive Design"],
    current: true,
    keyFocus: ["Next.js Development", "Responsive Design", "Clean UI Implementation"],
  },
  {
    _id: "2",
    type: "education",
    title: "B.Sc. in Computer Science",
    company: "National Institute of Textile Engineering and Research",
    location: "Dhaka, Bangladesh",
    period: "2024 – Present",
    description: "Currently pursuing a degree in Computer Science with a strong focus on software development, web technologies, and problem-solving. Continuously building skills in modern frontend development and real-world projects.",
    tags: ["Web Development", "Problem Solving"],
    current: true,
    keyFocus: ["Web Development", "Problem Solving"],
  },
];

export function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [experiences, setExperiences] = useState<Experience[]>(defaultExperiences);

  useEffect(() => {
    fetch("/api/experience")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          setExperiences(json);
        }
      })
      .catch(() => {});
  }, []);

  const formatPeriod = (periodStr: string) => {
    try {
      const p = JSON.parse(periodStr);
      const formatMonth = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString("en-US", { month: "long", year: "numeric" });
      };
      const start = formatMonth(p.start);
      const end = p.current ? "Present" : formatMonth(p.end);
      return start ? `${start} – ${end}` : periodStr;
    } catch {
      return periodStr;
    }
  };

  return (
    <section
      id="experience"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--card)]"
    >
      <div className="max-w-4xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            Experience
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            My <span className="gradient-text">Journey</span>
          </h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto text-lg">
            A timeline of my professional experience and education.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent md:-translate-x-px" />

          <div className="space-y-8">
            {experiences.map((exp, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[var(--background)] md:-translate-x-1.5 mt-5 z-10 shadow-lg shadow-indigo-500/50" />

                  {/* Spacer for desktop */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Card */}
                  <div
                    className={`ml-12 md:ml-0 md:w-1/2 ${
                      isLeft ? "md:pr-10" : "md:pl-10"
                    }`}
                  >
                    <motion.div
                      className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:border-indigo-500/30 transition-all duration-300 group"
                      whileHover={{ y: -3 }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              exp.type === "work"
                                ? "bg-indigo-500/10"
                                : "bg-purple-500/10"
                            }`}
                          >
                            {exp.type === "work" ? (
                              <Briefcase size={14} className="text-indigo-400" />
                            ) : (
                              <GraduationCap size={14} className="text-purple-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-[var(--foreground)] text-sm leading-tight group-hover:text-indigo-400 transition-colors duration-200">
                              {exp.title}
                            </h3>
                            <p className="text-indigo-400 text-xs font-medium">
                              {exp.company}
                            </p>
                          </div>
                        </div>
                        {exp.current && (
                          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                            Current
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 mb-3 text-xs text-[var(--muted)]">
                        {exp.period && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {formatPeriod(exp.period)}
                          </span>
                        )}
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {exp.location}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 whitespace-pre-wrap">
                        {exp.description}
                      </p>

                      {/* Key Focus */}
                      {exp.keyFocus && exp.keyFocus.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
                            {exp.type === "education" ? "Key Areas" : "Key Focus"}
                          </p>
                          <ul className="space-y-1">
                            {exp.keyFocus.map((item) => (
                              <li key={item} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                                <span className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tags */}
                      {exp.tags && exp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {exp.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-[var(--card)] text-[var(--muted)] text-xs border border-[var(--border)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
