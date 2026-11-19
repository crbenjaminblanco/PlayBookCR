import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { View } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';

export function StarRating({ value, label }: { value: number; label: string }) {
  const { colors } = useAppTheme();
  const filled = Math.max(0, Math.min(5, value));
  return (
    <View accessibilityLabel={`${label}: ${filled} / 5`} style={{ flexDirection: 'row', gap: 1 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <MaterialCommunityIcons key={index} name="star" size={14} color={index < filled ? colors.star : colors.borderStrong} />
      ))}
    </View>
  );
}
