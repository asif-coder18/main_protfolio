import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CustomCursor } from "@/components/CustomCursor";
import { ScrollProgress } from "@/components/ScrollProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asiful Maula Abir | Frontend Developer & Next.js Specialist",
  description:
    "Frontend developer specializing in Next.js, React, and modern web technologies. I build fast, responsive, and user-friendly web applications.",
  keywords: [
    "Asiful Maula Abir",
    "Frontend Developer",
    "Next.js Specialist",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Web Developer",
  ],
  authors: [{ name: "Asiful Maula Abir" }],
  openGraph: {
    title: "Asiful Maula Abir | Frontend Developer",
    description:
      "Frontend developer specializing in Next.js and modern web technologies. I build fast, responsive, and user-friendly web applications.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asiful Maula Abir | Frontend Developer",
    description:
      "Frontend developer specializing in Next.js and modern web technologies.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <ThemeProvider>
          <ScrollProgress />
          <CustomCursor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
