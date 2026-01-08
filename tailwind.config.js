// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRITICAL: This content array enables IntelliSense scanning
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}', 
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',   
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
plugins: [require('tailwindcss-animate')],
}