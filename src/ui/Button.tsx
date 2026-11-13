import type { StyleProp, ViewStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize } from '@/src/theme/tokens';

type Props = {
  label: string;
  variant?: 'primary' | 'secondary' | 'gold';
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', disabled, onPress, style }: Props) {
  const { colors } = useAppTheme();
  const primary = variant === 'primary' || variant === 'gold';

  return (
    <PaperButton
      mode={primary ? 'contained' : 'outlined'}
      disabled={disabled}
      onPress={onPress}
      buttonColor={variant === 'gold' ? '#E0B04A' : primary ? colors.accentFill : colors.surface}
      textColor={variant === 'gold' ? '#1A1204' : primary ? colors.accentText : colors.text}
      theme={variant === 'gold' ? { colors: { primary: '#E0B04A', onPrimary: '#1A1204' } } : undefined}
      style={[{ borderRadius: 12, borderColor: variant === 'gold' ? '#E0B04A' : colors.borderStrong, backgroundColor: variant === 'gold' ? '#E0B04A' : undefined, marginVertical: 0 }, style]}
      contentStyle={{ minHeight: hitSize }}
      labelStyle={{ fontFamily: fontFamily.semibold, fontSize: 16, letterSpacing: 0 }}>
      {label}
    </PaperButton>
  );
}
