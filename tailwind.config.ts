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
        // Semantic tokens (matching ops-web)
        background: {
          DEFAULT: '#000000',
          panel: '#0A0A0A',
          card: '#191919',
          elevated: '#1A1A1A',
          input: '#111111',
          status: '#1D1D1D',
        },
        text: {
          primary: '#E5E5E5',
          secondary: '#A7A7A7',
          tertiary: '#777777',
          disabled: '#555555',
          placeholder: '#999999',
          inverse: '#0A0A0A',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.2)',
          subtle: 'rgba(255, 255, 255, 0.05)',
          separator: 'rgba(255, 255, 255, 0.15)',
        },
        // Legacy ops.* aliases with CORRECTED values
        ops: {
          background: '#000000',
          card: '#0A0A0A',
          'card-dark': '#1D1D1D',
          accent: '#597794',
          'accent-hover': '#4a6680',
          success: '#A5B368',
          warning: '#C4A868',
          amber: '#C4A868',
          'amber-hover': '#b09555',
          error: '#93321A',
          'error-hover': '#7a2915',
          'text-primary': '#E5E5E5',
          'text-secondary': '#A7A7A7',
          'text-tertiary': '#777777',
          'text-disabled': '#555555',
          border: '#2A2A2A',
          'border-emphasis': 'rgba(255, 255, 255, 0.12)',
          surface: 'rgba(13, 13, 13, 0.6)',
          inactive: '#8E8E93',
          'gray-50': '#F5F5F5',
          'gray-100': '#E5E5E5',
          'gray-200': '#C0C0C0',
          'gray-300': '#8A8A8A',
          'gray-400': '#555555',
          'gray-500': '#333333',
          'surface-elevated': '#141414',
          'border-hover': 'rgba(255,255,255,0.25)',
          'text-dark': '#1A1A1A',
          'background-light': '#FFFFFF',
        },
      },
      fontFamily: {
        mohave: ['Mohave', 'sans-serif'],
        kosugi: ['Kosugi', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
      },
      fontSize: {
        // Semantic sizes matching ops-web
        'display': ['32px', { lineHeight: '1.1', fontWeight: '600' }],
        'heading': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'body-lg': ['18px', { lineHeight: '1.5' }],
        'button': ['15px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.05em' }],
        'button-sm': ['13px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.05em' }],
        'caption': ['12px', { lineHeight: '1.4' }],
        'caption-sm': ['11px', { lineHeight: '1.4' }],
        // Legacy aliases
        'ops-display': ['32px', { lineHeight: '1.1', fontWeight: '600' }],
        'ops-title': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'ops-subtitle': ['22px', { lineHeight: '1.3' }],
        'ops-body': ['16px', { lineHeight: '1.4' }],
        'ops-label': ['14px', { lineHeight: '1.4' }],
        'ops-caption': ['12px', { lineHeight: '1.4' }],
      },
      spacing: {
        'ops-xs': '8px',
        'ops-sm': '8px',
        'ops-md': '16px',
        'ops-lg': '24px',
        'ops-xl': '48px',
        'ops-2xl': '64px',
        'ops-3xl': '96px',
      },
      borderRadius: {
        sm: '2.5px',
        DEFAULT: '5px',
        md: '5px',
        lg: '8px',
        xl: '12px',
        // Legacy aliases
        'ops': '5px',
        'ops-card': '5px',
        'ops-lg': '8px',
        'ops-sm': '2.5px',
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
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
