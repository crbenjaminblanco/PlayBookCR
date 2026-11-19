import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { teamById } from '@/src/data/teams';
import type { WeekGame } from '@/src/data/week';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, space } from '@/src/theme/tokens';
import { Helmet } from '@/src/ui/Helmet';
import { AppText } from '@/src/ui/Text';

/** Dos insignias superpuestas, visitante delante. */
export function PairMark({ awayId, homeId, size = 36 }: { awayId: string; homeId: string; size?: number }) {
  const { colors } = useAppTheme();
  const away = teamById(awayId);
  const home = teamById(homeId);
  if (!away || !home) return null;
  return (
    <View style={{ width: size * 1.82, height: size }}>
      <Helmet team={away} size={size} ring={colors.surface} />
      <View style={{ position: 'absolute', left: size * 0.82 }}>
        <Helmet team={home} size={size} ring={colors.surface} />
      </View>
    </View>
  );
}

/** Fila compacta de un partido de la semana: insignias, cruce, hora y favorito. */
export function MatchRow({ game, divider = true }: { game: WeekGame; divider?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const away = teamById(game.away.teamId);
  const home = teamById(game.home.teamId);
  const favorite = teamById(game.favoriteId);
  if (!away || !home) return null;
  const scored = game.homeScore != null && game.awayScore != null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        minHeight: 68,
        paddingVertical: space.md,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: colors.border,
      }}>
      <PairMark awayId={away.id} homeId={home.id} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <AppText variant="label" numberOfLines={1}>
          {away.name} <AppText variant="label" tone="muted">@</AppText> {home.name}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 13, lineHeight: 18 }}>
          {game.kickoff} · {game.stadium}
        </AppText>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        {scored ? (
          <AppText variant="label" style={{ fontVariant: ['tabular-nums'] }}>
            {game.awayScore}–{game.homeScore}
          </AppText>
        ) : (
          <AppText variant="label" style={{ fontFamily: fontFamily.bold }}>
            {favorite?.abbr} −{game.margin}
          </AppText>
        )}
        <AppText variant="caption" tone="muted">
          {scored ? t('app.final') : t('app.favorite')}
        </AppText>
      </View>
    </View>
  );
}

export type FinalScore = { awayId: string; homeId: string; awayScore: number; homeScore: number };

/** Fila de un resultado final: insignias, cruce con el ganador resaltado y marcador. */
export function ResultRow({ result, divider = true }: { result: FinalScore; divider?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const away = teamById(result.awayId);
  const home = teamById(result.homeId);
  if (!away || !home) return null;
  const awayWon = result.awayScore > result.homeScore;
  const winner = awayWon ? away : home;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        minHeight: 64,
        paddingVertical: space.md,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: colors.border,
      }}>
      <PairMark awayId={away.id} homeId={home.id} size={32} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <AppText variant="label" numberOfLines={1}>
          <AppText variant="label" tone={awayWon ? 'default' : 'muted'}>
            {away.name}
          </AppText>
          <AppText variant="label" tone="muted">
            {' @ '}
          </AppText>
          <AppText variant="label" tone={awayWon ? 'muted' : 'default'}>
            {home.name}
          </AppText>
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 13, lineHeight: 18 }}>
          {t('app.wins', { team: winner.name })}
        </AppText>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <AppText variant="label" style={{ fontFamily: fontFamily.bold, fontVariant: ['tabular-nums'] }}>
          {result.awayScore}–{result.homeScore}
        </AppText>
        <AppText variant="caption" tone="muted">
          {t('app.final')}
        </AppText>
      </View>
    </View>
  );
}
