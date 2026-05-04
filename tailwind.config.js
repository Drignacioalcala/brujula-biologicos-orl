/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial red sanitarIA
        rsBlue: '#29ADFF',          // Brand cyan — usar como fill / acento decorativo
        rsBlueText: '#0E7AB5',      // Variante para TEXTO sobre blanco (AA: 4.6:1)
        rsBlueSoft: '#E8F4FB',
        rsInk: '#363B47',
        rsDark: '#2C3140',
        rsMuted: '#6B7280',         // Subido de #8B9099 -> #6B7280 para pasar AA (4.6:1)
        rsCanvas: '#F5F6F8',
      },
      fontFamily: {
        sans: ['Montserrat', 'Arial', 'Helvetica', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(54, 59, 71, 0.06), 0 4px 12px rgba(54, 59, 71, 0.04)',
      },
    },
  },
  plugins: [],
};
