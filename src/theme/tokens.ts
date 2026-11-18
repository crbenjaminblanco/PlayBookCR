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
  display: 'Fraunces_600SemiBold',
  stat: 'BarlowSemiCondensed_700Bold',
} as const;

export const lift = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.32,
  shadowRadius: 18,
  elevation: 8,
} as const;

export const breakpoint = {
  regular: 720,
  wide: 960,
} as const;

export const layout = {
  wideMax: 1280,
} as const;
