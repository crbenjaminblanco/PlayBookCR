import { createContext, useContext, type ReactNode } from 'react';

import { useSession } from '@/src/session/SessionProvider';
import { themeColors, type ColorTokens, type ThemeName } from '@/src/theme/colors';

const ThemeContext = createContext<{ name: ThemeName; colors: ColorTokens } | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { prefs } = useSession();
  const name = prefs.theme;
  const colors = themeColors[name];
  return <ThemeContext.Provider value={{ name, colors }}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme debe usarse dentro de AppThemeProvider');
  return value;
}
