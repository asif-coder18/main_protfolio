"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Eye, EyeOff, Lock, User, ShieldCheck, Save, LogOut } from "lucide-react";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all";
const labelCls =
  "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("Passwords don't match", "New password and confirmation must be identical.");
      return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      toast.error("Password too short", "Minimum 6 characters required.");
      return;
    }
    if (!form.newUsername && !form.newPassword) {
      toast.warning("Nothing to change", "Enter a new username or password.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newUsername: form.newUsername || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Wrong password", "Current password is incorrect.");
        return;
      }
      if (!res.ok) {
        toast.error("Update failed", data.error || "Could not update credentials.");
        return;
      }

      toast.success("Credentials updated!", "You'll be logged out in 2 seconds.");
      setForm({ currentPassword: "", newUsername: "", newPassword: "", confirmPassword: "" });

      // Log out so the new credentials take effect
      setTimeout(async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }, 2000);
    } catch {
      toast.error("Error", "Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <AdminTopbar title="Account Settings" subtitle="Change your login credentials" />

      <main className="flex-1 p-6 max-w-xl">
        <div className="space-y-6">
          {/* Header card */}
          <div className="flex items-center gap-4 p-5 bg-gray-900 border border-gray-800 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Login Credentials</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your admin username and password. You'll be logged out after saving.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">

            {/* Current password — always required */}
            <div>
              <label className={labelCls}>Current Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={form.currentPassword}
                  onChange={(e) => set("currentPassword", e.target.value)}
                  placeholder="Enter current password"
                  className={`${inputCls} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* New username */}
            <div>
              <label className={labelCls}>New Username <span className="text-gray-600">(optional)</span></label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={form.newUsername}
                  onChange={(e) => set("newUsername", e.target.value)}
                  placeholder="Leave blank to keep current"
                  className={`${inputCls} pl-9`}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* New password */}
            <div>
              <label className={labelCls}>New Password <span className="text-gray-600">(optional)</span></label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showNew ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => set("newPassword", e.target.value)}
                  placeholder="Leave blank to keep current"
                  className={`${inputCls} pl-9 pr-10`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.newPassword && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        form.newPassword.length >= i * 3
                          ? form.newPassword.length >= 10
                            ? "bg-green-500"
                            : form.newPassword.length >= 6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          : "bg-gray-700"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {form.newPassword.length < 6
                      ? "Too short"
                      : form.newPassword.length < 10
                      ? "Fair"
                      : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm new password */}
            {form.newPassword && (
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="Repeat new password"
                    className={`${inputCls} pl-9 pr-10 ${
                      form.confirmPassword && form.confirmPassword !== form.newPassword
                        ? "border-red-500/50 focus:border-red-500/60"
                        : form.confirmPassword && form.confirmPassword === form.newPassword
                        ? "border-green-500/50 focus:border-green-500/60"
                        : ""
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                )}
                {form.confirmPassword && form.confirmPassword === form.newPassword && (
                  <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
                )}
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
              <LogOut size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-500/80">
                After saving, you'll be automatically logged out and redirected to the login page.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving || !form.currentPassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
