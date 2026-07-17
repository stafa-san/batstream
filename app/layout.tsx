import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import GrainOverlay from "@/components/GrainOverlay";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

// UI-DESIGN.md §3 — Fraunces is variable and MUST be loaded with its
// character axes named, or the paper register collapses into a stiff serif.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
});

// Atkinson Hyperlegible is static — weights listed explicitly.
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "The Bat Barn",
  description:
    "Nobody knows how many bats live in this barn. Watch the window, stamp what you see — the people watching are the count.",
};

// Set data-motion before paint: the toggle wins, then the OS preference.
const motionInit = `(function(){try{var m=localStorage.getItem('motion');var off=m==='off'||(m===null&&matchMedia('(prefers-reduced-motion: reduce)').matches);document.documentElement.dataset.motion=off?'off':'on';}catch(e){document.documentElement.dataset.motion='on';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${atkinson.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionInit }} />
      </head>
      <body className="flex min-h-screen flex-col font-body">
        <GrainOverlay />
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
