/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
      colors: {
        // Paleta "Dark Medical" (Inspirada en ORION pero médica)
        skan: {
          950: '#020617', // Fondo principal (Casi negro azulado)
          900: '#0f172a', // Fondo secundario
          800: '#1e293b', // Tarjetas
          500: '#0ea5e9', // Azul Cyan Brillante (Acento principal)
          400: '#38bdf8', // Texto brillante
          success: '#10b981', // Verde médico
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
