import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CostaRicaMap } from '@/src/components/CostaRicaMap';
import { countryShares, provinces, teamFans, type ProvinceId } from '@/src/data/provinces';
import { teamById, teamLabel, teams } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, radius, space } from '@/src/theme/tokens';
import { FanCount } from '@/src/ui/FanCount';
import { readableTeamColor } from '@/src/ui/teamColor';
import { StateMessage } from '@/src/ui/StateMessage';
import { Select } from '@/src/ui/Select';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';
import { useDemoLoad } from '@/src/ui/useDemoLoad';

export function CostaRicaBoard({ embedded = false, showHeading = true }: { embedded?: boolean; showHeading?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { auth } = useSession();
  const { regular, wide } = useBreakpoint();
  const favorite = teamById(auth?.teamId);
  const { status, retry } = useDemoLoad();
  const [selectedId, setSelectedId] = useState<ProvinceId | null>(null);
  const [openId, setOpenId] = useState<ProvinceId | null>(null);
  const [mapWidth, setMapWidth] = useState(420);
  const [mapHeight, setMapHeight] = useState(396);
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [showAllTeams, setShowAllTeams] = useState(false);
  const provinceRows = useMemo(
    () =>
      provinces
        .map((province) => ({ id: province.id, fans: teamFans(province, teamFilter) }))
        .sort((left, right) => right.fans - left.fans),
    [teamFilter],
  );
  const provinceTotal = provinceRows.reduce((sum, row) => sum + row.fans, 0);
  const provinceMax = provinceRows[0]?.fans || 1;
  const teamRows = useMemo(() => {
    const totals = new Map(countryShares().map((share) => [share.teamId, share.fans]));
    return teams
      .map((team) => ({ team, fans: totals.get(team.id) ?? 0 }))
      .sort((left, right) => right.fans - left.fans || left.team.city.localeCompare(right.team.city));
  }, []);
  const teamPreview = 8;
  const teamMax = teamRows[0]?.fans || 1;
  const activeFilter = teamById(teamFilter);
  const stackedTeams = showAllTeams || activeFilter ? teamRows : teamRows.slice(0, teamPreview);
  const barColor = activeFilter ? readableTeamColor(activeFilter.color) : colors.accent;
  const teamList = activeFilter
    ? provinceRows.map((row) => (
        <View key={row.id} style={{ gap: space.xs }}>
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
    : stackedTeams.map((row) => (
        <View key={row.team.id} style={{ gap: space.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <AppText variant="small" style={{ flex: 1, fontFamily: fontFamily.display }}>
                {teamLabel(row.team)}
              </AppText>
            </View>
            <FanCount fans={row.fans} />
          </View>
          <View style={{ height: 5, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
            <View style={{ width: `${(row.fans / teamMax) * 100}%`, height: 5, borderRadius: radius.pill, backgroundColor: readableTeamColor(row.team.color) }} />
          </View>
        </View>
      ));

  return (
    <View style={{ width: '100%', maxWidth: embedded ? undefined : 1120, alignSelf: 'center', paddingHorizontal: embedded ? 0 : regular ? 32 : 16, gap: space.lg, paddingTop: embedded ? 0 : space.xl, zIndex: openId ? 30 : 0 }}>
      {showHeading ? (
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
      ) : null}
      {status === 'loading' ? <StateMessage variant="loading" title={t('common.loading')} /> : null}
      {status === 'error' ? <StateMessage variant="error" title={t('common.error')} actionLabel={t('common.retry')} onAction={retry} /> : null}
      {status === 'ready' && provinces.length > 0 ? (
        <View style={{ position: 'relative', gap: space.xxl }}>
          {openId ? null : (
            <View style={{ gap: space.sm, width: '100%', alignSelf: 'stretch', alignItems: 'stretch', zIndex: 36 }}>
              <AppText variant="small" tone="muted" style={{ fontFamily: fontFamily.semibold }}>
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
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? space.xxxl : space.xl, alignItems: 'stretch', width: '100%' }}>
            <View
              style={{ width: wide ? 560 : '100%', maxWidth: wide ? 560 : undefined, alignSelf: 'stretch' }}
              onLayout={(event) => {
                setMapWidth(event.nativeEvent.layout.width);
                setMapHeight(event.nativeEvent.layout.height);
              }}>
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
            <View style={{ flex: 1, width: '100%', alignSelf: 'stretch', gap: space.md }}>
                <AppText variant="kicker" tone="muted">
                  {t('home.fansIn', { place: t('home.country') })}
                </AppText>
                <FanCount fans={provinceTotal} size={28} />
                <View style={{ gap: space.sm }}>
                  {teamList}
                  {!activeFilter && teamRows.length > teamPreview ? (
                    <Pressable accessibilityRole="button" onPress={() => setShowAllTeams((current) => !current)} style={{ minHeight: 44, alignItems: 'flex-start', justifyContent: 'center' }}>
                      <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
                        {showAllTeams ? t('home.showLess') : t('home.showMore')}
                      </AppText>
                    </Pressable>
                  ) : null}
                </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
