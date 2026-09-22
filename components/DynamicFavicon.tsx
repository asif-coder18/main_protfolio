"use client";

import { useEffect } from "react";

interface DynamicFaviconProps {
  initialFavicon?: string;
}

export function DynamicFavicon({ initialFavicon }: DynamicFaviconProps) {
  useEffect(() => {
    const updateFavicon = (url: string) => {
      if (!url) return;

      // Find or create link[rel="icon"]
      let link: HTMLLinkElement | null = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = url;

      // Also set link[rel="shortcut icon"]
      let shortcutLink: HTMLLinkElement | null = document.querySelector("link[rel='shortcut icon']");
      if (!shortcutLink) {
        shortcutLink = document.createElement("link");
        shortcutLink.rel = "shortcut icon";
        document.head.appendChild(shortcutLink);
      }
      shortcutLink.href = url;
    };

    if (initialFavicon) {
      updateFavicon(initialFavicon);
    } else {
      fetch("/api/branding")
        .then((res) => res.json())
        .then((data) => {
          if (data?.favicon) {
            updateFavicon(data.favicon);
          }
        })
        .catch(() => {});
    }
  }, [initialFavicon]);

  return null;
}
