import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { lift, radius, space } from '@/src/theme/tokens';

type Props = ViewProps & { flush?: boolean };

/** Tarjeta blanca con elevación suave. `flush` quita el relleno para listas y fotos. */
export function Card({ style, children, flush = false, ...rest }: Props) {
  const { colors, name } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          padding: flush ? 0 : space.lg + 4,
          gap: space.md,
          borderWidth: name === 'dark' ? 1 : 0,
          borderColor: colors.border,
          ...(name === 'dark' ? null : lift),
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}
