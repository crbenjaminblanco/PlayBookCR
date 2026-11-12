import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CostaRicaMap } from '@/src/components/CostaRicaMap';
import { provinces, teamFans, type ProvinceId } from '@/src/data/provinces';
import { teamById, teams } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, radius, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { FanCount } from '@/src/ui/FanCount';
import { readableTeamColor } from '@/src/ui/teamColor';
import { StateMessage } from '@/src/ui/StateMessage';
import { Select } from '@/src/ui/Select';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';
import { useDemoLoad } from '@/src/ui/useDemoLoad';
import { useHomeScroll } from '@/src/ui/homeScroll';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { auth, prefs } = useSession();
  const { regular, wide } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const { register } = useHomeScroll();
  const params = useLocalSearchParams<{ section?: string }>();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  const scrollRef = useRef<ScrollViewInstance>(null);
  const offsets = useRef<Record<string, number>>({});
  const favorite = teamById(auth?.teamId);
  const { status, retry } = useDemoLoad();
  const [selectedId, setSelectedId] = useState<ProvinceId | null>(null);
  const [openId, setOpenId] = useState<ProvinceId | null>(null);
  const [mapWidth, setMapWidth] = useState(320);
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const provinceRows = useMemo(
    () =>
      provinces
        .map((province) => ({ id: province.id, fans: teamFans(province, teamFilter) }))
        .sort((left, right) => right.fans - left.fans),
    [teamFilter],
  );
  const provinceTotal = provinceRows.reduce((sum, row) => sum + row.fans, 0);
  const provinceMax = provinceRows[0]?.fans || 1;
  const activeFilter = teamById(teamFilter);
  const barColor = activeFilter ? readableTeamColor(activeFilter.color) : colors.accent;

  function scrollToId(id: string, animated: boolean) {
    scrollRef.current?.scrollTo({ y: Math.max(0, (offsets.current[id] ?? 0) - 12), animated });
  }

  useEffect(() => {
    register((id) => scrollToId(id, true));
    return () => register(null);
  }, [register]);

  function place(id: string, y: number) {
    offsets.current[id] = y;
    if (section === id) scrollToId(id, false);
  }

  return (
    <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }}>
      <View style={{ width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: regular ? 32 : 16, gap: space.xxl, paddingTop: space.xxl }}>
        <View onLayout={(event) => place('home', event.nativeEvent.layout.y)} style={{ gap: space.lg, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, maxWidth: '100%' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
            <AppText variant="small">
              {new Intl.NumberFormat(prefs.language === 'en' ? 'en-US' : 'es-CR').format(2480)} {t('landing.statRegistered')} · {t('landing.statRegisteredNote')}
            </AppText>
          </View>
          <AppText variant="display" style={{ textAlign: 'center', maxWidth: 760 }}>
            {t('landing.heroTitle')}
          </AppText>
          <AppText variant="body" tone="muted" style={{ textAlign: 'center', maxWidth: 640 }}>
            {t('landing.heroBody')}
          </AppText>
          <View style={{ flexDirection: regular ? 'row' : 'column', gap: space.md, width: regular ? undefined : '100%' }}>
            <Button label={t('landing.tryPredictor')} onPress={() => router.push('/analysis')} />
            <Button label={t('landing.join')} variant="secondary" onPress={() => router.push('/community')} />
          </View>
        </View>

        <View onLayout={(event) => place('map', event.nativeEvent.layout.y)} style={{ gap: space.lg, marginTop: space.xl, zIndex: openId ? 30 : 0 }}>
          <View style={{ gap: space.sm, alignItems: 'center' }}>
            <AppText variant="kicker" tone="accent">
              {t('home.kicker')}
            </AppText>
            <AppText variant="title" style={{ textAlign: 'center' }}>
              {t('home.title')}
            </AppText>
            <AppText variant="body" tone="muted" style={{ textAlign: 'center', maxWidth: 640 }}>
              {t('home.subtitle')}
            </AppText>
          </View>
          {status === 'loading' ? <StateMessage variant="loading" title={t('common.loading')} /> : null}
          {status === 'error' ? (
            <StateMessage variant="error" title={t('common.error')} actionLabel={t('common.retry')} onAction={retry} />
          ) : null}
          {status === 'ready' && provinces.length > 0 ? (
            <View style={{ position: 'relative', gap: space.md }}>
              {openId ? null : (
              <View style={{ gap: space.sm, maxWidth: 360, width: '100%', alignSelf: 'center', zIndex: 36 }}>
                <AppText variant="small" tone="muted" style={{ fontFamily: fontFamily.semibold, textAlign: 'center' }}>
                  {t('home.filter')}
                </AppText>
                <Select
                  label={t('home.filter')}
                  value={teamFilter ?? ''}
                  options={[
                    { id: '', label: t('team.all') },
                    ...teams.map((team) => ({ id: team.id, label: `${team.city} ${team.name}` })),
                  ]}
                  onChange={(id) => setTeamFilter(id || null)}
                />
              </View>
              )}
              {openId ? (
                <Pressable accessibilityLabel={t('home.close')} onPress={() => setOpenId(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }} />
              ) : null}
              <View style={{ flexDirection: wide ? 'row' : 'column', gap: space.xl, alignItems: 'flex-start' }}>
                <View style={{ flex: 1.15, width: '100%', minWidth: 0, maxWidth: wide ? 520 : '100%' }} onLayout={(event) => setMapWidth(event.nativeEvent.layout.width)}>
                  <CostaRicaMap
                    provinces={provinces}
                    selectedId={selectedId}
                    openId={openId}
                    onOpen={setOpenId}
                    onClose={() => setOpenId(null)}
                    onSelect={setSelectedId}
                    width={mapWidth}
                    favoriteId={favorite?.id}
                    teamId={teamFilter}
                  />
                </View>
                <View style={{ flex: 1, width: '100%', minWidth: 0 }}>
                  <Card>
                    <AppText variant="heading">{t('home.fansIn', { place: t('home.country') })}</AppText>
                    <FanCount fans={provinceTotal} size={28} />
                    <View style={{ gap: space.sm }}>
                      {provinceRows.map((row) => (
                        <View key={row.id} style={{ gap: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
                            <AppText variant="small" style={{ flex: 1, fontFamily: fontFamily.medium }}>
                              {row.id}
                            </AppText>
                            <FanCount fans={row.fans} />
                          </View>
                          <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
                            <View
                              style={{
                                width: `${(row.fans / provinceMax) * 100}%`,
                                height: 8,
                                borderRadius: radius.pill,
                                backgroundColor: barColor,
                              }}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </Card>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <AppText variant="small" tone="muted" style={{ textAlign: 'center' }}>
          {t('landing.footer')}
        </AppText>
      </View>
    </ScrollView>
  );
}

