import type { ReactNode } from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type Props = ViewProps & {
  scroll?: boolean;
  footer?: ReactNode;
  center?: boolean;
};

export function Screen({ children, scroll = true, footer, center = false, style }: Props) {
  const { colors } = useAppTheme();
  const { contentMax, pad } = useBreakpoint();
  const insets = useSafeAreaInsets();

  const body = (
    <View style={{ width: '100%', maxWidth: contentMax, alignSelf: 'center', paddingHorizontal: pad, gap: space.lg }}>
      {children}
    </View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: center ? 'center' : 'flex-start',
            paddingTop: space.lg,
            paddingBottom: footer ? space.xl : insets.bottom + space.xxl,
          }}>
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: space.lg }}>{body}</View>
      )}
      {footer ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.bg,
            paddingTop: space.md,
            paddingBottom: insets.bottom + space.md,
          }}>
          <View style={{ width: '100%', maxWidth: contentMax, alignSelf: 'center', paddingHorizontal: pad }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}
