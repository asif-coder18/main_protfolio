"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Save, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

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

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all";
const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

export default function ContactAdminPage() {
  const toast = useToast();
  const [data, setData] = useState<ContactInfoData>(defaultData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/contact-info");
      const json = await res.json();
      if (json && (json.email || json.address)) setData({ ...defaultData, ...json });
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: keyof ContactInfoData, val: ContactInfoData[keyof ContactInfoData]) =>
    setData((p) => ({ ...p, [key]: val }));

  const updateLink = (i: number, key: keyof SocialLink, val: string) =>
    setData((p) => {
      const links = [...p.socialLinks];
      links[i] = { ...links[i], [key]: val };
      return { ...p, socialLinks: links };
    });

  const addLink = () =>
    setData((p) => ({
      ...p,
      socialLinks: [...p.socialLinks, { label: "", href: "", username: "", color: "hover:text-indigo-400", icon: "link" }],
    }));

  const removeLink = (i: number) =>
    setData((p) => ({ ...p, socialLinks: p.socialLinks.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/contact-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Saved!", "Contact info updated successfully.");
    } catch {
      toast.error("Save failed", "Could not update contact info.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <AdminTopbar title="Contact Info" subtitle="Manage your contact details & social links" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    </>
  );

  return (
    <>
      <AdminTopbar title="Contact Info" subtitle="Manage your contact details & social links" />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <main className="flex-1 p-6 max-w-3xl space-y-6">

        {/* Basic contact info */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Contact Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email Address</label>
              <input className={inputCls} type="email" value={data.email}
                onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input className={inputCls} type="tel" value={data.phone}
                onChange={(e) => set("phone", e.target.value)} placeholder="+880 ..." />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Address</label>
              <input className={inputCls} value={data.address}
                onChange={(e) => set("address", e.target.value)} placeholder="City, Country" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Response Time Text</label>
              <input className={inputCls} value={data.responseTime}
                onChange={(e) => set("responseTime", e.target.value)}
                placeholder="Usually responds within 24 hours" />
            </div>
          </div>

          {/* Available toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-700 bg-gray-800/30">
            <div>
              <p className="text-sm font-medium text-white">Available for New Projects</p>
              <p className="text-xs text-gray-500">Shows the availability status in the contact section</p>
            </div>
            <button type="button" onClick={() => set("availableForWork", !data.availableForWork)}
              className={`transition-colors ${data.availableForWork ? "text-green-400" : "text-gray-600"}`}>
              {data.availableForWork ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-3">Social Links</h2>
          <div className="space-y-3">
            {data.socialLinks.map((link, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Link {i + 1}</span>
                  <button onClick={() => removeLink(i)}
                    className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Label (e.g. GitHub)</label>
                    <input className={inputCls} value={link.label}
                      onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="GitHub" />
                  </div>
                  <div>
                    <label className={labelCls}>Display Username</label>
                    <input className={inputCls} value={link.username}
                      onChange={(e) => updateLink(i, "username", e.target.value)} placeholder="@username" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>URL</label>
                    <input className={inputCls} value={link.href}
                      onChange={(e) => updateLink(i, "href", e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className={labelCls}>Icon (github / linkedin / mail / twitter)</label>
                    <input className={inputCls} value={link.icon}
                      onChange={(e) => updateLink(i, "icon", e.target.value)} placeholder="github" />
                  </div>
                  <div>
                    <label className={labelCls}>Hover Color Class</label>
                    <input className={inputCls} value={link.color}
                      onChange={(e) => updateLink(i, "color", e.target.value)} placeholder="hover:text-blue-400" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addLink}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-700 hover:border-indigo-500/50 text-gray-500 hover:text-indigo-400 transition-all w-full justify-center text-sm font-medium">
              <Plus size={16} /> Add Social Link
            </button>
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end pb-6">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/25">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </>
  );
}
