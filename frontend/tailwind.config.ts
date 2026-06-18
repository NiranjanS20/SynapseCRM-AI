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
        // App Custom Palette
        charcoal: {
          navy: "#27262E", // Base dark background
          DEFAULT: "#27262E",
        },
        sandy: {
          tan: "#E19C63", // Primary action / highlight
          DEFAULT: "#E19C63",
        },
        dusty: {
          steel: "#8BA5BE", // Secondary/Muted elements
          DEFAULT: "#8BA5BE",
        },
        // Mapped UI Colors referencing custom palette
        slate: {
          900: "#1A1A1E",
          800: "#27262E", // Charcoal Navy
          700: "#34333D",
        },
        sage: {
          500: "#E19C63", // Sandy Tan
          400: "#E6AE7F",
          300: "#EBC29F",
        },
        graphite: {
          950: "#19181D",
          900: "#27262E", // Charcoal Navy
          800: "#32313B",
          700: "#444352",
        },
        accent: {
          success: "#22C55E",
          warning: "#E19C63", // Sandy Tan
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
