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
  MonitorPlay,
  Settings,
  LayoutList,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/branding", label: "Brand Settings", icon: Settings },
  { href: "/admin/sections", label: "Section Manager", icon: LayoutList },
  { href: "/admin/about", label: "About / Hero", icon: User },
  { href: "/admin/skills", label: "Skills", icon: Zap },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/contact", label: "Contact Info", icon: Mail },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/loader", label: "Loader Settings", icon: MonitorPlay },
  { href: "/admin/settings", label: "Account Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [brand, setBrand] = useState<any>(null);

  useEffect(() => {
    fetch("/api/branding")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setBrand(data);
      })
      .catch(console.error);
  }, []);

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-950 border-r border-gray-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300"
            style={{ 
              backgroundColor: brand?.brandColor ? `${brand.brandColor}20` : "#8b5cf620",
              color: brand?.brandColor || "#8b5cf6"
            }}
          >
            {brand?.logoType === "image" && brand?.logoImage ? (
              <img src={brand.logoImage} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              <Icon icon={brand?.icon || "lucide:code-2"} width={20} height={20} />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              {brand?.brandName || "Portfolio"}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-0.5">Admin Panel</p>
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
