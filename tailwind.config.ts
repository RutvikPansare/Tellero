import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:       "#F4EFE3",
        "cream-2":   "#EDE7D7",
        burgundy:    "#380008",
        "burgundy-2":"#4A000E",
        black:       "#0A0A0A",
        "text-dark": "#1A1411",
        "text-mid":  "#6B6157",
        "text-muted":"#9C8F83",
        accent:      "#25D366",
        "accent-hover":"#1fb358",
        lime:        "#C5E84A",
        border:      "rgba(26,20,17,0.12)",
        "border-dark":"rgba(255,255,255,0.10)",
      },
      fontFamily: {
        sans:    ["Inter", "sans-serif"],
        display: ["Figtree", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
