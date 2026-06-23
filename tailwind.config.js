/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0B0D',
        panel: '#101316',
        card: '#14181C',
        elevated: '#191E23',
        line: '#23282F',
        'line-soft': '#1B2026',
        ink: '#E7EAEC',
        muted: '#9AA3AD',
        faint: '#646C76',
        accent: '#2D8CDB',
        'accent-dim': '#1C5E96',
        positive: '#34D399',
        negative: '#F87171',
        warning: '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 1px 2px 0 rgba(0,0,0,0.4)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
