/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
      colors: {
        skan: {
          950: '#020617', // Fondo principal
          900: '#0f172a',
          800: '#1e293b',
          500: '#0ea5e9', // Azul Cyan Brillante
          400: '#38bdf8',
          success: '#10b981',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
	},
	plugins: [],
}
