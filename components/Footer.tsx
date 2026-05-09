"use client";

import { motion } from "framer-motion";
import { Code2, Heart, ArrowUp, Mail, Link as LinkIcon } from "lucide-react";
import { GithubIcon, LinkedinIcon, MailIcon } from "@/components/icons/SocialIcons";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface SocialLink {
  label: string;
  href: string;
  username: string;
  color: string;
  icon: string;
}

interface ContactInfoData {
  socialLinks: SocialLink[];
}

function getIconComponent(iconName: string) {
  switch (iconName.toLowerCase()) {
    case "github": return GithubIcon;
    case "linkedin": return LinkedinIcon;
    case "mail": return MailIcon;
    default: return LinkIcon;
  }
}

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

const defaultSocial = [
  { icon: "github", href: "https://github.com/asif-coder18", label: "GitHub" },
  { icon: "linkedin", href: "https://www.linkedin.com/feed/", label: "LinkedIn" },
  { icon: "mail", href: "mailto:maulaasiful@gmail.com", label: "Email" },
];

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<any[]>(defaultSocial);
  const [brand, setBrand] = useState<any>(null);

  useEffect(() => {
    fetch("/api/contact-info")
      .then((r) => r.json())
      .then((json) => {
        if (json && json.socialLinks && json.socialLinks.length > 0) {
          setSocialLinks(json.socialLinks);
        }
      })
      .catch(() => { });

    fetch("/api/branding")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setBrand(data);
      })
      .catch(console.error);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="rounded-lg flex items-center justify-center overflow-hidden"
                style={{ 
                  width: 32, 
                  height: 32,
                  backgroundColor: brand?.logoType === "image" ? "transparent" : (brand?.brandColor || "#6366f1")
                }}
              >
                {brand?.logoType === "image" && brand?.logoImage ? (
                  <img 
                    src={brand.logoImage} 
                    alt="Logo" 
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  <Icon 
                    icon={brand?.icon || "lucide:code-2"} 
                    width={16} 
                    height={16} 
                    className="text-white" 
                  />
                )}
              </div>
              <span className="font-bold text-lg gradient-text">{brand?.logoText || brand?.brandName || "Abir.dev"}</span>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              Frontend developer crafting fast, responsive, and user-friendly
              web applications with Next.js and modern technologies.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm text-[var(--muted)] hover:text-indigo-400 transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-4">
              Connect
            </h4>
            <div className="flex flex-col gap-2">
              {socialLinks.map((social, i) => {
                const Icon = getIconComponent(social.icon || social.label);
                return (
                  <a
                    key={i}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      social.href.startsWith("http") ? "noopener noreferrer" : undefined
                    }
                    className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-indigo-400 transition-colors duration-200 group"
                  >
                    <Icon
                      width={14}
                      height={14}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                    {social.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] flex items-center gap-1.5">
            © {new Date().getFullYear()} Asiful Maula Abir. Built with{" "}
            <Heart size={12} className="text-red-400 fill-red-400" /> using
            Next.js & Tailwind CSS
          </p>

          <motion.button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--muted)] hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp size={12} />
            Back to top
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
