"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";

interface ImageUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
}

export function ImageUpload({ currentUrl, onUpload, accept = "image/*", label = "Upload Image" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setPreview(data.url);
      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const isImage = accept.includes("image");

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-200 group"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Uploading...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="flex items-center justify-center gap-2 text-indigo-400">
                <FileText size={24} />
                <span className="text-sm truncate max-w-48">{preview.split("/").pop()}</span>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreview(""); onUpload(""); }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-indigo-400 transition-colors">
            {isImage ? <ImageIcon size={28} /> : <Upload size={28} />}
            <p className="text-sm font-medium">Click or drag to upload</p>
            <p className="text-xs">Max 5MB · {accept}</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* Manual URL input */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">or enter URL:</span>
        <input
          type="text"
          value={preview}
          onChange={(e) => { setPreview(e.target.value); onUpload(e.target.value); }}
          placeholder="https://..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-900 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/60 transition-colors"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
