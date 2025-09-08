/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(220 89.8% 46.1%)",
        accent: "hsl(259 93.8% 49.6%)",
        background: "hsl(210 40% 96.1%)",
        surface: "hsl(0 0% 100%)",
        foreground: "hsl(220 8.9% 10.2%)",
        muted: "hsl(220 4% 34.9%)",
        destructive: "hsl(12 82% 55%)",
        border: "hsl(214.3 31.8% 91.4%)",
        input: "hsl(214.3 31.8% 91.4%)",
        ring: "hsl(220 89.8% 46.1%)",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "20px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 hsla(0,0%,0%,0.05)",
        md: "0 4px 8px hsla(0,0%,0%,0.1)",
        lg: "0 10px 20px hsla(0,0%,0%,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}