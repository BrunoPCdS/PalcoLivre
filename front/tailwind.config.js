/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        palco: {
          bg: '#0F1014',       // Fundo Principal ("Energia de Show & Luzes de Palco")
          surface: '#1A1C23',  // Superfícies, Cards, Player Fixo
          card: '#16181F',     // Variação de card
          border: '#272A36',   // Bordas sutis
          orange: '#FF5500',   // Cor de Destaque Principal (CTAs, Play, Uploads)
          orangeHover: '#E04B00',
          purple: '#8B5CF6',   // Cor de Destaque Secundária (Tags, badges, neon)
          purpleHover: '#7C3AED',
          text: '#F8FAFC',     // Texto Principal
          muted: '#94A3B8',    // Texto Secundário
        },
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(255, 85, 0, 0.45)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.45)',
        'player': '0 -10px 30px rgba(0, 0, 0, 0.75)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
