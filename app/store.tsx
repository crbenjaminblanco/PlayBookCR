import { useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { products } from '@/src/data/products';
import { useSession } from '@/src/session/SessionProvider';
import { radius, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Screen } from '@/src/ui/Screen';
import { StateMessage } from '@/src/ui/StateMessage';
import { AppText } from '@/src/ui/Text';
import { TextField } from '@/src/ui/TextField';
import { useBreakpoint } from '@/src/ui/useBreakpoint';
import { useDemoLoad } from '@/src/ui/useDemoLoad';

export default function StoreScreen() {
  const { t } = useTranslation();
  const { prefs } = useSession();
  const { storeColumns } = useBreakpoint();
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
  const basis = storeColumns === 1 ? '100%' : storeColumns === 2 ? '48%' : '31.5%';

  return (
    <Screen>
      <View style={{ gap: space.sm }}>
        <AppText variant="kicker" tone="accent">
          {t('store.kicker')}
        </AppText>
        <AppText variant="title">{t('store.title')}</AppText>
        <AppText variant="small" tone="muted">
          {t('store.checkout')}
        </AppText>
      </View>
      <TextField label={t('store.search')} value={query} onChangeText={setQuery} />

      {status === 'loading' ? <StateMessage variant="loading" title={t('common.loading')} /> : null}
      {status === 'error' ? (
        <StateMessage variant="error" title={t('common.error')} actionLabel={t('common.retry')} onAction={retry} />
      ) : null}
      {status === 'ready' && visible.length === 0 ? <StateMessage title={t('store.empty')} /> : null}

      {status === 'ready' && visible.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'space-between', rowGap: space.lg }}>
          {visible.map((product) => (
            <Card key={product.id} style={{ width: basis, alignSelf: 'stretch' }}>
              <Image
                source={product.image}
                accessibilityLabel={t(product.nameKey)}
                resizeMode="cover"
                style={{ width: '100%', height: 180, borderRadius: radius.card }}
              />
              <AppText variant="heading">{t(product.nameKey)}</AppText>
              <AppText variant="small" tone="muted">
                {t(product.detailKey)}
              </AppText>
              <View style={{ flexGrow: 1 }} />
              <AppText variant="stat" style={{ fontSize: 28, lineHeight: 32 }}>
                {money.format(product.priceCrc)}
              </AppText>
              <Button label={t('store.buy')} onPress={() => undefined} />
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
