import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: "#0F172A",
          800: "#111827",
          700: "#1E293B",
        },
        sage: {
          500: "#7C9A92",
          400: "#A3B8AF",
          300: "#D6E4DD",
        },
        graphite: {
          900: "#1C1F26",
          800: "#2A2F3A",
          700: "#3B4252",
        },
        accent: {
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        panel: "hsl(var(--panel))",
        panelFg: "hsl(var(--panel-fg))",
        line: "hsl(var(--line))",
        muted: "hsl(var(--muted))",
        mutedFg: "hsl(var(--muted-fg))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 80px rgba(0, 0, 0, 0.22)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.05)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.45s ease-out both",
        fade: "fade 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
