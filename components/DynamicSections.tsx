"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";
import { CustomSectionRenderer } from "@/components/sections/CustomSection";
import type { CustomSection } from "@/app/api/custom-sections/route";

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

const BUILTIN_MAP: Record<string, React.ComponentType> = {
  hero:       Hero,
  about:      About,
  skills:     Skills,
  projects:   Projects,
  experience: Experience,
  contact:    Contact,
};

export function DynamicSections() {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/section-settings").then(r => r.json()).catch(() => null),
      fetch("/api/custom-sections").then(r => r.json()).catch(() => []),
    ]).then(([sectionData, customData]) => {
      if (Array.isArray(sectionData) && sectionData.length > 0) {
        setSections(sectionData.sort((a: SectionConfig, b: SectionConfig) => a.order - b.order));
      }
      if (Array.isArray(customData)) {
        setCustomSections(customData);
      }
    });
  }, []);

  // Build a merged + sorted list of all visible items
  const customMap = Object.fromEntries(
    customSections.map((cs) => [cs.sectionId, cs])
  );

  return (
    <>
      {sections
        .filter((s) => s.visible)
        .map((s) => {
          // Built-in section
          const Builtin = BUILTIN_MAP[s.id];
          if (Builtin) return <Builtin key={s.id} />;

          // Custom section
          const custom = customMap[s.id];
          if (custom && custom.visible) {
            return <CustomSectionRenderer key={s.id} section={custom} />;
          }
          return null;
        })}
    </>
  );
}
