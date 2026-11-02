import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Direction A — "Atlas": light, editorial
        bg: '#F7F5EF',
        panel: '#FFFFFF',
        panel2: '#ECE8DE',
        border: '#DEDAD0',
        borderStrong: '#CFCABD',
        text: '#15171A',
        textSecondary: '#3F4550',
        textMuted: '#5B6270',
        accent: '#1F4FD1',
        green: '#1C7C4A',
        yellow: '#8A5A00',
        orange: '#B4530F',
        red: '#B42318',
        // The Gazette — newspaper palette
        paper: '#F2ECDD',
        paperLight: '#F7F2E6',
        ink: '#1A1714',
        inkSoft: '#3D362D',
        inkMuted: '#5A5247',
        rule: '#CFC5B0',
        ruleStrong: '#B9AF9C',
        press: '#8B1E1E',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        headline: ['"Playfair Display"', 'Georgia', 'serif'],
        masthead: ['"IM Fell English"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
