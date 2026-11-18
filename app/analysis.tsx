import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { teamStars, weekGames, type WeekGame, type WeekSide } from '@/src/data/week';
import { teamById, teamLabel } from '@/src/data/teams';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, radius, space } from '@/src/theme/tokens';
import { Screen } from '@/src/ui/Screen';
import { InView, Reveal } from '@/src/ui/Stage';
import { StarRating } from '@/src/ui/StarRating';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

export default function GamesScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { regular } = useBreakpoint();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Screen>
      <View style={{ gap: space.md, paddingBottom: space.lg }}>
        <AppText variant="kicker" tone="muted">
          {t('analysis.kicker')}
        </AppText>
        <View style={{ flexDirection: regular ? 'row' : 'column', justifyContent: 'space-between', alignItems: regular ? 'flex-end' : 'flex-start', gap: space.sm }}>
          <AppText variant="title" style={{ flex: 1 }}>
            {t('analysis.title')}
          </AppText>
          <AppText variant="body" tone="muted">
            {t('analysis.week')}
          </AppText>
        </View>
      </View>
      <View style={{ gap: space.xl }}>
        {weekGames.map((game) => (
          <GameRow
            key={game.id}
            game={game}
            open={openId === game.id}
            last={false}
            onToggle={() => setOpenId(openId === game.id ? null : game.id)}
          />
        ))}
      </View>
      <AppText variant="small" tone="muted">
        {t('analysis.disclaimer')}
      </AppText>
    </Screen>
  );
}

function verdict(game: WeekGame) {
  const favorite = teamById(game.favoriteId);
  const favoriteIsHome = game.favoriteId === game.home.teamId;
  const scored = game.homeScore != null && game.awayScore != null;
  return {
    favorite: favorite ? teamLabel(favorite) : '',
    winnerScore: scored ? (favoriteIsHome ? game.homeScore : game.awayScore) : '',
    loserScore: scored ? (favoriteIsHome ? game.awayScore : game.homeScore) : '',
    margin: scored ? Math.abs((game.homeScore ?? 0) - (game.awayScore ?? 0)) : game.margin,
    scored,
  };
}

function GameRow({ game, open, onToggle }: { game: WeekGame; open: boolean; last: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { compact } = useBreakpoint();
  const reduced = useReducedMotion();
  const home = teamById(game.home.teamId);
  const away = teamById(game.away.teamId);
  const line = verdict(game);
  if (!home || !away) return null;

  return (
    <InView>
    <View style={{ paddingVertical: space.md, paddingHorizontal: open ? space.lg : 0, backgroundColor: open ? colors.surface : 'transparent', borderRadius: open ? 16 : 0 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          paddingVertical: space.lg,
        }}>
        <TeamSide side={game.away} compact={compact} />
        <View style={{ alignItems: 'center', minWidth: 88 }}>
          <MotiView from={{ scale: reduced ? 1 : 0.82 }} animate={{ scale: 1 }} transition={{ type: 'timing', duration: reduced ? 0 : 700 } as never}>
          <AppText variant="stat" style={{ fontSize: compact ? 28 : 44, lineHeight: compact ? 32 : 48 }}>
            {line.scored ? `${game.awayScore}–${game.homeScore}` : t('landing.vs')}
          </AppText>
          </MotiView>
          <AppText variant="small" tone="accent" style={{ fontFamily: fontFamily.semibold }}>
            {t('analysis.margin', { margin: line.margin })}
          </AppText>
        </View>
        <TeamSide side={game.home} align="right" compact={compact} />
      </Pressable>
      <View style={{ gap: space.sm, paddingBottom: space.md, alignItems: 'center' }}>
        <AppText variant="body" style={{ textAlign: 'center', fontFamily: fontFamily.semibold }}>
          {line.scored ? t('analysis.verdictLine', line) : `${line.favorite}, ${t('analysis.margin', { margin: line.margin })}`}
        </AppText>
        <AppText variant="body" tone="muted" style={{ textAlign: 'center', maxWidth: 680 }}>
          {t(game.noteKey ?? `analysis.read.${game.id}`)}
        </AppText>
      </View>
      {open ? (
        <Reveal>
          <View style={{ gap: space.lg, paddingBottom: space.lg }}>
            <View style={{ flexDirection: compact ? 'column' : 'row', gap: space.md }}>
              <SideFacts side={game.away} />
              <SideFacts side={game.home} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              <Chip label={game.kickoff} />
              <Chip label={game.stadium} />
              {game.weather ? <Chip label={game.weather} /> : null}
            </View>
            <AppText variant="small" tone="muted">
              {t('analysis.noInjuries')}
            </AppText>
          </View>
        </Reveal>
      ) : null}
    </View>
    </InView>
  );
}

function TeamSide({ side, align = 'left', compact = false }: { side: WeekSide; align?: 'left' | 'right'; compact?: boolean }) {
  const team = teamById(side.teamId);
  if (!team) return null;
  const end = align === 'right';
  return (
    <View style={{ flex: 1, alignItems: end ? 'flex-end' : 'flex-start', gap: 2, minWidth: 0 }}>
      <AppText variant="small" tone="muted" style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {team.city}
      </AppText>
      <AppText variant="heading" numberOfLines={2} style={{ fontFamily: fontFamily.display, textAlign: end ? 'right' : 'left' }}>
        {team.name}
      </AppText>
      <AppText variant="small" tone="muted">
        {side.record}
      </AppText>
      {compact ? null : <StarRating value={teamStars(side)} label={team.abbr} />}
      {!compact && side.recent ? <FormLine recent={side.recent} align={align} /> : null}
    </View>
  );
}

function FormLine({ recent, align }: { recent: string; align: 'left' | 'right' }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row', gap: 3 }} accessibilityLabel={t('analysis.form')}>
      {recent.split('').map((mark, index) => (
        <View
          key={`${mark}-${index}`}
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: mark === 'W' ? colors.success : mark === 'L' ? colors.danger : colors.star,
          }}>
          <AppText variant="small" style={{ fontSize: 10, lineHeight: 12, color: mark === 'W' ? colors.success : mark === 'L' ? colors.danger : colors.star }}>
            {mark}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function SideFacts({ side }: { side: WeekSide }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const team = teamById(side.teamId);
  return (
    <View style={{ flex: 1, gap: space.sm, padding: space.lg, borderRadius: 16, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="heading" style={{ fontFamily: fontFamily.display }}>
          {team ? teamLabel(team) : ''}
        </AppText>
        <StarRating value={teamStars(side)} label={team?.abbr ?? ''} />
      </View>
      {side.recent ? (
        <AppText variant="small" tone="muted">
          {t('analysis.form')}
        </AppText>
      ) : null}
      {side.recent ? <FormLine recent={side.recent} align="left" /> : null}
      <AppText variant="small" tone="muted">
        {t('analysis.offense')}
      </AppText>
      <RankLine ground={side.offense.rush} air={side.offense.pass} />
      <AppText variant="small" tone="muted">
        {t('analysis.defense')}
      </AppText>
      <RankLine ground={side.defense.rush} air={side.defense.pass} />
      <AppText variant="small" tone="muted">
        {t('analysis.noInjuries')}
      </AppText>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL(side.injuryReportUrl)} style={{ minHeight: 44, justifyContent: 'center' }}>
        <AppText variant="small" tone="accent" style={{ fontFamily: fontFamily.semibold }}>
          {t('analysis.report')}
        </AppText>
      </Pressable>
    </View>
  );
}

function RankLine({ ground, air }: { ground: number; air: number }) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: space.md }}>
      <AppText variant="small">
        {t('analysis.ground')} {t('analysis.rank', { rank: ground })}
      </AppText>
      <AppText variant="small">
        {t('analysis.air')} {t('analysis.rank', { rank: air })}
      </AppText>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border }}>
      <AppText variant="small">{label}</AppText>
    </View>
  );
}
