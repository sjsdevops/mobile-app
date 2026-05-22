/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@gluestack-ui/themed/dist/**/*.js',
  ],
  theme: {
    extend: {
      // ─── Design System ────────────────────────────────────────────────
      colors: {
        // Primary (blue scale)
        primary: {
          DEFAULT: '#144fcc',
          50:  'rgba(20, 79, 204, 0.10)',
          100: '#a8c1f6',
          200: '#5184ee',
          300: '#144fcc',
          400: '#103d9f',
          500: '#0b2c72',
          alpha: 'rgba(20, 79, 204, 0.10)',
        },
        // Secondary (red scale)
        secondary: {
          DEFAULT: '#e42527',
          100: '#f6b6b7',
          200: '#ed6e6f',
          300: '#e42527',
          400: '#b71718',
          500: '#811011',
          alpha: 'rgba(228, 37, 39, 0.10)',
        },
        // Neutral (grey scale)
        neutral: {
          100:  '#ffffff',
          200:  '#e3e3e3',
          300:  '#c6c6c6',
          400:  '#aaaaaa',
          500:  '#8e8e8e',
          600:  '#8e8e8e',
          700:  '#555555',
          800:  '#393939',
          900:  '#1c1c1c',
          1000: '#000000',
          alpha: 'rgba(0, 0, 0, 0.10)',
        },
        // Purple
        purple: {
          DEFAULT: '#341577',
          100: '#a281e9',
          200: '#7342de',
          300: '#4f20b6',
          400: '#341577',
          500: '#1f0c46',
          alpha:   'rgba(52, 21, 119, 0.10)',
          alpha50: 'rgba(52, 21, 119, 0.50)',
        },
        // Red (status)
        red: {
          100: '#fb3748',
          200: '#d00416',
          alpha: 'rgba(251, 55, 72, 0.10)',
        },
        // Yellow
        yellow: {
          100: '#ffdb43',
          200: '#dfb400',
          alpha: 'rgba(255, 219, 67, 0.10)',
        },
        // Green
        green: {
          100: '#84ebb4',
          200: '#1fc16b',
          alpha: 'rgba(31, 193, 107, 0.10)',
        },
        // Surface / background aliases
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f5f5',
          light: 'rgba(247, 248, 251, 1)',
        },
      },

      // ─── Typography ───────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'System'],
      },
      fontSize: {
        sm:  ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
      },
      fontWeight: {
        normal:   '400',
        medium:   '500',
        semibold: '600',
      },

      // ─── Border radius ───────────────────────────────────────────────
      borderRadius: {
        md:  '6px',
        lg:  '8px',
        xl:  '10px',
        '2xl': '12px',
      },

      // ─── Spacing (mapped from design gap/padding tokens) ─────────────
      spacing: {
        2:  '8px',
        3:  '12px',
        4:  '16px',
        6:  '24px',
        7:  '28px',
        8:  '32px',
        10: '40px',
      },

      // ─── Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        xs: '0px 1px 2px 0px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [],
};
