"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Bell, Menu, X } from "lucide-react";

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
}

export function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-gray-950/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-sm font-bold text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 leading-tight">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 disabled:opacity-50"
        >
          <LogOut size={14} />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
