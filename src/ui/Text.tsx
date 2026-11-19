import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily } from '@/src/theme/tokens';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'small' | 'caption' | 'stat' | 'label';

type Props = TextProps & {
  variant?: Variant;
  tone?: 'default' | 'muted' | 'accent' | 'inverse' | 'success' | 'danger';
};

export function AppText({ variant = 'body', tone = 'default', style, ...rest }: Props) {
  const { colors } = useAppTheme();
  const { wide } = useBreakpoint();

  const variantStyle: Record<Variant, TextStyle> = {
    display: {
      fontFamily: fontFamily.display,
      fontSize: wide ? 40 : 32,
      lineHeight: wide ? 46 : 38,
      letterSpacing: -1,
    },
    title: {
      fontFamily: fontFamily.display,
      fontSize: wide ? 30 : 26,
      lineHeight: wide ? 36 : 32,
      letterSpacing: -0.7,
    },
    heading: {
      fontFamily: fontFamily.bold,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.3,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
    },
    small: {
      fontFamily: fontFamily.medium,
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      fontFamily: fontFamily.medium,
      fontSize: 12,
      lineHeight: 16,
    },
    label: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.1,
    },
    stat: {
      fontFamily: fontFamily.stat,
      fontSize: wide ? 44 : 38,
      lineHeight: wide ? 50 : 44,
      letterSpacing: -1.4,
      fontVariant: ['tabular-nums'],
    },
  };

  const color = {
    default: colors.text,
    muted: colors.textMuted,
    accent: colors.accent,
    inverse: colors.accentText,
    success: colors.success,
    danger: colors.danger,
  }[tone];

  return <RNText style={[variantStyle[variant], { color }, style]} {...rest} />;
}
