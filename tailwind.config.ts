import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsla(213, 77%, 63%, 0.15)",
        input: "hsla(213, 77%, 63%, 0.2)",
        ring: "hsla(213, 77%, 63%, 0.5)",
        background: "#0C1E33",
        foreground: "#ffffff",
        nuvvi: {
          DEFAULT: "#579BE9",
          light: "#69AAF0",
          dark: "#3A7BD5",
          50: "#eef5fd",
          100: "#d4e6fa",
          200: "#a9cdf5",
          300: "#7fb3f0",
          400: "#579BE9",
          500: "#579BE9",
          600: "#3A7BD5",
          700: "#2a5fa8",
          800: "#1b4279",
          900: "#0c254b",
        },
        teal: {
          DEFAULT: "#69AAF0",
          light: "#80B9F7",
          dark: "#4A90D9",
        },
        card: {
          DEFAULT: "rgba(12, 30, 51, 0.8)",
          border: "rgba(87, 155, 233, 0.12)",
          hover: "rgba(87, 155, 233, 0.06)",
        },
        muted: {
          DEFAULT: "#94a3b8",
          foreground: "#64748b",
        },
        "nuvvi-public": {
          primary: "#4F9FF0",
          "primary-hover": "#348BE3",
          "primary-dark": "#246FC1",
          sky: "#A8D7FF",
          "sky-light": "#D8EEFF",
          ice: "#EDF8FF",
          cloud: "#F8FCFF",
          navy: "#0B2944",
          heading: "#102F4B",
          text: "#39566F",
          muted: "#6C8398",
          border: "#D9ECFA",
          success: "#178C68",
          warning: "#B97812",
          error: "#C94455",
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
        manrope: ["Manrope", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "float-slower": "float-slower 12s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "cloud-drift": "cloud-drift 30s linear infinite",
        "cloud-drift-slow": "cloud-drift 45s linear infinite",
        "logo-float": "logo-float 6s ease-in-out infinite",
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
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(40px, -25px)" },
          "50%": { transform: "translate(-15px, -40px)" },
          "75%": { transform: "translate(-30px, 15px)" },
        },
        "float-slower": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(-30px, 20px)" },
          "66%": { transform: "translate(35px, -15px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.2", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.08)" },
        },
        "cloud-drift": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100vw)" },
        },
        "logo-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;
