import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type ReactNode } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

import { useAppTheme } from '@/src/theme/ThemeProvider';

export function PaperBridge({ children }: { children: ReactNode }) {
  const { name, colors } = useAppTheme();
  const base = name === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const theme = {
    ...base,
    roundness: 4,
    colors: {
      ...base.colors,
      primary: colors.accentFill,
      onPrimary: colors.accentText,
      secondary: colors.accent,
      background: colors.bg,
      surface: colors.surface,
      surfaceVariant: colors.surfaceElevated,
      onSurface: colors.text,
      onSurfaceVariant: colors.textMuted,
      outline: colors.borderStrong,
      error: colors.danger,
      elevation: {
        level0: 'transparent',
        level1: colors.surface,
        level2: colors.surface,
        level3: colors.surface,
        level4: colors.surfaceElevated,
        level5: colors.surfaceElevated,
      },
    },
  };

  return (
    <PaperProvider
      theme={theme}
      settings={{
        icon: (props) => <MaterialCommunityIcons name={props.name as never} color={props.color} size={props.size} />,
      }}>
      {children}
    </PaperProvider>
  );
}
