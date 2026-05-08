"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
      }
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;
      }
      animId = requestAnimationFrame(animate);
    };

    const onMouseEnterLink = () => {
      if (ringRef.current) {
        ringRef.current.style.width = "40px";
        ringRef.current.style.height = "40px";
        ringRef.current.style.borderColor = "rgba(99,102,241,0.8)";
        ringRef.current.style.backgroundColor = "rgba(99,102,241,0.1)";
      }
    };

    const onMouseLeaveLink = () => {
      if (ringRef.current) {
        ringRef.current.style.width = "32px";
        ringRef.current.style.height = "32px";
        ringRef.current.style.borderColor = "rgba(99,102,241,0.5)";
        ringRef.current.style.backgroundColor = "transparent";
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    animId = requestAnimationFrame(animate);

    const addLinkListeners = () => {
      document
        .querySelectorAll("a, button, [role='button']")
        .forEach((el) => {
          el.addEventListener("mouseenter", onMouseEnterLink);
          el.addEventListener("mouseleave", onMouseLeaveLink);
        });
    };

    addLinkListeners();
    const observer = new MutationObserver(addLinkListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="custom-cursor w-2 h-2 rounded-full bg-indigo-500 transition-opacity duration-300"
        style={{ position: "fixed", top: 0, left: 0, zIndex: 99999, pointerEvents: "none" }}
        aria-hidden="true"
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="custom-cursor rounded-full border border-indigo-500/50 transition-all duration-150"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "32px",
          height: "32px",
          zIndex: 99998,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
    </>
  );
}
