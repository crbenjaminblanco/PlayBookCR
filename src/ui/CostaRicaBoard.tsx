import { useMemo, useState, type ReactNode } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { CostaRicaMap, mixColor } from '@/src/components/CostaRicaMap';
import { countryShares, leadingShare, provinceFans, provinces, teamFans, type ProvinceId } from '@/src/data/provinces';
import { teamById, teams, type Team } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, radius, space } from '@/src/theme/tokens';
import { Card } from '@/src/ui/Card';
import { FanPodium } from '@/src/ui/FanPodium';
import { Helmet } from '@/src/ui/Helmet';
import { Section } from '@/src/ui/Kit';
import { StateMessage } from '@/src/ui/StateMessage';
import { SwipeRow } from '@/src/ui/SwipeRow';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';
import { useDemoLoad } from '@/src/ui/useDemoLoad';

/**
 * Afición por provincia en dos tarjetas:
 * 1. el mapa con su filtro, su leyenda, la elección de provincia y el detalle de esa provincia;
 * 2. el ranking nacional de equipos.
 */
export function CostaRicaBoard({ aside }: { aside?: ReactNode } = {}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { auth } = useSession();
  const { wide } = useBreakpoint();
  const favorite = teamById(auth?.teamId);
  const { status, retry } = useDemoLoad();
  const [picked, setPicked] = useState<ProvinceId | null>(null);
  const [hoveredId, setHoveredId] = useState<ProvinceId | null>(null);
  const [mapWidth, setMapWidth] = useState(320);
  const [teamFilter, setTeamFilter] = useState<string | null>(null);

  const provinceRows = useMemo(
    () =>
      provinces
        .map((province) => ({ id: province.id, fans: teamFans(province, teamFilter) }))
        .sort((left, right) => right.fans - left.fans),
    [teamFilter],
  );
  const teamRows = useMemo(() => {
    const totals = new Map(countryShares().map((share) => [share.teamId, share.fans]));
    return teams
      .map((team) => ({ team, fans: totals.get(team.id) ?? 0 }))
      .sort((left, right) => right.fans - left.fans || left.team.city.localeCompare(right.team.city));
  }, []);

  if (status === 'loading') return <StateMessage variant="loading" title={t('common.loading')} />;
  if (status === 'error') return <StateMessage variant="error" title={t('common.error')} actionLabel={t('common.retry')} onAction={retry} />;

  const activeFilter = teamById(teamFilter);
  // Sin elección, el detalle muestra la provincia con más afición para que nunca quede vacío.
  const selectedId = picked ?? provinceRows[0]?.id ?? null;
  const selected = provinces.find((province) => province.id === selectedId);

  const mapSide = (
    <View style={{ gap: space.lg, flex: wide ? 1.15 : undefined, minWidth: 0 }}>
      <TeamDropdown rows={teamRows} value={teamFilter} onChange={setTeamFilter} />

      <View style={{ width: '100%', alignItems: 'center' }} onLayout={(event) => setMapWidth(Math.min(event.nativeEvent.layout.width, wide ? 560 : 460))}>
        <CostaRicaMap
          provinces={provinces}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={setPicked}
          width={mapWidth}
          teamId={teamFilter}
        />
      </View>

      <Legend label={activeFilter ? t('app.legendTeam', { team: activeFilter.name }) : t('app.legendAll')} />

      <SwipeRow accessibilityLabel={t('app.pickProvince')} inset={wide ? 0 : space.lg + 4} bleed={!wide} gap={space.sm}>
        {provinceRows.map((row) => {
          const active = row.id === selectedId;
          return (
            <Pressable
              key={row.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setPicked(row.id)}
              style={({ pressed }) => ({
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: radius.pill,
                justifyContent: 'center',
                backgroundColor: active ? colors.accentFill : colors.surfaceElevated,
                opacity: pressed ? 0.75 : 1,
              })}>
              <AppText variant="small" style={{ fontFamily: fontFamily.bold, color: active ? colors.accentText : colors.text }}>
                {row.id}
              </AppText>
            </Pressable>
          );
        })}
      </SwipeRow>
    </View>
  );

  const detail = selected ? <ProvinceDetail province={selected} teamId={teamFilter} favoriteId={favorite?.id ?? null} /> : null;

  // Escritorio: mapa a la izquierda y detalle de la provincia a la derecha, dentro de la misma tarjeta.
  const mapCard = wide ? (
    <Card style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start', padding: space.xl }}>
      {mapSide}
      <View style={{ flex: 1, minWidth: 0 }}>{detail}</View>
    </Card>
  ) : (
    <Card style={{ gap: space.lg }}>
      {mapSide}
      {detail}
    </Card>
  );

  // El mismo podio que en Inicio; aquí se abre a los 32 y tocar un equipo filtra el mapa.
  const rankCard = (
    <Card>
      <FanPodium rows={3} expandable activeId={teamFilter} onPickTeam={(id) => setTeamFilter(teamFilter === id ? null : id)} />
    </Card>
  );

  // El ranking va primero. El mapa queda debajo, a todo el ancho en escritorio.
  if (wide) {
    return (
      <View style={{ gap: space.xl }}>
        <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
          <Section title={t('app.nationalRanking')} style={{ flex: 1 }}>
            {rankCard}
          </Section>
          {aside ? <View style={{ flex: 1 }}>{aside}</View> : null}
        </View>
        <Section title={t('app.map')}>{mapCard}</Section>
      </View>
    );
  }

  return (
    <View style={{ gap: space.xl }}>
      <Section title={t('app.nationalRanking')}>{rankCard}</Section>
      <Section title={t('app.map')}>{mapCard}</Section>
    </View>
  );
}

/** Leyenda de la escala: menos a más, en el mismo cobalto del mapa. */
function Legend({ label }: { label: string }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const steps = [0.18, 0.38, 0.58, 0.78, 1];
  const ramp =
    Platform.OS === 'web'
      ? ({ backgroundImage: `linear-gradient(90deg, ${mixColor(colors.mapLow, colors.mapHigh, 0.18)}, ${colors.mapHigh})` } as object)
      : null;
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <AppText variant="caption" tone="muted">
          {t('app.less')}
        </AppText>
        <View style={[{ flex: 1, height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden' }, ramp]}>
          {ramp ? null : steps.map((step) => <View key={step} style={{ flex: 1, backgroundColor: mixColor(colors.mapLow, colors.mapHigh, step) }} />)}
        </View>
        <AppText variant="caption" tone="muted">
          {t('app.more')}
        </AppText>
      </View>
    </View>
  );
}

/** Detalle de la provincia elegida, dentro de la tarjeta: total, líder y reparto de equipos. */
function ProvinceDetail({ province, teamId, favoriteId }: { province: (typeof provinces)[number]; teamId: string | null; favoriteId: string | null }) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'es-CR');
  const total = provinceFans(province);
  const leader = teamById(leadingShare(province).teamId);
  const filter = teamById(teamId);
  const shares = [...province.shares].sort((left, right) => right.fans - left.fans);
  const top = shares.slice(0, 5);
  const max = top[0]?.fans || 1;
  const filterRank = filter ? shares.findIndex((share) => share.teamId === filter.id) + 1 : 0;
  const filterFans = filter ? teamFans(province, filter.id) : 0;

  return (
    <View style={{ gap: space.md, padding: space.lg, borderRadius: radius.card - 4, backgroundColor: colors.surfaceElevated }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">{province.id}</AppText>
          <AppText variant="caption" tone="muted">
            {t('app.provinceFans', { count: number.format(total) })}
          </AppText>
        </View>
        {leader ? (
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="caption" tone="muted">
              {t('app.leads')}
            </AppText>
            <AppText variant="label">{leader.name}</AppText>
          </View>
        ) : null}
      </View>

      {filter ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.control, backgroundColor: colors.surface }}>
          <Helmet team={filter} size={36} />
          <View style={{ flex: 1 }}>
            <AppText variant="label">{filter.name}</AppText>
            <AppText variant="caption" tone="muted">
              {number.format(filterFans)} · {total ? Math.round((filterFans / total) * 100) : 0} %
            </AppText>
          </View>
          {filterRank ? (
            <AppText variant="stat" tone="accent" style={{ fontSize: 22, lineHeight: 26 }}>
              #{filterRank}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {top.map((share) => {
        const team = teamById(share.teamId);
        if (!team) return null;
        const percent = total ? Math.round((share.fans / total) * 100) : 0;
        const strong = share.teamId === favoriteId || share.teamId === teamId;
        return (
          <View key={share.teamId} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Helmet team={team} size={28} />
            <View style={{ flex: 1, gap: 5 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
                <AppText variant="small" numberOfLines={1} style={{ flex: 1, fontFamily: strong ? fontFamily.bold : fontFamily.semibold }}>
                  {team.name}
                </AppText>
                <AppText variant="small" tone="muted" style={{ fontVariant: ['tabular-nums'] }}>
                  {percent} %
                </AppText>
              </View>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.surface, overflow: 'hidden' }}>
                <View style={{ width: `${(share.fans / max) * 100}%`, height: 5, borderRadius: 3, backgroundColor: colors.accent, opacity: strong ? 1 : 0.55 }} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Selector de equipo para el mapa: una píldora con el equipo elegido que abre
 * la lista de los 32, ordenada por afición, con insignia y cifra.
 */
function TeamDropdown({ rows, value, onChange }: { rows: { team: Team; fans: number }[]; value: string | null; onChange: (id: string | null) => void }) {
  const { t, i18n } = useTranslation();
  const { colors, name } = useAppTheme();
  const [open, setOpen] = useState(false);
  const current = teamById(value);
  const compact = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'es-CR', { notation: 'compact', maximumFractionDigits: 1 });
  const pick = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ backgroundColor: colors.surface, borderRadius: radius.control + 4, paddingVertical: space.xs, marginTop: space.xs, maxHeight: 380, width: 300 }}
      anchor={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.filter')}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((next) => !next)}
          style={({ pressed }) => [
            {
              alignSelf: 'stretch',
              minHeight: 52,
              paddingLeft: current ? 6 : space.lg,
              paddingRight: space.md,
              borderRadius: radius.pill,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.sm,
              backgroundColor: colors.surfaceElevated,
              opacity: pressed ? 0.8 : 1,
            },
            name === 'dark' ? { borderWidth: 1, borderColor: colors.border } : null,
          ]}>
          {current ? <Helmet team={current} size={40} /> : <MaterialCommunityIcons name="filter-variant" size={20} color={colors.textMuted} />}
          <View style={{ flex: 1 }}>
            <AppText variant="caption" tone="muted">
              {t('home.filter')}
            </AppText>
            <AppText variant="label" numberOfLines={1}>
              {current ? `${current.city} ${current.name}` : t('app.allTeams')}
            </AppText>
          </View>
          <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={colors.text} />
        </Pressable>
      }>
      <ScrollView style={{ maxHeight: 370 }}>
        <MenuRow active={!value} onPress={() => pick(null)} label={t('app.allTeams')} />
        {rows.map((row, index) => (
          <MenuRow
            key={row.team.id}
            active={value === row.team.id}
            onPress={() => pick(row.team.id)}
            label={row.team.name}
            team={row.team}
            detail={`${index + 1}. · ${compact.format(row.fans)}`}
          />
        ))}
      </ScrollView>
    </Menu>
  );
}

function MenuRow({ label, detail, team, active, onPress }: { label: string; detail?: string; team?: Team; active: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({
        minHeight: 52,
        paddingHorizontal: space.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        backgroundColor: pressed || hovered ? colors.surfaceElevated : 'transparent',
      })}>
      {team ? (
        <Helmet team={team} size={32} />
      ) : (
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="earth" size={17} color={colors.textMuted} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <AppText variant="label">{label}</AppText>
        {detail ? (
          <AppText variant="caption" tone="muted">
            {detail}
          </AppText>
        ) : null}
      </View>
      {active ? <MaterialCommunityIcons name="check" size={18} color={colors.accent} /> : null}
    </Pressable>
  );
}
