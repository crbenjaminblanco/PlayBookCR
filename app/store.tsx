import { useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { products } from '@/src/data/products';
import { useSession } from '@/src/session/SessionProvider';
import { space } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/ui/Button';
import { Screen } from '@/src/ui/Screen';
import { Stage } from '@/src/ui/Stage';
import { StateMessage } from '@/src/ui/StateMessage';
import { AppText } from '@/src/ui/Text';
import { TextField } from '@/src/ui/TextField';
import { useBreakpoint } from '@/src/ui/useBreakpoint';
import { useDemoLoad } from '@/src/ui/useDemoLoad';

export default function StoreScreen() {
  const { t } = useTranslation();
  const { prefs } = useSession();
  const { colors } = useAppTheme();
  const { wide, regular } = useBreakpoint();
  const { status, retry } = useDemoLoad();
  const [query, setQuery] = useState('');

  const money = useMemo(
    () =>
      new Intl.NumberFormat(prefs.language === 'en' ? 'en-US' : 'es-CR', {
        style: 'currency',
        currency: 'CRC',
        maximumFractionDigits: 0,
      }),
    [prefs.language],
  );

  const visible = products.filter((product) => {
    const haystack = `${t(product.nameKey)} ${t(product.detailKey)}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <Screen>
      <Stage kicker={t('store.kicker')} title={t('store.title')} fill={false}>
        <AppText variant="body" tone="muted" style={{ maxWidth: 560 }}>
          {t('store.checkout')}
        </AppText>
        <TextField label={t('store.search')} value={query} onChangeText={setQuery} />
      </Stage>

      {status === 'loading' ? <StateMessage variant="loading" title={t('common.loading')} /> : null}
      {status === 'error' ? (
        <StateMessage variant="error" title={t('common.error')} actionLabel={t('common.retry')} onAction={retry} />
      ) : null}
      {status === 'ready' && visible.length === 0 ? <StateMessage title={t('store.empty')} /> : null}

      {status === 'ready' && visible.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' }}>
          {visible.map((product) => (
            <View key={product.id} style={{ width: wide ? '25%' : regular ? '50%' : '100%', padding: space.sm, alignSelf: 'stretch' }}>
              <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' }}>
                <Image source={product.image} accessibilityLabel={t(product.nameKey)} resizeMode="cover" style={{ width: '100%', height: wide ? 220 : 180 }} />
                <View style={{ gap: space.sm, padding: space.lg }}>
                  <AppText variant="heading" numberOfLines={2} style={{ minHeight: 52 }}>
                    {t(product.nameKey)}
                  </AppText>
                  <AppText variant="small" tone="muted" numberOfLines={2} style={{ minHeight: 40 }}>
                    {t(product.detailKey)}
                  </AppText>
                  <AppText variant="stat" style={{ fontSize: 24, lineHeight: 28 }}>
                    {money.format(product.priceCrc)}
                  </AppText>
                  <Button label={t('store.buy')} onPress={() => undefined} style={{ alignSelf: 'stretch' }} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
