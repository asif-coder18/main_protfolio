"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Zap,
  FolderKanban,
  Briefcase,
  Mail,
  MessageSquare,
  ChevronRight,
  Code2,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/about", label: "About / Hero", icon: User },
  { href: "/admin/skills", label: "Skills", icon: Zap },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/contact", label: "Contact Info", icon: Mail },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-950 border-r border-gray-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Code2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Portfolio</p>
            <p className="text-xs text-gray-500 leading-tight">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60 border border-transparent"
              }`}
            >
              <Icon size={16} className={active ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 transition-all duration-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          View Portfolio →
        </Link>
      </div>
    </aside>
  );
}
