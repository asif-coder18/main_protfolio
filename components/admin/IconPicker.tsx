"use client";

import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Search, X, Check } from "lucide-react";

const TECH_ICONS = [
  { name: "HTML5", icon: "logos:html-5" },
  { name: "CSS3", icon: "logos:css-3" },
  { name: "JavaScript", icon: "logos:javascript" },
  { name: "TypeScript", icon: "logos:typescript-icon" },
  { name: "React", icon: "logos:react" },
  { name: "Next.js", icon: "logos:nextjs-icon" },
  { name: "Node.js", icon: "logos:nodejs-icon" },
  { name: "Express", icon: "logos:express" },
  { name: "MongoDB", icon: "logos:mongodb-icon" },
  { name: "PostgreSQL", icon: "logos:postgresql" },
  { name: "Firebase", icon: "logos:firebase" },
  { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
  { name: "Bootstrap", icon: "logos:bootstrap" },
  { name: "Python", icon: "logos:python" },
  { name: "Java", icon: "logos:java" },
  { name: "PHP", icon: "logos:php" },
  { name: "Laravel", icon: "logos:laravel" },
  { name: "Git", icon: "logos:git-icon" },
  { name: "GitHub", icon: "logos:github-icon" },
  { name: "Docker", icon: "logos:docker-icon" },
  { name: "AWS", icon: "logos:aws" },
  { name: "Figma", icon: "logos:figma" },
  { name: "Linux", icon: "logos:linux-tux" },
  { name: "C", icon: "logos:c" },
  { name: "C++", icon: "logos:c-plusplus" },
  { name: "C#", icon: "logos:c-sharp" },
  { name: "Kotlin", icon: "logos:kotlin-icon" },
  { name: "Swift", icon: "logos:swift" },
  { name: "Vue", icon: "logos:vue" },
  { name: "Angular", icon: "logos:angular-icon" },
  { name: "Redux", icon: "logos:redux" },
  { name: "GraphQL", icon: "logos:graphql" },
  { name: "Prisma", icon: "logos:prisma" },
  { name: "VS Code", icon: "logos:visual-studio-code" },
  { name: "MySQL", icon: "logos:mysql" },
  { name: "Redis", icon: "logos:redis" },
  { name: "Sass", icon: "logos:sass" },
  { name: "Gatsby", icon: "logos:gatsby" },
  { name: "Netlify", icon: "logos:netlify-icon" },
  { name: "Vercel", icon: "logos:vercel-icon" },
  { name: "Azure", icon: "logos:microsoft-azure" },
  { name: "Kubernetes", icon: "logos:kubernetes" },
  { name: "Rust", icon: "logos:rust" },
  { name: "Go", icon: "logos:go" },
  { name: "Django", icon: "logos:django-icon" },
  { name: "Flutter", icon: "logos:flutter" },
  { name: "Dart", icon: "logos:dart" },
  { name: "Ruby", icon: "logos:ruby" },
  { name: "Rails", icon: "logos:rails" },
  { name: "Wordpress", icon: "logos:wordpress-icon" },
  { name: "Shopify", icon: "logos:shopify" },
  { name: "Postman", icon: "logos:postman-icon" },
  { name: "Trello", icon: "logos:trello" },
  { name: "Jira", icon: "logos:jira" },
  { name: "Slack", icon: "logos:slack-icon" },
];

interface IconPickerProps {
  onSelect: (icon: string) => void;
  onClose: () => void;
  selectedIcon?: string;
  title?: string;
}

export function IconPicker({ onSelect, onClose, selectedIcon, title = "Select Icon" }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    return TECH_ICONS.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-gray-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              placeholder="Search technology icon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredIcons.map((item) => {
                const isSelected = selectedIcon === item.icon;
                return (
                  <button
                    key={item.icon}
                    onClick={() => {
                      onSelect(item.icon);
                      onClose();
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all group ${
                      isSelected 
                        ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/50" 
                        : "bg-gray-800/20 border-gray-800 hover:border-gray-700 hover:bg-gray-800/40"
                    }`}
                  >
                    <div className="relative mb-2">
                      <Icon icon={item.icon} className="w-10 h-10 transition-transform group-hover:scale-110" />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-white text-center line-clamp-1">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Icon icon="lucide:search-x" className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">No icons found for "{search}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/50 text-[10px] text-gray-600 flex justify-between items-center">
          <span>Powered by Iconify Logos</span>
          <span>{filteredIcons.length} icons available</span>
        </div>
      </div>
    </div>
  );
}
