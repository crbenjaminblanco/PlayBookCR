import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

export function FanCount({ fans, size = 14 }: { fans: number; size?: number }) {
  const { i18n } = useTranslation();
  const { colors } = useAppTheme();
  const label = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'es-CR').format(fans);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel={label}>
      <SymbolView
        name={{ ios: 'person.fill', android: 'person', web: 'person' }}
        tintColor={colors.textMuted}
        size={size}
      />
      <AppText
        variant="small"
        style={{ fontFamily: fontFamily.semibold, fontVariant: ['tabular-nums'], fontSize: size, lineHeight: size + 4 }}>
        {label}
      </AppText>
    </View>
  );
}
