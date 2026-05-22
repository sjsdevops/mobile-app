/**
 * Design system color tokens.
 * Use these wherever className cannot be used:
 *   - ActivityIndicator color prop
 *   - StyleSheet.create
 *   - Icon fill/stroke
 *   - chart / canvas primitives
 *
 * Mirror of tailwind.config.js — keep both in sync.
 */

export const colors = {
  primary: {
    DEFAULT: '#144fcc',
    10: '#F7F8FB',
    50:  'rgba(20, 79, 204, 0.10)',
    100: '#a8c1f6',
    200: '#5184ee',
    300: '#144fcc',
    400: '#103d9f',
    500: '#0b2c72',
    alpha: 'rgba(20, 79, 204, 0.10)',
  },
  secondary: {
    DEFAULT: '#e42527',
    100: '#f6b6b7',
    200: '#ed6e6f',
    300: '#e42527',
    400: '#b71718',
    500: '#811011',
    alpha: 'rgba(228, 37, 39, 0.10)',
  },
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
  purple: {
    DEFAULT:  '#341577',
    100: '#a281e9',
    200: '#7342de',
    300: '#4f20b6',
    400: '#341577',
    500: '#1f0c46',
    alpha:   'rgba(52, 21, 119, 0.10)',
    alpha50: 'rgba(52, 21, 119, 0.50)',
  },
  red: {
    100: '#fb3748',
    200: '#d00416',
    alpha: 'rgba(251, 55, 72, 0.10)',
  },
  yellow: {
    100: '#ffdb43',
    200: '#dfb400',
    alpha: 'rgba(255, 219, 67, 0.10)',
  },
  green: {
    100: '#84ebb4',
    200: '#1fc16b',
    alpha: 'rgba(31, 193, 107, 0.10)',
  },
  surface: {
    DEFAULT: '#ffffff',
    muted:   '#f5f5f5',
    light:   '#F7F8FB',
  },
} as const;

export type Colors = typeof colors;
