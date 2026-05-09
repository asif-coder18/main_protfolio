"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Type, Palette, Monitor, Smartphone, Layout } from "lucide-react";
import { LogoPicker } from "@/components/admin/LogoPicker";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Icon } from "@iconify/react";

interface BrandSettings {
  _id?: string;
  brandName: string;
  logoType: "image" | "icon";
  logoImage: string;
  icon: string;
  logoSize: number;
  brandColor: string;
  logoText: string;
}

export default function BrandingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { toasts, removeToast, success, error } = useToast();
  const [settings, setSettings] = useState<BrandSettings>({
    brandName: "Abir.dev",
    logoType: "icon",
    logoImage: "",
    icon: "lucide:code-2",
    logoSize: 32,
    brandColor: "#8b5cf6",
    logoText: "Abir.dev",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/branding");
      const data = await res.json();
      if (data && !data.error) {
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        success("Success", "Branding settings updated successfully!");
      } else {
        error("Error", "Failed to update branding settings");
      }
    } catch (err) {
      error("Error", "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Site Branding</h1>
          <p className="text-gray-400 mt-1">Manage your website's logo, brand name, and identity.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Type className="text-indigo-400" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">General Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Brand Name</label>
                <input
                  type="text"
                  value={settings.brandName}
                  onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                  placeholder="e.g. Abir.dev"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Logo Text (Optional)</label>
                <input
                  type="text"
                  value={settings.logoText}
                  onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                  placeholder="e.g. Abir.dev"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Brand Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.brandColor}
                    onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                    className="w-12 h-12 bg-gray-950 border border-gray-800 rounded-xl cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={settings.brandColor}
                    onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Logo Size (px)</label>
                <input
                  type="number"
                  value={settings.logoSize}
                  onChange={(e) => setSettings({ ...settings, logoSize: parseInt(e.target.value) || 32 })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                  placeholder="32"
                />
              </div>
            </div>
          </div>

          {/* Logo Selection */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <ImageIcon className="text-purple-400" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">Logo Configuration</h2>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-gray-950 border border-gray-800 rounded-[2rem] flex flex-col items-center justify-center gap-6 text-center group transition-all hover:border-indigo-500/30">
                <div 
                  className="w-24 h-24 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105"
                  style={{ color: settings.logoType === "icon" ? settings.brandColor : "inherit" }}
                >
                  {settings.logoType === "icon" ? (
                    <Icon icon={settings.icon || "lucide:code-2"} width={48} height={48} />
                  ) : (
                    settings.logoImage ? (
                      <img src={settings.logoImage} alt="Logo" className="w-16 h-16 object-contain" />
                    ) : (
                      <ImageIcon size={48} className="text-gray-700" />
                    )
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Active Branding Logo</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    {settings.logoType === "icon" 
                      ? `Using Icon Library: ${settings.icon}`
                      : "Using Custom Uploaded Image"}
                  </p>
                </div>

                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  <Palette size={18} />
                  Change Logo
                </button>
              </div>

              {isPickerOpen && (
                <LogoPicker
                  selectedValue={settings.logoType === "icon" ? settings.icon : settings.logoImage}
                  selectedType={settings.logoType}
                  onSelect={(val, type) => {
                    setSettings({
                      ...settings,
                      logoType: type,
                      [type === "icon" ? "icon" : "logoImage"]: val
                    });
                  }}
                  onClose={() => setIsPickerOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="space-y-6">
          <div className="sticky top-8 space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Layout className="text-green-400" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-white">Live Preview</h2>
              </div>

              <div className="space-y-8">
                {/* Desktop Preview */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Monitor size={12} /> Desktop Navbar
                  </p>
                  <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.logoType === "icon" ? (
                        <div 
                          className="flex items-center justify-center rounded-lg"
                          style={{ color: settings.brandColor }}
                        >
                          <Icon icon={settings.icon} width={settings.logoSize} height={settings.logoSize} />
                        </div>
                      ) : (
                        settings.logoImage && (
                          <img 
                            src={settings.logoImage} 
                            alt="Logo" 
                            style={{ height: settings.logoSize, width: "auto" }} 
                            className="object-contain"
                          />
                        )
                      )}
                      <span className="text-lg font-bold text-white tracking-tight">
                        {settings.logoText || settings.brandName}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-2 bg-gray-800 rounded-full" />
                      <div className="w-12 h-2 bg-gray-800 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone size={12} /> Mobile Navbar
                  </p>
                  <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      {settings.logoType === "icon" ? (
                        <div 
                          className="flex items-center justify-center"
                          style={{ color: settings.brandColor }}
                        >
                          <Icon icon={settings.icon} width={settings.logoSize} height={settings.logoSize} />
                        </div>
                      ) : (
                        settings.logoImage && (
                          <img 
                            src={settings.logoImage} 
                            alt="Logo" 
                            style={{ height: settings.logoSize, width: "auto" }} 
                          />
                        )
                      )}
                      <span className="text-sm font-bold text-white">
                        {settings.logoText || settings.brandName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Preview */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div 
                    className="w-16 h-16 mx-auto rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-center shadow-2xl shadow-indigo-500/10"
                    style={{ color: settings.brandColor }}
                  >
                    {settings.logoType === "icon" ? (
                      <Icon icon={settings.icon} width={32} height={32} />
                    ) : (
                      settings.logoImage && <img src={settings.logoImage} alt="Logo" className="w-10 h-10 object-contain" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{settings.brandName}</h3>
                    <p className="text-sm text-gray-400">Personal Identity Branding</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
