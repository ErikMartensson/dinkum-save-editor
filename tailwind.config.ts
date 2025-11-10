import type { Config } from "tailwindcss";

export default {
  content: [
    "./routes/**/*.{ts,tsx}",
    "./islands/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dinkum: {
          primary: "#d4be7d",
          secondary: "#ffc400",
          tertiary: "#392100",
          accent: "#7d2b0d",
          beige: "#fdf4e4",
          gray: "#e3dbcd",
          orange: "#efa75d",
        },
      },
      fontFamily: {
        mclaren: ["McLaren", "cursive", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
