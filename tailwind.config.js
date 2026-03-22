/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:  "#F7F7F7",
        surface:     "#FFFFFF",
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        foreground:  "hsl(var(--foreground))",
        "text-1":    "#111111",
        "text-2":    "#666666",
        "text-3":    "#999999",
        olive:       "#4A5240",
        primary: {
          DEFAULT:    "#111111",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT:    "#F7F7F7",
          foreground: "#111111",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "#F7F7F7",
          foreground: "#666666",
        },
        popover: {
          DEFAULT:    "#FFFFFF",
          foreground: "#111111",
        },
        card: {
          DEFAULT:    "#FFFFFF",
          foreground: "#111111",
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', "sans-serif"],
        display: ['"DM Sans"', "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
