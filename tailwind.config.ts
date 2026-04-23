import type { Config } from 'tailwindcss'

/**
 * OPS Tailwind config (spec v2, 2026-04-17).
 *
 * Canonical source: /.interface-design/system.md at the repo root.
 * All tokens match `ops-web` / `ops-site` / iOS OPSStyle.
 *
 * Kosugi + Bebas Neue deprecated 2026-04-17. `fontFamily.kosugi` and
 * `fontFamily.bebas` removed. Former Kosugi roles now use JetBrains Mono;
 * Cake Mono Light carries the uppercase display voice.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (matching ops-web spec v2)
        background: {
          DEFAULT: '#000000',
          panel: '#0A0A0A',
          card: '#141414',
          elevated: '#1A1A1A',
          input: 'rgba(255, 255, 255, 0.04)',
          status: '#1D1D1D',
        },
        text: {
          primary: '#EDEDED',      // was #E5E5E5
          secondary: '#B5B5B5',    // was #A7A7A7
          tertiary: '#8A8A8A',     // was #777777
          disabled: '#6A6A6A',     // was #555555 — now aligns with textMute
          mute: '#6A6A6A',         // decorative ONLY — // slashes, separators
          placeholder: '#8A8A8A',  // was #999999
          inverse: '#000000',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.10)', // was 0.2 — spec is 0.10
          subtle: 'rgba(255, 255, 255, 0.09)',  // glass border
          separator: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.18)',
        },
        // Earth tones — semantic only, never decorative
        olive: '#9DB582',
        tan: '#C4A868',
        rose: '#B58289',
        brick: '#93321A',
        // Financial
        financial: {
          revenue: '#C4A868',
          profit: '#9DB582',
          cost: '#B58289',
          receivables: '#D4A574',
          overdue: '#93321A',
        },
        // Legacy ops.* aliases — value-updated to spec v2
        ops: {
          background: '#000000',
          card: '#0A0A0A',
          'card-dark': '#141414',

          // accent — primary CTA + focus ring ONLY
          accent: '#6F94B0',              // was #597794
          'accent-hover': '#7fa3bd',      // was #4a6680

          // earth-tone semantics
          success: '#9DB582',             // was #A5B368 — now olive per spec
          warning: '#C4A868',
          amber: '#C4A868',
          'amber-hover': '#b09555',
          error: '#B58289',               // rose for text
          'error-hover': '#A06E76',
          brick: '#93321A',               // destructive borders/dots only

          // text ladder
          'text-primary': '#EDEDED',      // was #E5E5E5
          'text-secondary': '#B5B5B5',    // was #A7A7A7
          'text-tertiary': '#8A8A8A',     // was #777777
          'text-disabled': '#6A6A6A',     // was #555555
          'text-mute': '#6A6A6A',

          // borders
          border: 'rgba(255, 255, 255, 0.10)',
          'border-emphasis': 'rgba(255, 255, 255, 0.18)',
          'border-hover': 'rgba(255, 255, 255, 0.25)',
          'glass-border': 'rgba(255, 255, 255, 0.09)',

          // surfaces
          surface: 'rgba(18, 18, 20, 0.58)',       // glass
          'surface-dense': 'rgba(18, 18, 20, 0.78)', // glass-dense
          'surface-elevated': '#141414',
          'surface-input': 'rgba(255, 255, 255, 0.04)',
          'surface-hover': 'rgba(255, 255, 255, 0.05)',
          'surface-active': 'rgba(255, 255, 255, 0.08)',

          inactive: '#8E8E93',

          // grayscale ladder (legacy, values updated to v2)
          'gray-50': '#F5F5F5',
          'gray-100': '#EDEDED',
          'gray-200': '#B5B5B5',
          'gray-300': '#8A8A8A',
          'gray-400': '#6A6A6A',
          'gray-500': '#333333',

          // light-mode inversions
          'text-dark': '#000000',
          'background-light': '#FFFFFF',
        },
      },
      fontFamily: {
        // spec v2: three families
        mohave: ['Mohave', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
        jetbrains: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        cakemono: ['Cake Mono', 'Mohave', 'sans-serif'],
        // Legacy aliases — point `kosugi` at JetBrains Mono so any unported call sites
        // keep rendering correctly while we migrate them opportunistically.
        kosugi: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Semantic sizes matching ops-web
        'display': ['32px', { lineHeight: '1.1', fontWeight: '300' }],  // Cake Mono Light hero
        'heading': ['24px', { lineHeight: '1.2', fontWeight: '300' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'body-lg': ['18px', { lineHeight: '1.5' }],
        'button': ['14px', { lineHeight: '1', fontWeight: '300', letterSpacing: '0.05em' }],
        'button-sm': ['12px', { lineHeight: '1', fontWeight: '300', letterSpacing: '0.05em' }],
        'caption': ['12px', { lineHeight: '1.4' }],
        'caption-sm': ['11px', { lineHeight: '1.4' }],
        'micro': ['11px', { lineHeight: '1.4', letterSpacing: '0.16em' }],  // tactical micro label
        // Legacy aliases
        'ops-display': ['32px', { lineHeight: '1.1', fontWeight: '300' }],
        'ops-title': ['22px', { lineHeight: '1.2', fontWeight: '300' }],
        'ops-subtitle': ['18px', { lineHeight: '1.3' }],
        'ops-body': ['16px', { lineHeight: '1.4' }],
        'ops-label': ['14px', { lineHeight: '1.4' }],
        'ops-caption': ['11px', { lineHeight: '1.4' }],
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
        // Spec v2 radii scale (sharp, tactical)
        sm: '2px',       // progress bars
        DEFAULT: '5px',  // buttons, inputs
        md: '4px',       // chips, tags, badges
        lg: '10px',      // cards, panels
        xl: '12px',      // modals, popovers, toasts
        // Legacy aliases (values updated)
        'ops': '5px',
        'ops-card': '10px',   // was 5 — aligned to panel radius
        'ops-lg': '12px',     // aligned to modal radius
        'ops-sm': '2px',      // aligned to progress bar radius
        'ops-chip': '4px',
        'ops-sidebar': '6px',
      },
      animation: {
        // Single easing curve per spec — cubic-bezier(0.22, 1, 0.36, 1)
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
