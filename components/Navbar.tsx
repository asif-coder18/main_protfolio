"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, Code2 } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Icon } from "@iconify/react";

interface SectionConfig { id: string; label: string; order: number; visible: boolean; }

// Label overrides for navbar display (shorter names)
const NAV_LABEL: Record<string, string> = {
  hero: "Home", about: "About", skills: "Skills",
  projects: "Projects", experience: "Experience", contact: "Contact",
};

const DEFAULT_NAV = [
  { label: "Home",       href: "#hero" },
  { label: "About",      href: "#about" },
  { label: "Skills",     href: "#skills" },
  { label: "Projects",   href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact",    href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brand, setBrand] = useState<any>(null);
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Fetch branding and section order in parallel
    Promise.all([
      fetch("/api/branding").then(r => r.json()).catch(() => null),
      fetch("/api/section-settings").then(r => r.json()).catch(() => null),
    ]).then(([brandData, sections]) => {
      if (brandData && !brandData.error) setBrand(brandData);
      if (Array.isArray(sections) && sections.length > 0) {
        const ordered = (sections as SectionConfig[])
          .filter(s => s.visible)
          .sort((a, b) => a.order - b.order)
          .map(s => ({ label: NAV_LABEL[s.id] ?? s.label, href: `#${s.id}` }));
        setNavLinks(ordered);
      }
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string, subject?: string) => {
    setMobileOpen(false);
    if (href === "#contact" && subject) {
      window.dispatchEvent(new CustomEvent("set-contact-subject", { detail: subject }));
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass border-b border-[var(--border)] shadow-lg shadow-black/5"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#hero");
            }}
            className="flex items-center gap-2 font-bold text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className="rounded-lg flex items-center justify-center overflow-hidden"
              style={{ 
                width: brand?.logoSize ? brand.logoSize + 8 : 32, 
                height: brand?.logoSize ? brand.logoSize + 8 : 32,
                backgroundColor: brand?.logoType === "image" ? "transparent" : (brand?.brandColor || "#6366f1")
              }}
            >
              {brand?.logoType === "image" && brand?.logoImage ? (
                <img 
                  src={brand.logoImage} 
                  alt="Logo" 
                  style={{ height: brand.logoSize || 24, width: "auto" }} 
                  className="object-contain"
                />
              ) : (
                <Icon 
                  icon={brand?.icon || "lucide:code-2"} 
                  width={brand?.logoSize ? brand.logoSize - 8 : 16} 
                  height={brand?.logoSize ? brand.logoSize - 8 : 16} 
                  className="text-white" 
                />
              )}
            </div>
            <span className="gradient-text">{brand?.logoText || brand?.brandName || "Abir.dev"}</span>
          </motion.a>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <motion.button
                  onClick={() => handleNavClick(link.href)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                </motion.button>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* CTA */}
            <motion.button
              onClick={() => handleNavClick("#contact", "Hire Me / Project Inquiry")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hire Me
            </motion.button>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-b border-[var(--border)] shadow-xl md:hidden"
          >
            <ul className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all duration-200"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
              >
                <button
                  onClick={() => handleNavClick("#contact", "Hire Me / Project Inquiry")}
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors duration-200"
                >
                  Hire Me
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
