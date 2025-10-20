import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-grotesk)", "var(--font-inter)", "sans-serif"],
      },
      colors: {
        // 主体用这个绿（接近你图里的荧光绿）
        acid: {
          green: "#00FF6A",
        },
        // 辅助配色
        acc: {
          cyan: "#00E5FF",
          pink: "#FF3EB5",
        },
        base: {
          bg: "#000000",
          grid: "#0B0B0C", // 网格底
        },
      },
      boxShadow: {
        glowGreen: "0 0 24px rgba(0,255,106,.35)",
        glowCyan: "0 0 20px rgba(0,229,255,.32)",
        glowPink: "0 0 20px rgba(255,62,181,.32)",
      },
      borderColor: {
        acid: "#00FF6A",
      },
      letterSpacing: {
        wide2: ".08em",
      },
    },
  },
  plugins: [],
};
export default config;

