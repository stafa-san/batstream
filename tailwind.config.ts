import type { Config } from "tailwindcss";

// Token mapping (UI-DESIGN.md §9) lands in milestone 4 — the design
// foundation. Until then this stays a bare scaffold config.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
