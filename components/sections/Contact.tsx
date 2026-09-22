"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
  Clock,
  Link as LinkIcon
} from "lucide-react";
import { GithubIcon, LinkedinIcon, MailIcon } from "@/components/icons/SocialIcons";

type FormState = "idle" | "loading" | "success" | "error";

interface SocialLink {
  label: string;
  href: string;
  username: string;
  color: string;
  icon: string;
}

interface ContactInfoData {
  email: string;
  phone: string;
  address: string;
  responseTime: string;
  availableForWork: boolean;
  socialLinks: SocialLink[];
}

const defaultData: ContactInfoData = {
  email: "maulaasiful@gmail.com",
  phone: "",
  address: "Savar, Dhaka, Bangladesh",
  responseTime: "Usually responds within 24 hours",
  availableForWork: true,
  socialLinks: [
    { label: "GitHub", href: "https://github.com/asif-coder18", username: "@asif-coder18", color: "hover:text-gray-300", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/feed/", username: "Asiful Maula Abir", color: "hover:text-blue-400", icon: "linkedin" },
    { label: "Email", href: "mailto:maulaasiful@gmail.com", username: "maulaasiful@gmail.com", color: "hover:text-indigo-400", icon: "mail" },
  ],
};

function getIconComponent(iconName: string) {
  switch (iconName.toLowerCase()) {
    case "github": return GithubIcon;
    case "linkedin": return LinkedinIcon;
    case "mail": return MailIcon;
    default: return LinkIcon;
  }
}

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [data, setData] = useState<ContactInfoData>(defaultData);

  useEffect(() => {
    fetch("/api/contact-info")
      .then((r) => r.json())
      .then((json) => {
        if (json && (json.email || json.address)) {
          setData({ ...defaultData, ...json });
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const handleSetSubject = (e: any) => {
      if (e.detail) {
        setForm(prev => ({ ...prev, subject: e.detail }));
      }
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    window.addEventListener("set-contact-subject", handleSetSubject);
    return () => window.removeEventListener("set-contact-subject", handleSetSubject);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const resData = await res.json();

      if (!res.ok) {
        console.error(resData.error);
        setFormState("error");
        setTimeout(() => setFormState("idle"), 4000);
        return;
      }

      setFormState("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setFormState("idle"), 5000);
    } catch (err) {
      console.error("Submission error:", err);
      setFormState("error");
      setTimeout(() => setFormState("idle"), 4000);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted)] text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200";

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3 block">
            Contact
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Let&apos;s <span className="gradient-text">Work Together</span>
          </h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto text-lg">
            Have a project in mind or just want to say hi? My inbox is always open.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Quick info */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
              <h3 className="font-bold text-[var(--foreground)] text-lg">
                Get in touch
              </h3>
              <div className="space-y-3">
                {data.address && (
                  <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={14} className="text-indigo-400" />
                    </div>
                    {data.address}
                  </div>
                )}
                {data.responseTime && (
                  <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-indigo-400" />
                    </div>
                    {data.responseTime}
                  </div>
                )}
                {data.availableForWork && (
                  <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                    Available for new projects
                  </div>
                )}
              </div>
            </div>

            {/* Social links */}
            {data.socialLinks && data.socialLinks.length > 0 && (
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                <h3 className="font-bold text-[var(--foreground)] text-base mb-4">
                  Find me on
                </h3>
                {data.socialLinks.map((social, i) => {
                  const Icon = getIconComponent(social.icon);
                  return (
                    <motion.a
                      key={i}
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        social.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] text-[var(--muted)] ${social.color} hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 group`}
                      whileHover={{ x: 4 }}
                    >
                      <Icon
                        width={18}
                        height={18}
                        className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                      />
                      <div>
                        <div className="text-xs font-semibold text-[var(--foreground)]">
                          {social.label}
                        </div>
                        <div className="text-xs">{social.username}</div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <h3 className="font-bold text-[var(--foreground)] text-xl mb-6">
                Send a message
              </h3>

              {formState === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h4 className="text-xl font-bold text-[var(--foreground)]">
                    Message sent!
                  </h4>
                  <p className="text-[var(--muted)] text-sm max-w-xs">
                    Thanks for reaching out. I&apos;ll get back to you soon.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Subject name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-semibold text-[var(--muted)] mb-1.5 uppercase tracking-wide"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {formState === "error" && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle size={16} />
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={formState === "loading"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors duration-200"
                    whileHover={
                      formState !== "loading" ? { scale: 1.02, y: -1 } : {}
                    }
                    whileTap={formState !== "loading" ? { scale: 0.98 } : {}}
                  >
                    {formState === "loading" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
