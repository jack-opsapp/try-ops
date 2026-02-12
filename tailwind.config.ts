import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ops: {
          background: '#000000',
          card: '#0D0D0D',
          accent: '#59779F',
          success: '#A5B368',
          warning: '#C4A868',
          error: '#931A32',
          'text-primary': '#FFFFFF',
          'text-secondary': '#AAAAAA',
          'text-tertiary': '#777777',
          border: 'rgba(255,255,255,0.1)',
        },
      },
      fontFamily: {
        mohave: ['Mohave', 'sans-serif'],
        kosugi: ['Kosugi', 'sans-serif'],
      },
      fontSize: {
        'ops-title': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'ops-subtitle': ['22px', { lineHeight: '1.3' }],
        'ops-body': ['16px', { lineHeight: '1.5' }],
        'ops-caption': ['14px', { lineHeight: '1.4' }],
        'ops-small': ['12px', { lineHeight: '1.4' }],
        'ops-large-title': ['32px', { lineHeight: '1.1', fontWeight: '700' }],
      },
      borderRadius: {
        'ops': '5px',           // iOS cornerRadius / buttonRadius
        'ops-card': '8px',      // iOS cardCornerRadius
        'ops-lg': '12px',       // iOS largeCornerRadius (modals, sheets)
        'ops-sm': '2.5px',      // iOS smallCornerRadius (badges)
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
