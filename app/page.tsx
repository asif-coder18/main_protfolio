import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { DynamicSections } from "@/components/DynamicSections";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main>
        <DynamicSections />
      </main>
      <Footer />
    </>
  );
}
