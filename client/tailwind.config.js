/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Keep Group brand colors
        background: "#F0EDE6",
        heading: "#5C5240",
        accent: "#9D926E",
        "light-gold": "#B8AD8E",
        "dark-text": "#2C2820",
        // Shadcn compatible
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#5C5240",
          foreground: "#F0EDE6",
        },
        secondary: {
          DEFAULT: "#B8AD8E",
          foreground: "#2C2820",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#E8E4DC",
          foreground: "#8A7E6A",
        },
        popover: {
          DEFAULT: "#FDFAF6",
          foreground: "#2C2820",
        },
        card: {
          DEFAULT: "#FDFAF6",
          foreground: "#2C2820",
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', "serif"],
        sans: ['"DM Sans"', "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
