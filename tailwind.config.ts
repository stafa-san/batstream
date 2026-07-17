import type { Config } from "tailwindcss";

// Token mapping — UI-DESIGN.md §9, verbatim. Components style against
// these names only; the raw hex lives once, in globals.css.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        kraft: "var(--kraft)",
        edge: "var(--edge)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        night: "var(--night)",
        ember: "var(--ember)",
        "ember-deep": "var(--ember-deep)",
        dusk: "var(--dusk)",
        sage: "var(--sage)",
        live: "var(--live)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-atkinson)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        paper: "0 2px 0 var(--edge), 0 6px 14px rgba(34,30,24,.06)",
      },
      transitionTimingFunction: {
        thunk: "cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [],
};

export default config;
