"use client";

import { motion } from "framer-motion";
import { ArrowDown, Mail, Sparkles, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon, MailIcon } from "@/components/icons/SocialIcons";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AboutData {
  name?: string;
  greeting?: string;
  title?: string;
  subtitle?: string;
  location?: string;
  tagline?: string;
  profileImage?: string;
  availableForWork?: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  emailAddress?: string;
  floatingBadge1?: string;
  floatingBadge2?: string;
  statusBadge?: string;
}

const defaults: Required<AboutData> = {
  name: "Asiful Maula Abir",
  greeting: "Hi there, I'm",
  title: "Frontend Developer",
  subtitle: "Next.js Specialist",
  location: "Savar, Dhaka, Bangladesh",
  tagline: "I build fast, responsive, and user-friendly web applications. Passionate about crafting clean, modern interfaces and turning complex ideas into seamless digital experiences.",
  profileImage: "/profile.jpg",
  availableForWork: true,
  githubUrl: "https://github.com/asif-coder18",
  linkedinUrl: "https://www.linkedin.com/feed/",
  emailAddress: "maulaasiful@gmail.com",
  floatingBadge1: "Next.js Dev",
  floatingBadge2: "Clean UI",
  statusBadge: "Open to opportunities",
};

export function Hero() {
  const [data, setData] = useState<Required<AboutData>>(defaults);

  useEffect(() => {
    fetch("/api/about", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => { if (json && json.name) setData({ ...defaults, ...json }); })
      .catch(() => {});
  }, []);

  const scrollToSection = (href: string, subject?: string) => {
    if (href === "#contact" && subject) {
      window.dispatchEvent(new CustomEvent("set-contact-subject", { detail: subject }));
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const socialLinks = [
    { icon: GithubIcon, href: data.githubUrl, label: "GitHub" },
    { icon: LinkedinIcon, href: data.linkedinUrl, label: "LinkedIn" },
    { icon: MailIcon, href: `mailto:${data.emailAddress}`, label: "Email" },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden hero-gradient grid-pattern"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"
          style={{ top: "10%", left: "5%" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"
          style={{ bottom: "20%", right: "5%" }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-pink-500/8 blur-3xl"
          style={{ top: "50%", left: "50%" }}
          animate={{ x: [0, 15, 0], y: [0, -25, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Text content ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">

            {/* Available badge */}
            {data.availableForWork && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-sm text-indigo-400 mb-6"
              >
                <Sparkles size={14} />
                Available for freelance work
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </motion.div>
            )}

            {/* Greeting */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-lg text-[var(--muted)] font-medium mb-2"
            >
              {data.greeting}
            </motion.p>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-tight"
            >
              <span className="gradient-text">{(data.name || "Asiful").split(" ")[0]}</span>
              <br />
              <span className="text-[var(--foreground)]">{(data.name || "").split(" ").slice(1).join(" ")}</span>
            </motion.h1>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-center gap-2 text-lg sm:text-xl font-medium text-[var(--muted)] mb-3"
            >
              <span className="w-8 h-px bg-indigo-500" />
              {data.title}
              {data.subtitle && (
                <>
                  <span className="text-indigo-400">|</span>
                  {data.subtitle}
                </>
              )}
            </motion.div>

            {/* Location */}
            {data.location && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] mb-6"
              >
                <MapPin size={14} className="text-indigo-400" />
                {data.location}
              </motion.div>
            )}

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-base text-[var(--muted)] max-w-lg mb-8 leading-relaxed"
            >
              {data.tagline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <motion.button
                onClick={() => scrollToSection("#projects")}
                className="group flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all duration-200 glow-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                View Projects
                <ArrowDown size={15} className="group-hover:translate-y-1 transition-transform duration-200" />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection("#contact", "General Inquiry / Let's Connect")}
                className="flex items-center gap-2 px-7 py-3 rounded-xl border border-[var(--border)] hover:border-indigo-500/50 text-[var(--foreground)] font-semibold text-sm transition-all duration-200 hover:bg-indigo-500/5"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail size={15} />
                Contact Me
              </motion.button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="flex items-center gap-3"
            >
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl glass border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-indigo-400 hover:border-indigo-500/50 transition-all duration-200"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon width={18} height={18} />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Profile photo ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center order-1 lg:order-2"
          >
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/20 blur-2xl" />

              {/* Spinning dashed ring */}
              <motion.div
                className="absolute -inset-3 rounded-full border-2 border-dashed border-indigo-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />

              {/* Solid accent ring */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-[var(--background)]" />
              </div>

              {/* Photo container */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-[var(--background)] bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
                {(data.profileImage || "/profile.jpg") && (
                  <Image
                    src={data.profileImage || "/profile.jpg"}
                    alt={data.name || "Profile"}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                )}
              </div>

              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border)] text-xs font-semibold whitespace-nowrap shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {data.statusBadge}
              </motion.div>

              {/* Floating badge — top right */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring", bounce: 0.4 }}
                className="absolute -top-2 -right-4 flex items-center gap-2 px-3 py-2 rounded-xl glass border border-[var(--border)] text-xs font-semibold shadow-lg"
              >
                <span className="text-indigo-400 text-base">⚡</span>
                {data.floatingBadge1}
              </motion.div>

              {/* Floating badge — bottom left */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring", bounce: 0.4 }}
                className="absolute -bottom-2 -left-6 flex items-center gap-2 px-3 py-2 rounded-xl glass border border-[var(--border)] text-xs font-semibold shadow-lg"
              >
                <span className="text-green-400 text-base">✦</span>
                {data.floatingBadge2}
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--muted)] text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span>Scroll down</span>
        <motion.div
          className="w-5 h-8 rounded-full border border-[var(--border)] flex items-start justify-center pt-1.5"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1 h-2 rounded-full bg-indigo-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
