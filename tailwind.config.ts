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
          background: '#0A0A0A',
          card: '#1A1A1A',
          'card-dark': '#111111',
          accent: '#597794',
          success: '#A5B368',
          warning: '#C4A868',
          error: '#93321A',
          'text-primary': '#F5F5F5',
          'text-secondary': '#A0A0A0',
          'text-tertiary': '#777777',
          border: '#2A2A2A',
          'gray-50': '#F5F5F5',
          'gray-100': '#E5E5E5',
          'gray-200': '#C0C0C0',
          'gray-300': '#8A8A8A',
          'gray-400': '#555555',
          'gray-500': '#333333',
        },
      },
      fontFamily: {
        mohave: ['Mohave', 'sans-serif'],
        kosugi: ['Kosugi', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
      },
      fontSize: {
        'ops-title': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'ops-subtitle': ['22px', { lineHeight: '1.3' }],
        'ops-body': ['16px', { lineHeight: '1.5' }],
        'ops-caption': ['14px', { lineHeight: '1.4' }],
        'ops-small': ['12px', { lineHeight: '1.4' }],
        'ops-large-title': ['32px', { lineHeight: '1.1', fontWeight: '700' }],
      },
      spacing: {
        'ops-xs': '4px',
        'ops-sm': '8px',
        'ops-md': '16px',
        'ops-lg': '24px',
        'ops-xl': '40px',
        'ops-2xl': '64px',
        'ops-3xl': '96px',
      },
      borderRadius: {
        'ops': '5px',
        'ops-card': '8px',
        'ops-lg': '12px',
        'ops-sm': '2.5px',
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
