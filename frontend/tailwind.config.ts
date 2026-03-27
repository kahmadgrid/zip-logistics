import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffdf5",
          100: "#fff7dd",
          200: "#ffefbd",
          300: "#ffe28a",
          400: "#ffd257",
          500: "#fbbb1f",
          600: "#de980d",
          700: "#b8740d",
          800: "#955a13",
          900: "#7b4a14"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(123,74,20,0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;

