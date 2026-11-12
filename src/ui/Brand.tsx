import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { space } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

export function Brand() {
  const { t } = useTranslation();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 }}>
      <Image source={require('../../assets/images/logo.jpg')} accessibilityLabel="PlayBookCR" style={{ width: 40, height: 40, borderRadius: 20 }} />
      <View style={{ flexShrink: 1 }}>
        <AppText variant="heading" numberOfLines={1}>
          PLAYBOOK<AppText variant="heading" tone="accent">CR</AppText>
        </AppText>
        <AppText variant="small" tone="muted" numberOfLines={1}>
          {t('landing.tagline')}
        </AppText>
      </View>
    </View>
  );
}
