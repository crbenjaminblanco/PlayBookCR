import type { ViewProps } from 'react-native';
import { Surface } from 'react-native-paper';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';

export function Card({ style, children, ...rest }: ViewProps) {
  const { colors } = useAppTheme();
  return (
    <Surface
      elevation={1}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: space.lg,
          gap: space.md,
        },
        style,
      ]}
      {...rest}>
      {children}
    </Surface>
  );
}
