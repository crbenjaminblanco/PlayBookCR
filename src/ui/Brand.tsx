import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, space } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

export function Brand() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 }}>
      <View
        accessibilityLabel="PlayBookCR"
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: colors.text,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: colors.bg, fontFamily: fontFamily.display, fontSize: 16, lineHeight: 18 }}>PB</Text>
      </View>
      <View style={{ flexShrink: 1 }}>
        <AppText variant="heading" numberOfLines={1}>
          PLAYBOOKCR
        </AppText>
        <AppText variant="small" tone="muted" numberOfLines={1}>
          {t('landing.tagline')}
        </AppText>
      </View>
    </View>
  );
}
