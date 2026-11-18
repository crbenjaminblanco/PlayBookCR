import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily } from '@/src/theme/tokens';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type Variant = 'kicker' | 'display' | 'title' | 'heading' | 'body' | 'small' | 'stat';

type Props = TextProps & {
  variant?: Variant;
  tone?: 'default' | 'muted' | 'accent' | 'inverse';
};

export function AppText({ variant = 'body', tone = 'default', style, ...rest }: Props) {
  const { colors } = useAppTheme();
  const { wide, regular } = useBreakpoint();

  const variantStyle: Record<Variant, TextStyle> = {
    kicker: {
      fontFamily: fontFamily.semibold,
      fontSize: 13,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    display: {
      fontFamily: fontFamily.display,
      fontSize: wide ? 68 : regular ? 48 : 36,
      lineHeight: wide ? 72 : regular ? 52 : 40,
      letterSpacing: wide ? -1.2 : -0.4,
    },
    title: {
      fontFamily: fontFamily.display,
      fontSize: wide ? 44 : regular ? 36 : 30,
      lineHeight: wide ? 50 : regular ? 42 : 36,
      letterSpacing: -0.4,
    },
    heading: {
      fontFamily: fontFamily.bold,
      fontSize: 20,
      lineHeight: 26,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
    },
    small: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
    },
    stat: {
      fontFamily: fontFamily.stat,
      fontSize: wide ? 40 : 32,
      lineHeight: wide ? 44 : 36,
      fontVariant: ['tabular-nums'],
    },
  };

  const color =
    tone === 'muted' ? colors.textMuted : tone === 'accent' ? colors.accent : tone === 'inverse' ? colors.accentText : colors.text;

  return <RNText style={[variantStyle[variant], { color }, style]} {...rest} />;
}
