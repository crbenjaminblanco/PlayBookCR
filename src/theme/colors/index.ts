import { darkColors } from './dark';
import { lightColors } from './light';
import type { ColorTokens } from './types';

export type ThemeName = 'dark' | 'light';

export const themeColors: Record<ThemeName, ColorTokens> = {
  dark: darkColors,
  light: lightColors,
};

export { darkColors, lightColors };
export type { ColorTokens };
