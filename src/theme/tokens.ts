export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  card: 16,
  sheet: 24,
  pill: 999,
} as const;

export const motion = {
  fast: 150,
  base: 220,
} as const;

export const hitSize = 44;

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  stat: 'BarlowSemiCondensed_700Bold',
} as const;

export const breakpoint = {
  regular: 720,
  wide: 960,
} as const;

export const layout = {
  compactMax: 480,
  regularMax: 960,
} as const;
