import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

type Props = {
  label: string;
  variant?: 'primary' | 'secondary' | 'gold';
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', disabled, onPress, style }: Props) {
  const { colors } = useAppTheme();
  const gold = variant === 'gold';
  const outline = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignSelf: 'flex-start',
          minHeight: hitSize,
          paddingHorizontal: 18,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: gold ? '#C6A15B' : outline ? 'transparent' : colors.accentFill,
          borderWidth: 1,
          borderColor: gold ? '#C6A15B' : colors.borderStrong,
          opacity: disabled ? 0.4 : pressed ? 0.72 : 1,
        },
        style,
      ]}>
      <AppText
        variant="small"
        style={{
          color: gold ? '#1A1204' : outline ? colors.text : colors.accentText,
          fontFamily: fontFamily.semibold,
          letterSpacing: 1.1,
          textTransform: 'uppercase',
        }}>
        {label}
      </AppText>
    </Pressable>
  );
}
