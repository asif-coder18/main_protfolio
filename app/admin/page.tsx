"use client";

import { useEffect, useState } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import {
  User, Zap, FolderKanban, Briefcase, Mail, MessageSquare,
  TrendingUp, ArrowUpRight, ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  projects: number;
  skills: number;
  experience: number;
  messages: number;
  unread: number;
}

const sections = [
  { label: "About / Hero", desc: "Name, bio, photo, social links", href: "/admin/about", icon: User, color: "indigo" },
  { label: "Skills", desc: "Tech stack & proficiency levels", href: "/admin/skills", icon: Zap, color: "purple" },
  { label: "Projects", desc: "Portfolio projects & links", href: "/admin/projects", icon: FolderKanban, color: "pink" },
  { label: "Experience", desc: "Work history & education", href: "/admin/experience", icon: Briefcase, color: "blue" },
  { label: "Contact Info", desc: "Email, address, social URLs", href: "/admin/contact", icon: Mail, color: "green" },
  { label: "Messages", desc: "Contact form submissions", href: "/admin/messages", icon: MessageSquare, color: "yellow" },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ projects: 0, skills: 0, experience: 0, messages: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [projects, skills, experience, messages] = await Promise.all([
          fetch("/api/projects").then((r) => r.json()),
          fetch("/api/skills").then((r) => r.json()),
          fetch("/api/experience").then((r) => r.json()),
          fetch("/api/messages").then((r) => r.json()),
        ]);
        setStats({
          projects: Array.isArray(projects) ? projects.length : 0,
          skills: skills?.categories?.length ?? 0,
          experience: Array.isArray(experience) ? experience.length : 0,
          messages: Array.isArray(messages) ? messages.length : 0,
          unread: Array.isArray(messages) ? messages.filter((m: { read: boolean }) => !m.read).length : 0,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <>
      <AdminTopbar title="Dashboard" subtitle="Welcome back! Manage your portfolio content below." />
      <main className="flex-1 p-6 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Projects", value: stats.projects, icon: FolderKanban, color: "indigo" },
            { label: "Skill Groups", value: stats.skills, icon: Zap, color: "purple" },
            { label: "Experiences", value: stats.experience, icon: Briefcase, color: "blue" },
            { label: "Messages", value: stats.messages, badge: stats.unread > 0 ? `${stats.unread} new` : undefined, icon: MessageSquare, color: "green" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[stat.color]}`}>
                    <Icon size={16} />
                  </div>
                  {stat.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  {loading ? <span className="w-8 h-7 bg-gray-700 rounded animate-pulse inline-block" /> : stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Manage Sections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group bg-gray-900 border border-gray-800 hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[section.color]}`}>
                      <Icon size={18} />
                    </div>
                    <ArrowUpRight size={16} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                    {section.label}
                  </h3>
                  <p className="text-xs text-gray-500">{section.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* View portfolio */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white mb-1">Your Portfolio is Live</h3>
            <p className="text-sm text-gray-400">Changes you make here are reflected on your public site instantly.</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors flex-shrink-0"
          >
            <ExternalLink size={14} />
            View Site
          </Link>
        </div>

      </main>
    </>
  );
}
