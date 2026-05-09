"use client";

import { useState, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { Search, X, Check, Upload, Image as ImageIcon, Laptop, Monitor } from "lucide-react";

const TECH_ICONS = [
  { name: "Code", icon: "lucide:code-2" },
  { name: "Terminal", icon: "lucide:terminal" },
  { name: "Cpu", icon: "lucide:cpu" },
  { name: "Globe", icon: "lucide:globe" },
  { name: "Activity", icon: "lucide:activity" },
  { name: "Layers", icon: "lucide:layers" },
  { name: "Zap", icon: "lucide:zap" },
  { name: "Box", icon: "lucide:box" },
  { name: "Command", icon: "lucide:command" },
  { name: "Mouse", icon: "lucide:mouse-pointer-2" },
  { name: "Database", icon: "lucide:database" },
  { name: "Server", icon: "lucide:server" },
  { name: "HTML5", icon: "logos:html-5" },
  { name: "React", icon: "logos:react" },
  { name: "Next.js", icon: "logos:nextjs-icon" },
  { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
  { name: "JavaScript", icon: "logos:javascript" },
  { name: "TypeScript", icon: "logos:typescript-icon" },
  { name: "Node.js", icon: "logos:nodejs-icon" },
  { name: "Python", icon: "logos:python" },
];

interface LogoPickerProps {
  onSelect: (value: string, type: "icon" | "image") => void;
  onClose: () => void;
  selectedValue?: string;
  selectedType?: "icon" | "image";
}

export function LogoPicker({ onSelect, onClose, selectedValue, selectedType }: LogoPickerProps) {
  const [activeTab, setActiveTab] = useState<"icon" | "upload">(selectedType === "image" ? "upload" : "icon");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredIcons = useMemo(() => {
    return TECH_ICONS.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, SVG, WEBP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File size too large (max 2MB)");
      return;
    }

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      onSelect(data.url, "image");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gray-950 border border-gray-800 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">Select Logo</h3>
            <p className="text-xs text-gray-500">Choose an icon or upload your own brand logo</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-gray-900 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-all border border-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-6">
          <div className="flex p-1.5 bg-gray-900/50 border border-gray-800 rounded-2xl w-full">
            <button
              onClick={() => setActiveTab("icon")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "icon" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:text-white"
              }`}
            >
              <Monitor size={16} />
              Icon Library
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "upload" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:text-white"
              }`}
            >
              <Upload size={16} />
              Custom Upload
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          {activeTab === "icon" ? (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  autoFocus
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-800 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  placeholder="Search brand icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {filteredIcons.map((item) => {
                  const isSelected = selectedValue === item.icon && selectedType === "icon";
                  return (
                    <button
                      key={item.icon}
                      onClick={() => {
                        onSelect(item.icon, "icon");
                        onClose();
                      }}
                      className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all group relative ${
                        isSelected 
                          ? "bg-indigo-500/10 border-indigo-500/50 ring-2 ring-indigo-500/20" 
                          : "bg-gray-900/30 border-gray-800 hover:border-gray-700 hover:bg-gray-900/60"
                      }`}
                    >
                      <div className="mb-3">
                        <Icon icon={item.icon} className={`w-10 h-10 transition-transform group-hover:scale-110 ${isSelected ? "text-indigo-400" : "text-gray-400"}`} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-indigo-400" : "text-gray-500"} text-center truncate w-full`}>
                        {item.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-indigo-500 text-white rounded-full p-0.5">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${
                  uploading ? "border-indigo-500/50 bg-indigo-500/5 cursor-wait" : "border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png,image/jpeg,image/svg+xml,image/webp" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                {uploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-white">Uploading Logo...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/10">
                      <Upload size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-white">Upload Custom Logo</p>
                      <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                    </div>
                    <div className="flex gap-2">
                      {["PNG", "JPG", "SVG", "WEBP"].map(type => (
                        <span key={type} className="px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg text-[10px] font-bold text-gray-500">{type}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {selectedType === "image" && selectedValue && (
                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center">
                    <img src={selectedValue} alt="Current Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Currently active logo</p>
                    <p className="text-[10px] text-gray-500 truncate">{selectedValue}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                  <X size={16} />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-900 bg-gray-950/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Premium Branding System</span>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all border border-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
