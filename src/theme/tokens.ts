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
  control: 14,
  card: 24,
  sheet: 28,
  pill: 999,
} as const;

/** Barra de pestañas flotante: alto del cuerpo y separación del borde. */
export const tabBar = {
  height: 64,
  inset: 12,
} as const;

/** Espacio que el contenido deja abajo para no quedar bajo la barra flotante. */
export const dockHeight = tabBar.height + tabBar.inset * 2;

export const motion = {
  fast: 160,
  base: 260,
} as const;

export const hitSize = 44;

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  display: 'PlusJakartaSans_700Bold',
  stat: 'PlusJakartaSans_800ExtraBold',
} as const;

/** Elevación suave: tarjetas que flotan sobre el gris, sin filetes duros. */
export const lift = {
  shadowColor: '#0B1324',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 24,
  elevation: 2,
} as const;

/** La tarjeta de la semana: marino profundo con el acento cobalto. Igual en ambos temas. */
export const hero = {
  base: '#0B1324',
  glow: '#2350F5',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.66)',
  chip: 'rgba(255,255,255,0.12)',
} as const;

export const breakpoint = {
  regular: 720,
  wide: 960,
} as const;

export const layout = {
  /** Ancho de lectura en teléfono y tableta: la app se compone como app, no como sitio. */
  appMax: 560,
  wideMax: 1180,
} as const;
