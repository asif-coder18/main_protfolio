"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon, FileText, Crop, Sparkles } from "lucide-react";
import { ImageCropperModal } from "./ImageCropperModal";

interface ImageUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
  aspectRatio?: number;
}

// Client-side image compression helper for non-cropped or fallback uploads
async function optimizeImageFile(file: File, maxWidth = 2560, quality = 0.9): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: "image/webp",
            });
            resolve(optimizedFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  currentUrl,
  onUpload,
  accept = "image/*",
  label = "Upload Image",
  aspectRatio,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const [error, setError] = useState("");

  // Cropper Modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

  useEffect(() => {
    setPreview(currentUrl || "");
  }, [currentUrl]);

  const uploadFileToServer = async (file: File) => {
    setError("");
    setUploading(true);

    try {
      // Auto-compress large images if needed
      const fileToUpload = await optimizeImageFile(file);

      const formData = new FormData();
      formData.append("file", fileToUpload);

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

  const handleSelectFile = (file: File) => {
    const isImg = file.type.startsWith("image/") && file.type !== "image/svg+xml";

    if (isImg) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropperSrc(e.target?.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      uploadFileToServer(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleSelectFile(file);
  };

  const isImage = accept.includes("image");

  const openCropperForPreview = () => {
    if (preview) {
      setCropperSrc(preview);
      setCropperOpen(true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
        <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
          <Sparkles size={11} /> Any size · Auto-optimized
        </span>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-700 rounded-xl p-5 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-200 group"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-indigo-400 font-medium">Uploading & Optimizing...</p>
          </div>
        ) : preview ? (
          <div className="relative group/img flex flex-col items-center">
            {isImage ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-950/50 max-h-48 w-full flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="max-h-44 rounded-lg object-contain" />

                {/* Hover overlay action buttons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCropperForPreview();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
                  >
                    <Crop size={14} /> Crop & Adjust
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-gray-700 transition-transform active:scale-95"
                  >
                    <Upload size={14} /> Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-indigo-400 py-4">
                <FileText size={24} />
                <span className="text-sm truncate max-w-48">{preview.split("/").pop()}</span>
              </div>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview("");
                onUpload("");
              }}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-600 flex items-center justify-center shadow-lg border border-red-400/30 transition-colors z-10"
              title="Remove file"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-indigo-400 transition-colors py-2">
            {isImage ? (
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <ImageIcon size={24} />
              </div>
            ) : (
              <Upload size={28} />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                Click or drag file to upload
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Supports high resolution photos & files</p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleSelectFile(f);
            // Reset value so same file can be selected again
            e.target.value = "";
          }}
        />
      </div>

      {/* Manual URL input */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 shrink-0">or enter URL:</span>
        <input
          type="text"
          value={preview}
          onChange={(e) => {
            setPreview(e.target.value);
            onUpload(e.target.value);
          }}
          placeholder="https://..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-950 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/60 transition-colors"
        />
      </div>

      {error && <p className="text-xs font-semibold text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

      {/* Interactive Image Cropper Modal */}
      {cropperOpen && cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          aspectRatio={aspectRatio}
          onCropComplete={(croppedFile) => {
            setCropperOpen(false);
            setCropperSrc(null);
            uploadFileToServer(croppedFile);
          }}
          onCancel={() => {
            setCropperOpen(false);
            setCropperSrc(null);
          }}
        />
      )}
    </div>
  );
}
