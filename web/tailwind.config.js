/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Escala neutra càlida per al mode clar.
        paper: '#f6f7f9', // fons de pàgina
        surface: '#ffffff', // targetes
        line: '#e5e7eb', // vores
        lineSoft: '#eef0f3',
        ink: {
          900: '#111827', // text principal
          700: '#374151',
          600: '#4b5563', // text secundari
          500: '#6b7280', // text terciari
          400: '#9ca3af',
        },
        // Verd i vermell amb prou contrast sobre blanc (els -400 no en tenien).
        up: '#047857',
        down: '#be123c',
        accent: {
          mama: '#be185d',
          papa: '#0369a1',
        },
      },
      fontSize: {
        // Base 17px: la mida de cos còmoda per llegir sense esforç.
        base: ['1.0625rem', { lineHeight: '1.5' }],
      },
      letterSpacing: {
        // El tracking és específic de la mida: els titulars es tanquen.
        title: '-0.02em',
        display: '-0.03em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        lift: '0 4px 12px rgba(16, 24, 40, 0.08), 0 2px 4px rgba(16, 24, 40, 0.04)',
        pop: '0 12px 32px rgba(16, 24, 40, 0.14)',
      },
      transitionTimingFunction: {
        // Corbes fortes: les integrades del navegador són massa fluixes.
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
};
