import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { teamById, type Team } from '@/src/data/teams';
import { lineScore, teamStars, weekGames, weekResults, type WeekGame, type WeekSide } from '@/src/data/week';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, lift, radius, space } from '@/src/theme/tokens';
import { Card } from '@/src/ui/Card';
import { Helmet } from '@/src/ui/Helmet';
import { Badge, ScreenHeader, Segmented } from '@/src/ui/Kit';
import { ResultRow } from '@/src/ui/Match';
import { Screen } from '@/src/ui/Screen';
import { InView, Reveal } from '@/src/ui/Stage';
import { StarRating } from '@/src/ui/StarRating';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type Filter = 'all' | 'mine';
type Week = '11' | '10';

export default function GamesScreen() {
  const { t } = useTranslation();
  const { auth } = useSession();
  const { wide } = useBreakpoint();
  const params = useLocalSearchParams<{ game?: string; week?: string }>();
  const focus = params.game;
  const asked: Week = params.week === '10' ? '10' : '11';
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [week, setWeek] = useState<Week>(asked);
  const [seen, setSeen] = useState(`${focus}|${asked}`);
  const [filter, setFilter] = useState<Filter>('all');
  const teamId = auth?.teamId ?? null;

  // Al llegar desde el hero (un partido) o desde la barra de marcadores (una jornada), se abre eso.
  if (`${focus}|${asked}` !== seen) {
    setSeen(`${focus}|${asked}`);
    setOpenId(focus ?? null);
    setWeek(asked);
  }

  const ordered = focus ? [...weekGames].sort((left, right) => Number(right.id === focus) - Number(left.id === focus)) : weekGames;
  const mine = ordered.filter((game) => game.home.teamId === teamId || game.away.teamId === teamId);
  const list = filter === 'mine' ? mine : ordered;
  const picker = <WeekPicker value={week} onChange={setWeek} />;

  if (week === '10') {
    const half = Math.ceil(weekResults.length / 2);
    const columns = wide ? [weekResults.slice(0, half), weekResults.slice(half)] : [weekResults];
    return (
      <Screen>
        <ScreenHeader title={t('app.quickGames')} subtitle={t('app.resultsSubtitle', { count: weekResults.length })} trailing={picker} />
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: space.lg, alignItems: 'flex-start' }}>
          {columns.map((column, index) => (
            <Card key={index} style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', paddingVertical: space.xs, gap: 0 }}>
              {column.map((result, row) => (
                <ResultRow key={`${result.awayId}-${result.homeId}`} result={result} divider={row < column.length - 1} />
              ))}
            </Card>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title={t('app.quickGames')} subtitle={t('app.gamesSubtitle', { count: weekGames.length })} trailing={picker} />
      {teamId ? (
        <Segmented<Filter>
          options={[
            { id: 'all', label: t('team.all') },
            { id: 'mine', label: t('app.yourTeam') },
          ]}
          value={filter}
          onChange={setFilter}
        />
      ) : null}
      <View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: space.md }}>
        {list.map((game) => (
          <View key={game.id} style={{ width: wide ? '48.8%' : '100%' }}>
            <GameCard game={game} open={openId === game.id} onToggle={() => setOpenId(openId === game.id ? null : game.id)} />
          </View>
        ))}
      </View>
      <AppText variant="caption" tone="muted" style={{ fontSize: 13, lineHeight: 19 }}>
        {t('analysis.disclaimer')}
      </AppText>
    </Screen>
  );
}

/**
 * Marcador compacto: visitante y local en dos filas, como un scoreboard.
 * La tarjeta entera abre la lectura completa y las cifras de cada equipo.
 */
function GameCard({ game, open, onToggle }: { game: WeekGame; open: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const home = teamById(game.home.teamId);
  const away = teamById(game.away.teamId);
  const favorite = teamById(game.favoriteId);
  if (!home || !away) return null;
  const scored = game.homeScore != null && game.awayScore != null;
  const expected = lineScore(game);

  return (
    <InView>
      <Card style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${away.name} @ ${home.name}`}
          onPress={onToggle}
          style={({ pressed }) => ({ padding: space.lg + 2, gap: space.md, backgroundColor: pressed ? colors.surfaceElevated : 'transparent' })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textMuted} />
            <AppText variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
              {game.kickoff} · {game.stadium}
            </AppText>
            <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
          </View>

          <View style={{ gap: space.sm }}>
            {scored ? null : (
              <AppText variant="caption" tone="muted">
                {t('app.expected')}
              </AppText>
            )}
            <TeamLine team={away} side={game.away} score={scored ? game.awayScore : expected.away} favorite={game.favoriteId === away.id} />
            <TeamLine team={home} side={game.home} score={scored ? game.homeScore : expected.home} favorite={game.favoriteId === home.id} />
            {scored ? null : (
              <AppText variant="caption" tone="muted" style={{ fontSize: 12, lineHeight: 16, fontVariant: ['tabular-nums'] }}>
                {t('app.lineShort')} · {favorite?.abbr} −{game.margin}
              </AppText>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <MaterialCommunityIcons name="creation" size={15} color={colors.accent} style={{ marginTop: 3 }} />
            <AppText variant="small" tone="muted" style={{ flex: 1, lineHeight: 21 }} numberOfLines={open ? undefined : 2}>
              {t(game.noteKey ?? `analysis.read.${game.id}`)}
            </AppText>
          </View>
        </Pressable>

        {open ? (
          <Reveal>
            <View style={{ paddingHorizontal: space.lg + 2, paddingBottom: space.lg + 2, gap: space.md }}>
              <View style={{ flexDirection: 'row', gap: space.md }}>
                <SideFacts side={game.away} />
                <SideFacts side={game.home} />
              </View>
              {game.weather ? <Badge label={game.weather} /> : null}
            </View>
          </Reveal>
        ) : null}
      </Card>
    </InView>
  );
}

/** Una fila del marcador: insignia, nombre, récord y, si hay, el puntaje. */
function TeamLine({ team, side, score, favorite }: { team: Team; side: WeekSide; score: number | null; favorite: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Helmet team={team} size={36} />
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <AppText variant="label" numberOfLines={1} style={{ fontSize: 16, flexShrink: 1 }}>
          {team.name}
        </AppText>
        <AppText variant="caption" tone="muted" style={{ fontVariant: ['tabular-nums'] }}>
          {side.record}
        </AppText>
        {favorite ? (
          <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill, backgroundColor: colors.accent }}>
            <AppText style={{ fontSize: 10, lineHeight: 14, fontFamily: fontFamily.bold, color: '#FFFFFF' }}>{t('app.favoriteShort')}</AppText>
          </View>
        ) : null}
      </View>
      {score != null ? (
        <AppText variant="stat" style={{ fontSize: 22, lineHeight: 26 }}>
          {score}
        </AppText>
      ) : null}
    </View>
  );
}

function SideFacts({ side }: { side: WeekSide }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const team = teamById(side.teamId);
  return (
    <View style={{ flex: 1, gap: space.sm, padding: space.md, borderRadius: radius.control + 2, backgroundColor: colors.surfaceElevated }}>
      <AppText variant="label">{team?.abbr ?? ''}</AppText>
      <StarRating value={teamStars(side)} label={team?.abbr ?? ''} />
      {side.recent ? <FormLine recent={side.recent} /> : null}
      {side.showPhase === false ? (
        side.pointsFor != null && side.pointsAgainst != null ? (
          <>
            <Fact label={t('analysis.pointsFor')} value={String(side.pointsFor)} />
            <Fact label={t('analysis.pointsAgainst')} value={String(side.pointsAgainst)} />
          </>
        ) : null
      ) : (
        <>
          <Fact label={`${t('analysis.offense')} · ${t('analysis.ground')}`} value={t('analysis.rank', { rank: side.offense.rush })} />
          <Fact label={`${t('analysis.offense')} · ${t('analysis.air')}`} value={t('analysis.rank', { rank: side.offense.pass })} />
          <Fact label={`${t('analysis.defense')} · ${t('analysis.ground')}`} value={t('analysis.rank', { rank: side.defense.rush })} />
          <Fact label={`${t('analysis.defense')} · ${t('analysis.air')}`} value={t('analysis.rank', { rank: side.defense.pass })} />
        </>
      )}
      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(side.injuryReportUrl)}
        style={{ minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <AppText variant="caption" tone="accent" style={{ fontFamily: fontFamily.semibold }}>
          {t('analysis.report')}
        </AppText>
        <MaterialCommunityIcons name="arrow-top-right" size={13} color={colors.accent} />
      </Pressable>
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 1 }}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
        {value}
      </AppText>
    </View>
  );
}

function FormLine({ recent }: { recent: string }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }} accessibilityLabel={`${t('analysis.form')}: ${recent}`}>
      {recent.split('').map((mark, index) => {
        const ink = mark === 'W' ? colors.success : mark === 'L' ? colors.danger : colors.star;
        return (
          <View key={`${mark}-${index}`} style={{ width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: ink }}>
            <AppText style={{ fontSize: 9, lineHeight: 11, color: '#FFFFFF', fontFamily: fontFamily.bold }}>{mark}</AppText>
          </View>
        );
      })}
    </View>
  );
}

/** Selector de jornada: la que viene y la anterior con sus resultados. */
function WeekPicker({ value, onChange }: { value: Week; onChange: (week: Week) => void }) {
  const { t } = useTranslation();
  const { colors, name } = useAppTheme();
  const [open, setOpen] = useState(false);
  const options: { id: Week; label: string; detail: string }[] = [
    { id: '11', label: t('app.week11'), detail: t('app.weekUpcoming') },
    { id: '10', label: t('app.week10'), detail: t('app.weekFinals') },
  ];
  const current = options.find((option) => option.id === value) ?? options[0];

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ backgroundColor: colors.surface, borderRadius: radius.control + 4, paddingVertical: space.xs, marginTop: space.xs }}
      anchor={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('app.chooseWeek')}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((next) => !next)}
          style={({ pressed }) => [
            {
              minHeight: 44,
              paddingLeft: space.lg,
              paddingRight: space.md,
              borderRadius: radius.pill,
              backgroundColor: colors.surface,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              opacity: pressed ? 0.75 : 1,
            },
            name === 'light' ? lift : { borderWidth: 1, borderColor: colors.border },
          ]}>
          <AppText variant="small" style={{ fontFamily: fontFamily.bold }}>
            {current.label}
          </AppText>
          <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text} />
        </Pressable>
      }>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: active }}
            onPress={() => {
              onChange(option.id);
              setOpen(false);
            }}
            style={({ pressed }) => ({
              minWidth: 220,
              minHeight: 56,
              paddingHorizontal: space.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              backgroundColor: pressed ? colors.surfaceElevated : 'transparent',
            })}>
            <View style={{ flex: 1 }}>
              <AppText variant="label">{option.label}</AppText>
              <AppText variant="caption" tone="muted">
                {option.detail}
              </AppText>
            </View>
            {active ? <MaterialCommunityIcons name="check" size={18} color={colors.accent} /> : null}
          </Pressable>
        );
      })}
    </Menu>
  );
}
