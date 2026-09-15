/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          light: "#F5F5F7",
          dark: "#1C1C1E",
        },
        panel: {
          light: "rgba(255,255,255,0.72)",
          dark: "rgba(28,28,30,0.72)",
        },
        accent: {
          DEFAULT: "#007AFF",
          hover: "#0069D9",
          soft: "rgba(0,122,255,0.12)",
        },
        border: {
          light: "rgba(0,0,0,0.06)",
          dark: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "20px",
        control: "12px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        "soft-dark": "0 1px 2px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.35)",
        lift: "0 12px 32px rgba(0,0,0,0.10)",
      },
      backdropBlur: {
        glass: "20px",
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      scale: {
        98: "0.98",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-in-out",
      },
    },
  },
  plugins: [],
};
