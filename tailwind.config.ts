import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["13px", { lineHeight: "1.5" }],
        base: ["15px", { lineHeight: "1.6" }],
        lg: ["17px", { lineHeight: "1.5" }],
        xl: ["19px", { lineHeight: "1.4" }],
        "2xl": ["21px", { lineHeight: "1.4" }],
        "3xl": ["25px", { lineHeight: "1.3" }],
        "4xl": ["31px", { lineHeight: "1.2" }],
        "5xl": ["39px", { lineHeight: "1.1" }],
      },
      zIndex: {
        dropdown: "20",
        sticky: "30",
        modal: "40",
        toast: "50",
        tooltip: "60",
      },
    },
  },
  plugins: [],
};
export default config;
