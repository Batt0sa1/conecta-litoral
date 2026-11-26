/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#14285A',   // azul marino (color predominante)
        azul: '#1F5FBF',      // azul
        lila: '#7B4FC4',      // lila (acento)
        secondary: '#00A8C6', // celeste
        cta: '#F5C400',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
