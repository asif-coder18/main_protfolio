"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ToastContainer, useToast } from "@/components/admin/Toast";
import { Save, Plus, Trash2, Star, ExternalLink, Edit2, X } from "lucide-react";
import { GithubIcon } from "@/components/icons/SocialIcons";

interface Project {
  _id?: string;
  title: string;
  description: string;
  image: string;
  imageUrl: string;
  gradient: string;
  tags: string[];
  live: string;
  github: string;
  featured: boolean;
  stars: number;
  order: number;
}

const emptyProject = (): Project => ({
  title: "", description: "", image: "🚀", imageUrl: "",
  gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
  tags: [], live: "", github: "", featured: false, stars: 0, order: 0,
});

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all";
const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

function ProjectForm({ project, onSave, onCancel }: {
  project: Project; onSave: (p: Project) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(project);
  const [tagInput, setTagInput] = useState("");

  const set = (key: keyof Project, value: Project[keyof Project]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) { setForm((p) => ({ ...p, tags: [...p.tags, t] })); }
    setTagInput("");
  };

  return (
    <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-white text-sm">{form._id ? "Edit Project" : "New Project"}</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className={labelCls}>Project Title</label>
          <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="My Awesome Project" /></div>
        <div className="sm:col-span-2"><label className={labelCls}>Description</label>
          <textarea rows={3} className={`${inputCls} resize-none`} value={form.description}
            onChange={(e) => set("description", e.target.value)} placeholder="What does this project do?" /></div>
        <div><label className={labelCls}>Emoji Icon (when no image)</label>
          <input className={inputCls} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="🚀" /></div>
        <div><label className={labelCls}>Stars Count</label>
          <input type="number" className={inputCls} value={form.stars}
            onChange={(e) => set("stars", parseInt(e.target.value) || 0)} /></div>
        <div><label className={labelCls}>Live Demo URL</label>
          <input className={inputCls} value={form.live} onChange={(e) => set("live", e.target.value)} placeholder="https://..." /></div>
        <div><label className={labelCls}>GitHub URL</label>
          <input className={inputCls} value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/..." /></div>
        <div className="sm:col-span-2"><label className={labelCls}>Gradient Class (Tailwind)</label>
          <input className={inputCls} value={form.gradient} onChange={(e) => set("gradient", e.target.value)} /></div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelCls}>Technologies / Tags</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
              {tag}
              <button onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputCls} flex-1`} value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="Next.js → press Enter" />
          <button onClick={addTag} className="px-3 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 text-sm hover:bg-indigo-500/30 transition-colors">Add</button>
        </div>
      </div>

      {/* Image */}
      <ImageUpload label="Project Image" currentUrl={form.imageUrl} onUpload={(url) => set("imageUrl", url)} />

      {/* Featured + Order */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-500" />
          <span className="text-sm text-gray-300 flex items-center gap-1.5">
            <Star size={14} className="text-yellow-400" /> Featured Project
          </span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Order:</label>
          <input type="number" className="w-16 px-2 py-1.5 rounded-lg border border-gray-700 bg-gray-800/50 text-white text-sm focus:outline-none" 
            value={form.order} onChange={(e) => set("order", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors">
          <Save size={15} /> Save Project
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ProjectsAdminPage() {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (Array.isArray(json)) setProjects(json);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (project: Project) => {
    try {
      const url = project._id ? `/api/projects/${project._id}` : "/api/projects";
      const method = project._id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error();
      toast.success("Saved!", project._id ? "Project updated." : "Project created.");
      setEditing(null);
      setShowForm(false);
      load();
    } catch {
      toast.error("Error", "Could not save project.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      toast.success("Deleted", "Project removed.");
      load();
    } catch {
      toast.error("Error", "Could not delete project.");
    }
  };

  if (loading) return (
    <>
      <AdminTopbar title="Projects" subtitle="Manage your portfolio projects" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    </>
  );

  return (
    <>
      <AdminTopbar title="Projects" subtitle="Manage your portfolio projects" />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <main className="flex-1 p-6 max-w-5xl space-y-4">
        {/* Add new button */}
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/25">
            <Plus size={16} /> Add Project
          </button>
        )}

        {/* New project form */}
        {showForm && !editing && (
          <ProjectForm project={emptyProject()} onSave={handleSave}
            onCancel={() => setShowForm(false)} />
        )}

        {/* Project list */}
        <div className="space-y-3">
          {projects.map((project) =>
            editing?._id === project._id ? (
              <ProjectForm key={project._id} project={editing!} onSave={handleSave}
                onCancel={() => setEditing(null)} />
            ) : (
              <div key={project._id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex items-start gap-4 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                  {project.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={project.imageUrl} alt={project.title} className="w-full h-full rounded-xl object-cover" />
                    : project.image}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm truncate">{project.title}</h3>
                    {project.featured && <Star size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" />}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 4).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">{t}</span>
                    ))}
                    {project.tags.length > 4 && <span className="text-xs text-gray-500">+{project.tags.length - 4}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all">
                      <GithubIcon width={14} height={14} />
                    </a>
                  )}
                  <button onClick={() => setEditing(project)}
                    className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => project._id && handleDelete(project._id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          )}

          {projects.length === 0 && !showForm && (
            <div className="text-center py-16 text-gray-600">
              <FolderEmpty />
              <p className="text-sm mt-2">No projects yet. Add your first one!</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function FolderEmpty() {
  return (
    <svg className="w-12 h-12 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}
