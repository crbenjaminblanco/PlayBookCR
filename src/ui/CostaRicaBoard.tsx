import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CostaRicaMap } from '@/src/components/CostaRicaMap';
import { countryShares, provinces, teamFans, type ProvinceId } from '@/src/data/provinces';
import { teamById, teamLabel, teams } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, radius, space } from '@/src/theme/tokens';
import { Card } from '@/src/ui/Card';
import { FanCount } from '@/src/ui/FanCount';
import { Helmet } from '@/src/ui/Helmet';
import { readableTeamColor } from '@/src/ui/teamColor';
import { StateMessage } from '@/src/ui/StateMessage';
import { Select } from '@/src/ui/Select';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';
import { useDemoLoad } from '@/src/ui/useDemoLoad';

export function CostaRicaBoard() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { auth } = useSession();
  const { regular, wide } = useBreakpoint();
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
  const teamRows = useMemo(() => countryShares().map((share) => ({ share, team: teamById(share.teamId) })).filter((row) => row.team), []);
  const teamMax = teamRows[0]?.share.fans || 1;
  const activeFilter = teamById(teamFilter);
  const barColor = activeFilter ? readableTeamColor(activeFilter.color) : colors.accent;

  return (
    <View style={{ width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: regular ? 32 : 16, gap: space.lg, paddingTop: space.xl, zIndex: openId ? 30 : 0 }}>
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
      {status === 'error' ? <StateMessage variant="error" title={t('common.error')} actionLabel={t('common.retry')} onAction={retry} /> : null}
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
                options={[{ id: '', label: t('team.all') }, ...teams.map((team) => ({ id: team.id, label: `${team.city} ${team.name}` }))]}
                onChange={(id) => setTeamFilter(id || null)}
              />
            </View>
          )}
          {openId ? (
            <Pressable accessibilityLabel={t('home.close')} onPress={() => setOpenId(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }} />
          ) : null}
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: space.md, alignItems: 'flex-start', alignSelf: 'center', width: '100%', maxWidth: 760 }}>
            <View style={{ width: '100%', minWidth: 0, maxWidth: wide ? 280 : 320, alignSelf: wide ? 'flex-start' : 'center' }} onLayout={(event) => setMapWidth(event.nativeEvent.layout.width)}>
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
            <View style={{ flex: 1, width: '100%', minWidth: 0, maxWidth: wide ? 420 : 360, alignSelf: wide ? 'flex-start' : 'center' }}>
              <Card style={{ padding: space.md, gap: space.sm }}>
                <AppText variant="small" style={{ fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 20 }}>
                  {t('home.fansIn', { place: t('home.country') })}
                </AppText>
                <FanCount fans={provinceTotal} size={18} />
                <View style={{ gap: 6 }}>
                  {activeFilter
                    ? provinceRows.map((row) => (
                        <View key={row.id} style={{ gap: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
                            <AppText variant="small" style={{ flex: 1, fontFamily: fontFamily.medium }}>
                              {row.id}
                            </AppText>
                            <FanCount fans={row.fans} />
                          </View>
                          <View style={{ height: 5, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
                            <View style={{ width: `${(row.fans / provinceMax) * 100}%`, height: 5, borderRadius: radius.pill, backgroundColor: barColor }} />
                          </View>
                        </View>
                      ))
                    : teamRows.map((row) => (
                        <View key={row.share.teamId} style={{ gap: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                              <Helmet team={row.team!} size={22} />
                              <AppText variant="small" style={{ flex: 1, fontFamily: fontFamily.medium }}>
                                {teamLabel(row.team!)}
                              </AppText>
                            </View>
                            <FanCount fans={row.share.fans} />
                          </View>
                          <View style={{ height: 5, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
                            <View style={{ width: `${(row.share.fans / teamMax) * 100}%`, height: 5, borderRadius: radius.pill, backgroundColor: readableTeamColor(row.team!.color) }} />
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
  );
}
