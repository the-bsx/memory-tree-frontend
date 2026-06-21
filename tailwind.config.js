/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bark:    { DEFAULT: "#5C4033", light: "#7A5C4E", dark: "#3E2B20" },
        parchment: { DEFAULT: "#F5ECD7", light: "#FBF6EE", dark: "#E8D9BC" },
        sage:    { DEFAULT: "#7A8C6E", light: "#9AAD8C", dark: "#5C6E52" },
        clay:    { DEFAULT: "#C47B5A", light: "#D9967A", dark: "#A65E3E" },
        ink:     { DEFAULT: "#2C1F14", light: "#4A3728" },
        mist:    { DEFAULT: "#BDB5A6", light: "#D4CEC4" },
      },
      fontFamily: {
        serif: ['"Lora"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
