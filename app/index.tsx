import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { teamStars, weekGames, type WeekGame, type WeekSide } from '@/src/data/week';
import { teamById, teamLabel } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, radius, space } from '@/src/theme/tokens';
import { useAsk } from '@/src/ui/AskDock';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { FieldLive } from '@/src/ui/FieldLive';
import { Helmet } from '@/src/ui/Helmet';
import { Screen } from '@/src/ui/Screen';
import { StarRating } from '@/src/ui/StarRating';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

export default function AnalysisScreen() {
  const { t, i18n } = useTranslation();
  const { wide, regular } = useBreakpoint();
  const { colors } = useAppTheme();
  const { prefs } = useSession();
  const { setOpen } = useAsk();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Screen>
      <View style={{ gap: space.lg, alignItems: 'center' }}>
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
          <Button
            label={t('landing.tryPredictor')}
            onPress={() => {
              if (Platform.OS === 'web') document.getElementById('week')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
          <Button label={t('landing.join')} variant="secondary" onPress={() => router.push('/community')} />
        </View>
      </View>
      <View nativeID="week" style={{ gap: space.sm, alignItems: 'center' }}>
        <AppText variant="kicker" tone="accent">
          {t('analysis.kicker')}
        </AppText>
        <AppText variant="title" style={{ textAlign: 'center' }}>
          {t('analysis.title')}
        </AppText>
        <AppText variant="body" tone="muted" style={{ textAlign: 'center' }}>
          {t('analysis.week')}
        </AppText>
        <View style={{ width: '100%', maxWidth: wide ? 720 : '100%' }}>
          <FieldLive />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={{
          width: '100%',
          maxWidth: wide ? 640 : '100%',
          alignSelf: 'center',
          minHeight: 48,
          borderRadius: radius.pill,
          borderWidth: 1.5,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surface,
          justifyContent: 'center',
          paddingHorizontal: space.lg,
        }}>
        <AppText variant="body" tone="muted">
          {t('analysis.ask')}
        </AppText>
      </Pressable>

      <View style={{ width: '100%', maxWidth: wide ? 920 : '100%', alignSelf: 'center' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {weekGames.map((game, index) => (
            <GameRow
              key={game.id}
              game={game}
              open={openId === game.id}
              last={index === weekGames.length - 1}
              onToggle={() => setOpenId(openId === game.id ? null : game.id)}
            />
          ))}
        </Card>
        <AppText variant="small" tone="muted" style={{ marginTop: space.md, textAlign: 'center' }}>
          {t('analysis.disclaimer')}
        </AppText>
      </View>
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

function GameRow({ game, open, last, onToggle }: { game: WeekGame; open: boolean; last: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { compact } = useBreakpoint();
  const home = teamById(game.home.teamId);
  const away = teamById(game.away.teamId);
  const line = verdict(game);
  if (!home || !away) return null;

  return (
    <View style={{ borderBottomWidth: last && !open ? 0 : 1, borderBottomColor: colors.border }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          paddingHorizontal: space.lg,
          paddingVertical: space.md,
          backgroundColor: open ? colors.surfaceElevated : 'transparent',
        }}>
        <TeamSide side={game.away} />
        <View style={{ alignItems: 'center', minWidth: 88 }}>
          <AppText variant="stat" style={{ fontSize: 22, lineHeight: 26 }}>
            {line.scored ? `${game.awayScore}–${game.homeScore}` : t('landing.vs')}
          </AppText>
          <AppText variant="small" tone="accent" style={{ fontFamily: fontFamily.semibold }}>
            {t('analysis.margin', { margin: line.margin })}
          </AppText>
        </View>
        <TeamSide side={game.home} align="right" />
      </Pressable>
      {open ? (
        <View style={{ gap: space.lg, paddingHorizontal: space.lg, paddingBottom: space.lg, backgroundColor: colors.surfaceElevated }}>
          <AppText variant="body" style={{ textAlign: 'center', fontFamily: fontFamily.semibold }}>
            {line.scored ? t('analysis.verdictLine', line) : `${line.favorite}, ${t('analysis.margin', { margin: line.margin })}`}
          </AppText>
          {game.noteKey ? (
            <AppText variant="small" tone="muted" style={{ textAlign: 'center' }}>
              {t(game.noteKey)}
            </AppText>
          ) : null}
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
      ) : null}
    </View>
  );
}

function TeamSide({ side, align = 'left' }: { side: WeekSide; align?: 'left' | 'right' }) {
  const team = teamById(side.teamId);
  if (!team) return null;
  const end = align === 'right';
  return (
    <View style={{ flex: 1, flexDirection: end ? 'row-reverse' : 'row', alignItems: 'center', gap: space.sm }}>
      <Helmet team={team} size={36} />
      <View style={{ alignItems: end ? 'flex-end' : 'flex-start', gap: 2 }}>
        <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
          {team.abbr}
        </AppText>
        <AppText variant="small" tone="muted">
          {side.record}
        </AppText>
        <StarRating value={teamStars(side)} label={team.abbr} />
        {side.recent ? <FormLine recent={side.recent} align={align} /> : null}
      </View>
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
    <View style={{ flex: 1, gap: space.sm, padding: space.md, borderRadius: radius.card, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
          {team?.abbr}
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

