import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(165 100% 50% / 0.15)",
        input: "hsl(165 100% 50% / 0.2)",
        ring: "hsl(165 100% 50% / 0.5)",
        background: "#020f0b",
        foreground: "#ffffff",
        nuvvi: {
          DEFAULT: "#00ffb3",
          light: "#00ffc8",
          dark: "#00cc8f",
          50: "#e6fff6",
          100: "#b3ffe6",
          200: "#80ffd6",
          300: "#4dffc6",
          400: "#1affb6",
          500: "#00ffb3",
          600: "#00cc8f",
          700: "#00996b",
          800: "#006647",
          900: "#003324",
        },
        teal: {
          DEFAULT: "#00d6a3",
          light: "#00e6b3",
          dark: "#00b08a",
        },
        card: {
          DEFAULT: "rgba(2, 15, 11, 0.8)",
          border: "rgba(0, 255, 179, 0.12)",
          hover: "rgba(0, 255, 179, 0.06)",
        },
        muted: {
          DEFAULT: "#94a3b8",
          foreground: "#64748b",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;
