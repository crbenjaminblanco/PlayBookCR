import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, radius } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

type Props = {
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: 'regular' | 'small';
  disabled?: boolean;
  block?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', icon, size = 'regular', disabled, block, onPress, style }: Props) {
  const { colors } = useAppTheme();
  const small = size === 'small';

  const fill = {
    primary: colors.accentFill,
    accent: colors.accent,
    secondary: colors.surface,
    ghost: 'transparent',
  }[variant];
  const ink = {
    primary: colors.accentText,
    accent: '#FFFFFF',
    secondary: colors.text,
    ghost: colors.accent,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignSelf: block ? 'stretch' : 'flex-start',
          minHeight: small ? 40 : 54,
          paddingHorizontal: small ? 16 : 24,
          borderRadius: radius.pill,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: fill,
          opacity: disabled ? 0.38 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon ? <MaterialCommunityIcons name={icon} size={small ? 16 : 19} color={ink} /> : null}
        <AppText variant="label" style={{ color: ink, fontFamily: fontFamily.semibold, fontSize: small ? 14 : 16 }}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
