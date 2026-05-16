import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        panel: "hsl(var(--panel))",
        panelFg: "hsl(var(--panel-fg))",
        line: "hsl(var(--line))",
        accent: "hsl(var(--accent))",
        accentFg: "hsl(var(--accent-fg))",
        muted: "hsl(var(--muted))",
        mutedFg: "hsl(var(--muted-fg))",
        danger: "hsl(var(--danger))"
      },
      boxShadow: {
        soft: "0 20px 80px rgba(0, 0, 0, 0.22)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 0.45s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
