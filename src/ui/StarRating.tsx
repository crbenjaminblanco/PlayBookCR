import { View } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { AppText } from '@/src/ui/Text';

export function StarRating({ value, label }: { value: number; label: string }) {
  const { colors } = useAppTheme();
  const filled = Math.max(0, Math.min(5, value));
  return (
    <View accessibilityLabel={`${label}: ${filled} / 5`} style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <AppText key={index} variant="small" style={{ color: index < filled ? colors.star : colors.borderStrong, fontSize: 13, lineHeight: 16 }}>
          ★
        </AppText>
      ))}
    </View>
  );
}
