/** @type {import('postcss').Config} */
const config = {
  plugins: {
    // Tailwind v4 uses @tailwindcss/postcss — no tailwind.config.js needed
    "@tailwindcss/postcss": {},
  },
};

export default config;
