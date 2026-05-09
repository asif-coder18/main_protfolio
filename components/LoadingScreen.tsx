"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Convert a raw CSS string like "background:#000;color:red;" into a React
// CSSProperties object so it can be used as an inline style prop.
function parseCssString(css: string): React.CSSProperties {
  if (!css) return {};
  return css
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce<React.CSSProperties>((acc, decl) => {
      const colon = decl.indexOf(":");
      if (colon === -1) return acc;
      const prop = decl.slice(0, colon).trim();
      const val  = decl.slice(colon + 1).trim();
      const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      return { ...acc, [camel]: val };
    }, {});
}

interface LoaderConfig {
  title: string;
  subtitle: string;
  subtitleColor: string;
  subtitleSize: string;
  subtitleWeight: string;
  imageUrl: string;
  loaderType: string;
  progressColor: string;
  bgGradient: string;
  imageShape: string;
  imageSize: number;
  duration: number;
  showProgressBar: boolean;
  showPercentage: boolean;
  allowSkip: boolean;
  customCss: string;
  template: string;
}

// Fallback config used when no active loader is found in the database
const FALLBACK: LoaderConfig = {
  title: "Asiful Maula Abir",
  subtitle: "Frontend Developer",
  subtitleColor: "#9ca3af",
  subtitleSize: "sm",
  subtitleWeight: "normal",
  imageUrl: "/profile.jpg",
  loaderType: "progress-bar",
  progressColor: "#8b5cf6",
  bgGradient: "",
  imageShape: "rounded-2xl",
  imageSize: 120,
  duration: 2000,
  showProgressBar: true,
  showPercentage: false,
  allowSkip: false,
  customCss: "",
  template: "default",
};

export function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cfg, setCfg] = useState<LoaderConfig>(FALLBACK);
  const [cfgReady, setCfgReady] = useState(false);

  // Fetch active loader config once on mount
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("portfolio-loaded");
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    fetch("/api/loader?active=true")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.title) setCfg({ ...FALLBACK, ...data });
      })
      .catch(() => {/* use fallback */})
      .finally(() => setCfgReady(true));
  }, []);

  // Start progress animation once config is ready (or after short timeout)
  useEffect(() => {
    if (!cfgReady) return;

    const speed = Math.max(cfg.duration, 500);
    // step size so we reach 100 in roughly `speed` ms at 80ms intervals
    const stepSize = (100 / (speed / 80)) * (0.8 + Math.random() * 0.4);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepSize + Math.random() * 3;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem("portfolio-loaded", "true");
          }, 300);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [cfgReady, cfg.duration]);

  const bgStyle =
    cfg.template === "glassmorphism"
      ? "bg-gray-900/60 backdrop-blur-xl"
      : cfg.template === "neon"
      ? "bg-black"
      : cfg.template === "minimal"
      ? "bg-gray-950"
      : "bg-[var(--background)]";

  const borderRadius =
    cfg.imageShape === "rounded-full"
      ? "9999px"
      : cfg.imageShape === "rounded-none"
      ? "0"
      : cfg.imageShape === "rounded-3xl"
      ? "1.5rem"
      : "1rem";

  const imageShadow = "0 20px 60px rgba(0,0,0,0.5)";

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center ${bgStyle}`}
          style={cfg.customCss ? parseCssString(cfg.customCss) : undefined}
        >
          {/* Background gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: cfg.bgGradient
                ? cfg.bgGradient
                : cfg.template === "minimal"
                ? "none"
                : `radial-gradient(ellipse 70% 60% at 50% 40%, #8b5cf61a 0%, transparent 70%)`,
            }}
          />

          {/* Neon glow ring */}
          {cfg.template === "neon" && (
            <div
              className="absolute pointer-events-none"
              style={{
                width: cfg.imageSize + 48,
                height: cfg.imageSize + 48,
                borderRadius,
                boxShadow: `0 0 60px 15px #8b5cf644`,
                border: `1px solid #8b5cf633`,
              }}
            />
          )}

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Profile image */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              style={{
                width: cfg.imageSize,
                height: cfg.imageSize,
                borderRadius,
                overflow: "hidden",
                boxShadow: imageShadow,
                flexShrink: 0,
              }}
            >
              {cfg.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cfg.imageUrl}
                  alt={cfg.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, #8b5cf6, #6366f1)`,
                    color: "#fff",
                    fontSize: "2rem",
                    fontWeight: 700,
                  }}
                >
                  {cfg.title.charAt(0)}
                </div>
              )}
            </motion.div>

            {/* Name + subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h1
                className="text-3xl font-bold mb-1"
                style={{ color: cfg.progressColor }}
              >
                {cfg.title}
              </h1>
              <p
                style={{
                  color: cfg.subtitleColor || "#9ca3af",
                  fontSize:
                    cfg.subtitleSize === "xs" ? "0.75rem"
                    : cfg.subtitleSize === "base" ? "1rem"
                    : cfg.subtitleSize === "lg" ? "1.125rem"
                    : "0.875rem",
                  fontWeight:
                    cfg.subtitleWeight === "medium" ? 500
                    : cfg.subtitleWeight === "semibold" ? 600
                    : 400,
                }}
              >
                {cfg.subtitle}
              </p>
            </motion.div>

            {/* Loading indicator */}
            {cfg.showProgressBar && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "200px" }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="relative"
              >
                {cfg.loaderType === "progress-bar" && (
                  <div>
                    <div className="w-48 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          background: `linear-gradient(90deg, #8b5cf6, #6366f1)`,
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    {cfg.showPercentage && (
                      <p className="text-xs text-[var(--muted)] text-center mt-1 tabular-nums">
                        {Math.round(Math.min(progress, 100))}%
                      </p>
                    )}
                    {!cfg.showPercentage && (
                      <motion.p
                        className="text-xs text-[var(--muted)] text-center mt-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Loading...
                      </motion.p>
                    )}
                  </div>
                )}

                {cfg.loaderType === "pulse" && (
                  <div className="flex justify-center">
                    <div
                      className="w-4 h-4 rounded-full animate-ping"
                      style={{ backgroundColor: "#8b5cf6" }}
                    />
                  </div>
                )}

                {cfg.loaderType === "spinner" && (
                  <div className="flex justify-center">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor: `#8b5cf644`,
                        borderTopColor: "#8b5cf6",
                      }}
                    />
                  </div>
                )}

                {cfg.loaderType === "dots" && (
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full animate-bounce"
                        style={{
                          backgroundColor: "#8b5cf6",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {cfg.loaderType === "percentage" && (
                  <p
                    className="text-center text-3xl font-bold tabular-nums"
                    style={{ color: "#8b5cf6" }}
                  >
                    {Math.round(Math.min(progress, 100))}%
                  </p>
                )}
              </motion.div>
            )}

            {/* Skip button */}
            {cfg.allowSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => {
                  setLoading(false);
                  sessionStorage.setItem("portfolio-loaded", "true");
                }}
                className="text-xs text-[var(--muted)] hover:text-white transition-colors"
              >
                Skip →
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
