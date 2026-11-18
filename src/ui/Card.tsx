import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';

export function Card({ style, children, ...rest }: ViewProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: space.lg,
          gap: space.md,
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}
