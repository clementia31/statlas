import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B1220',
        panel: '#101929',
        panel2: '#16213A',
        border: '#232F49',
        text: '#EEF1F6',
        textSecondary: '#97A3BC',
        textMuted: '#5D6A88',
        accent: '#3B82F6',
        green: '#22C55E',
        yellow: '#EAB308',
        orange: '#F97316',
        red: '#EF4444',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
