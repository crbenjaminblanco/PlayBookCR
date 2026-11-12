import type { StyleProp, ViewStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize } from '@/src/theme/tokens';

type Props = {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', disabled, onPress, style }: Props) {
  const { colors } = useAppTheme();
  const primary = variant === 'primary';

  return (
    <PaperButton
      mode={primary ? 'contained' : 'outlined'}
      disabled={disabled}
      onPress={onPress}
      buttonColor={primary ? colors.accentFill : colors.surface}
      textColor={primary ? colors.accentText : colors.text}
      style={[{ borderRadius: 12, borderColor: colors.borderStrong, marginVertical: 0 }, style]}
      contentStyle={{ minHeight: hitSize }}
      labelStyle={{ fontFamily: fontFamily.semibold, fontSize: 16, letterSpacing: 0 }}>
      {label}
    </PaperButton>
  );
}
