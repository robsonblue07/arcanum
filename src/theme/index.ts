export const colors = {
  void: '#07040F',
  ink: '#0E081C',
  plum: '#1A0F2E',
  grape: '#2C1650',
  amethyst: '#6E4CC6',
  gold: '#D4AF37',
  goldSoft: '#F0D78C',
  goldDim: 'rgba(212, 175, 55, 0.18)',
  neon: '#C9A4FF',
  mist: '#B8A8D4',
  ivory: '#F6F0E6',
  muted: 'rgba(246, 240, 230, 0.55)',
  line: 'rgba(212, 175, 55, 0.28)',
  danger: '#E8A0B4',
  dangerDim: 'rgba(232, 160, 180, 0.14)',
  success: '#9ED4B8',
  successDim: 'rgba(158, 212, 184, 0.14)',
} as const;

export const fonts = {
  display: 'CormorantGaramond_600SemiBold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  displayBold: 'CormorantGaramond_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 28,
  pill: 999,
} as const;
