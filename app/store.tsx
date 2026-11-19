import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { products, type Product } from '@/src/data/products';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hero, hitSize, lift, radius, space } from '@/src/theme/tokens';
import { Card } from '@/src/ui/Card';
import { ScreenHeader } from '@/src/ui/Kit';
import { Screen } from '@/src/ui/Screen';
import { StateMessage } from '@/src/ui/StateMessage';
import { AppText } from '@/src/ui/Text';
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

  const gap = space.md;
  const basis = storeColumns === 4 ? '31.8%' : '48.2%';
  // Sin búsqueda, la primera pieza va destacada; al buscar, todo va en cuadrícula.
  const featured = query.trim() ? null : visible[0];
  const grid = featured ? visible.slice(1) : visible;

  return (
    <Screen>
      <ScreenHeader title={t('app.quickStore')} subtitle={t('app.storeSubtitle')} />
      <SearchField value={query} onChange={setQuery} placeholder={t('store.search')} />
      <Notice text={t('store.checkout')} />

      {status === 'loading' ? <StateMessage variant="loading" title={t('common.loading')} /> : null}
      {status === 'error' ? <StateMessage variant="error" title={t('common.error')} actionLabel={t('common.retry')} onAction={retry} /> : null}
      {status === 'ready' && visible.length === 0 ? <StateMessage title={t('store.empty')} /> : null}

      {status === 'ready' && visible.length > 0 ? (
        <View style={{ gap: gap }}>
          {featured ? <FeaturedCard product={featured} price={money.format(featured.priceCrc)} /> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: gap }}>
            {grid.map((product) => (
              <View key={product.id} style={{ width: basis }}>
                <ProductCard product={product} price={money.format(product.priceCrc)} />
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

/** Aviso visible antes de los productos: aquí no se cobra. */
function Notice({ text }: { text: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
      <MaterialCommunityIcons name="information-outline" size={15} color={colors.textMuted} />
      <AppText variant="caption" tone="muted" style={{ fontSize: 13 }}>
        {text}
      </AppText>
    </View>
  );
}

/** La pieza destacada: tarjeta marina ancha con la foto a la derecha. */
function FeaturedCard({ product, price }: { product: Product; price: string }) {
  const { t } = useTranslation();
  const glow = Platform.OS === 'web' ? ({ backgroundImage: `radial-gradient(90% 120% at 100% 0%, ${hero.glow}80 0%, transparent 60%)` } as object) : null;
  return (
    <View style={[{ backgroundColor: hero.base, borderRadius: radius.card, padding: space.md, flexDirection: 'row', gap: space.md, overflow: 'hidden' }, glow]}>
      <View style={{ flex: 1, padding: space.sm, gap: space.sm, justifyContent: 'space-between' }}>
        <View style={{ gap: 6 }}>
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: hero.chip }}>
            <AppText variant="caption" style={{ color: hero.text, fontFamily: fontFamily.semibold }}>
              {t('app.featuredPiece')}
            </AppText>
          </View>
          <AppText variant="heading" numberOfLines={2} style={{ color: hero.text, fontSize: 20, lineHeight: 25 }}>
            {t(product.nameKey)}
          </AppText>
          <AppText variant="caption" numberOfLines={2} style={{ color: hero.muted, fontSize: 13, lineHeight: 18 }}>
            {t(product.detailKey)}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
          <AppText variant="label" style={{ color: hero.text, fontFamily: fontFamily.stat, fontSize: 18, fontVariant: ['tabular-nums'] }}>
            {price}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('app.add')}: ${t(product.nameKey)}`}
            onPress={() => undefined}
            style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.92 : 1 }] })}>
            <MaterialCommunityIcons name="plus" size={20} color={hero.base} />
          </Pressable>
        </View>
      </View>
      <View style={{ width: '46%', aspectRatio: 0.9, borderRadius: radius.card - 8, overflow: 'hidden', backgroundColor: hero.chip }}>
        <Image source={product.image} accessibilityLabel={t(product.nameKey)} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </View>
    </View>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const { t } = useTranslation();
  const { colors, name } = useAppTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          paddingHorizontal: space.lg,
          minHeight: 52,
          borderRadius: radius.pill,
          backgroundColor: colors.surface,
        },
        name === 'light' ? lift : { borderWidth: 1, borderColor: colors.border },
      ]}>
      <MaterialCommunityIcons name="magnify" size={21} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        style={{ flex: 1, minHeight: hitSize, color: colors.text, fontFamily: fontFamily.medium, fontSize: 15 }}
      />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t('home.close')} onPress={() => onChange('')} hitSlop={10}>
          <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function ProductCard({ product, price }: { product: Product; price: string }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <Card flush style={{ overflow: 'hidden', gap: 0 }}>
      <View style={{ padding: 8 }}>
        <View style={{ width: '100%', aspectRatio: 1, borderRadius: radius.card - 8, overflow: 'hidden', backgroundColor: colors.surfaceElevated }}>
          <Image
            source={product.image}
            accessibilityLabel={t(product.nameKey)}
            resizeMode="cover"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: space.md + 2, paddingBottom: space.md + 2, paddingTop: space.xs, gap: 4 }}>
        <AppText variant="label" numberOfLines={1}>
          {t(product.nameKey)}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={2} style={{ minHeight: 32 }}>
          {t(product.detailKey)}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm }}>
          <AppText variant="label" style={{ fontFamily: fontFamily.bold, fontVariant: ['tabular-nums'] }}>
            {price}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('app.add')}: ${t(product.nameKey)}`}
            onPress={() => undefined}
            hitSlop={6}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.accentFill,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.accentText} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}
