"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";

interface SectionConfig {
  id: string;
  label: string;
  order: number;
  visible: boolean;
}

// Default order — used before API responds (avoids layout shift)
const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "hero",       label: "Hero",       order: 0, visible: true },
  { id: "about",      label: "About",      order: 1, visible: true },
  { id: "skills",     label: "Skills",     order: 2, visible: true },
  { id: "projects",   label: "Projects",   order: 3, visible: true },
  { id: "experience", label: "Experience", order: 4, visible: true },
  { id: "contact",    label: "Contact",    order: 5, visible: true },
];

const SECTION_MAP: Record<string, React.ComponentType> = {
  hero:       Hero,
  about:      About,
  skills:     Skills,
  projects:   Projects,
  experience: Experience,
  contact:    Contact,
};

export function DynamicSections() {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    fetch("/api/section-settings")
      .then((r) => r.json())
      .then((data: SectionConfig[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSections(data.sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => {
        // Keep defaults on error — site never breaks
      });
  }, []);

  return (
    <>
      {sections
        .filter((s) => s.visible)
        .map((s) => {
          const Component = SECTION_MAP[s.id];
          if (!Component) return null;
          return <Component key={s.id} />;
        })}
    </>
  );
}
