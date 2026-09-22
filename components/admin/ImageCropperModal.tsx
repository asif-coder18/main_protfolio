"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop, Maximize, RefreshCw } from "lucide-react";

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number; // e.g. 16/9, 1/1, or undefined for free aspect ratio
}

const ASPECT_RATIOS = [
  { label: "Free", value: 0 },
  { label: "16:9 Banner", value: 16 / 9 },
  { label: "4:3 Standard", value: 4 / 3 },
  { label: "1:1 Square", value: 1 / 1 },
  { label: "3:4 Portrait", value: 3 / 4 },
];

export function ImageCropperModal({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio: initialAspectRatio = 0,
}: ImageCropperModalProps) {
  const [aspect, setAspect] = useState<number>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [saving, setSaving] = useState(false);

  // Initialize image natural dimensions
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  // Adjust crop box based on selected aspect ratio & container size
  const updateCropBox = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth: cw, clientHeight: ch } = containerRef.current;
    if (cw === 0 || ch === 0) return;

    let targetWidth = cw * 0.85;
    let targetHeight = ch * 0.85;

    if (aspect > 0) {
      if (targetWidth / targetHeight > aspect) {
        targetWidth = targetHeight * aspect;
      } else {
        targetHeight = targetWidth / aspect;
      }
    }

    const x = (cw - targetWidth) / 2;
    const y = (ch - targetHeight) / 2;
    setCropBox({ x, y, width: targetWidth, height: targetHeight });
  }, [aspect]);

  useEffect(() => {
    updateCropBox();
    window.addEventListener("resize", updateCropBox);
    return () => window.removeEventListener("resize", updateCropBox);
  }, [updateCropBox]);

  // Handle Mouse / Touch Dragging for Panning Image
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setPan({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset Adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setAspect(initialAspectRatio);
  };

  // Crop & Export Canvas to File
  const handleSaveCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;
    setSaving(true);

    try {
      const img = imageRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Container and crop box info
      const containerRect = containerRef.current.getBoundingClientRect();
      const cropRect = {
        left: cropBox.x,
        top: cropBox.y,
        width: cropBox.width,
        height: cropBox.height,
      };

      // Display size of image inside container before transforms
      const imgRect = img.getBoundingClientRect();

      // Output canvas dimensions proportional to crop area
      const scaleFactor = Math.max(1, imageNaturalSize.width / (imgRect.width || 1));
      const outWidth = Math.round(cropRect.width * scaleFactor);
      const outHeight = Math.round(cropRect.height * scaleFactor);

      canvas.width = outWidth;
      canvas.height = outHeight;

      // Fill transparent or dark background for padding if needed
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Translate context to center of output canvas for rotation/scaling
      ctx.save();
      ctx.translate(outWidth / 2, outHeight / 2);

      // Transform matching user's viewport pan/zoom/rotation
      const cropCenterX = cropRect.left + cropRect.width / 2;
      const cropCenterY = cropRect.top + cropRect.height / 2;
      const imgCenterX = (containerRect.width / 2) + pan.x;
      const imgCenterY = (containerRect.height / 2) + pan.y;

      const deltaX = (imgCenterX - cropCenterX) * scaleFactor;
      const deltaY = (imgCenterY - cropCenterY) * scaleFactor;

      ctx.translate(deltaX, deltaY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw image centered
      const drawW = imgRect.width * scaleFactor;
      const drawH = imgRect.height * scaleFactor;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();

      // Convert canvas to Blob (WEBP for max compression & quality)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.92)
      );

      if (!blob) throw new Error("Canvas export failed");

      const croppedFile = new File([blob], `cropped-${Date.now()}.webp`, {
        type: "image/webp",
      });

      onCropComplete(croppedFile);
    } catch (err) {
      console.error("Crop save failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Crop size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Crop & Adjust Image</h3>
              <p className="text-xs text-gray-400">Drag to reposition, zoom or select aspect ratio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-full border border-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div className="px-6 py-3 border-b border-gray-800 bg-gray-900/30 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1.5 shrink-0">
            <Maximize size={14} /> Aspect:
          </span>
          {ASPECT_RATIOS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setAspect(item.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                aspect === item.value
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Workspace Viewport */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className="relative flex-1 min-h-[380px] bg-black/60 overflow-hidden cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
        >
          {/* Base Image with transforms */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source for crop"
            onLoad={onImageLoad}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              maxHeight: "75vh",
              maxWidth: "85%",
              objectFit: "contain",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            className="pointer-events-none select-none max-w-full max-h-full"
          />

          {/* Dark Overlay with cutout for Crop Box */}
          {imageLoaded && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Top mask */}
              <div
                className="absolute bg-black/65 backdrop-blur-[1px]"
                style={{ top: 0, left: 0, right: 0, height: cropBox.y }}
              />
              {/* Bottom mask */}
              <div
                className="absolute bg-black/65 backdrop-blur-[1px]"
                style={{
                  top: cropBox.y + cropBox.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              {/* Left mask */}
              <div
                className="absolute bg-black/65 backdrop-blur-[1px]"
                style={{
                  top: cropBox.y,
                  left: 0,
                  width: cropBox.x,
                  height: cropBox.height,
                }}
              />
              {/* Right mask */}
              <div
                className="absolute bg-black/65 backdrop-blur-[1px]"
                style={{
                  top: cropBox.y,
                  left: cropBox.x + cropBox.width,
                  right: 0,
                  height: cropBox.height,
                }}
              />

              {/* Highlighted Crop Box Boundary */}
              <div
                className="absolute border-2 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] rounded-lg transition-all duration-150"
                style={{
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.width,
                  height: cropBox.height,
                }}
              >
                {/* Rule of Thirds Grid Lines */}
                <div className="w-full h-full relative opacity-30">
                  <div className="absolute left-1/3 top-0 bottom-0 border-l border-white border-dashed" />
                  <div className="absolute left-2/3 top-0 bottom-0 border-l border-white border-dashed" />
                  <div className="absolute top-1/3 left-0 right-0 border-t border-white border-dashed" />
                  <div className="absolute top-2/3 left-0 right-0 border-t border-white border-dashed" />
                </div>

                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-indigo-400" />
              </div>
            </div>
          )}
        </div>

        {/* Adjustments & Controls Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Zoom & Rotation controls */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 border border-gray-800 rounded-xl">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
                className="text-gray-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 accent-indigo-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="text-gray-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <span className="text-[11px] font-mono font-semibold text-indigo-400 ml-1">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
              title="Rotate 90°"
            >
              <RotateCw size={14} />
              Rotate
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
              title="Reset Adjustments"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Crop & Save Image
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
