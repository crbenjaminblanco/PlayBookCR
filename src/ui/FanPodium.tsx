import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { countryShares } from '@/src/data/provinces';
import { teamById } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, radius, space } from '@/src/theme/tokens';
import { Helmet } from '@/src/ui/Helmet';
import { AppText } from '@/src/ui/Text';

type Props = {
  /** Filas después del podio que se ven de entrada (4.º en adelante). */
  rows?: number;
  /** Permite abrir la lista completa de los 32. */
  expandable?: boolean;
  /** Equipo resaltado (el filtro activo del mapa, por ejemplo). */
  activeId?: string | null;
  /** Qué pasa al tocar un equipo. Sin esto, las filas no se tocan. */
  onPickTeam?: (teamId: string) => void;
  /** Al tocar la franja de su equipo. */
  onPickMine?: () => void;
};

/**
 * Afición nacional como podio: los tres primeros en pedestales, el resto en filas y el
 * equipo de la persona en una franja al final. Lo comparten Inicio y Comunidad.
 */
export function FanPodium({ rows = 2, expandable = false, activeId = null, onPickTeam, onPickMine }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const { auth } = useSession();
  const [open, setOpen] = useState(false);
  const shares = countryShares();
  const total = shares.reduce((sum, share) => sum + share.fans, 0);
  const locale = i18n.language === 'en' ? 'en-US' : 'es-CR';
  const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
  const percent = (fans: number) => `${Math.round((fans / total) * 100)} %`;
  const mine = teamById(auth?.teamId);
  const myRank = mine ? shares.findIndex((share) => share.teamId === mine.id) + 1 : 0;
  const myFans = mine ? (shares.find((share) => share.teamId === mine.id)?.fans ?? 0) : 0;
  // Orden del podio: segundo, primero, tercero.
  const podium = [shares[1], shares[0], shares[2]].map((share, index) => ({ share, place: [2, 1, 3][index] }));
  const rest = shares.slice(3, open ? shares.length : 3 + rows);
  const mineVisible = myRank > 0 && myRank <= 3 + rest.length;

  return (
    <View style={{ gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
        <AppText variant="stat" style={{ fontSize: 30, lineHeight: 36, letterSpacing: -1 }}>
          {compact.format(total)}
        </AppText>
        <AppText variant="small" tone="muted" style={{ flex: 1 }}>
          {t('app.fansTotal')}
        </AppText>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
        {podium.map(({ share, place }) => {
          const team = share ? teamById(share.teamId) : undefined;
          if (!team || !share) return <View key={place} style={{ flex: 1 }} />;
          const first = place === 1;
          const active = team.id === activeId;
          return (
            <Pressable
              key={team.id}
              accessibilityRole={onPickTeam ? 'button' : undefined}
              accessibilityLabel={`${place}. ${team.city} ${team.name}, ${compact.format(share.fans)}`}
              disabled={!onPickTeam}
              onPress={() => onPickTeam?.(team.id)}
              style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: space.sm, opacity: pressed ? 0.75 : 1 })}>
              <Helmet team={team} size={first ? 52 : 42} ring={active ? colors.accent : undefined} />
              <View style={{ alignItems: 'center' }}>
                <AppText variant="small" numberOfLines={1} style={{ fontFamily: fontFamily.bold }}>
                  {team.name}
                </AppText>
                <AppText variant="caption" tone="muted" style={{ fontVariant: ['tabular-nums'] }}>
                  {compact.format(share.fans)} · {percent(share.fans)}
                </AppText>
              </View>
              <View
                style={{
                  alignSelf: 'stretch',
                  height: first ? 76 : place === 2 ? 56 : 42,
                  borderTopLeftRadius: radius.control,
                  borderTopRightRadius: radius.control,
                  borderBottomLeftRadius: 6,
                  borderBottomRightRadius: 6,
                  backgroundColor: first ? colors.accent : colors.surfaceElevated,
                  borderWidth: active && !first ? 2 : 0,
                  borderColor: colors.accent,
                  alignItems: 'center',
                  paddingTop: space.sm,
                }}>
                <AppText variant="stat" style={{ fontSize: first ? 26 : 20, lineHeight: first ? 30 : 24, color: first ? '#FFFFFF' : colors.textMuted }}>
                  {place}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View>
        {rest.map((share, index) => {
          const team = teamById(share.teamId);
          if (!team) return null;
          const active = team.id === activeId;
          const isMine = team.id === mine?.id;
          return (
            <Pressable
              key={team.id}
              accessibilityRole={onPickTeam ? 'button' : undefined}
              disabled={!onPickTeam}
              onPress={() => onPickTeam?.(team.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                minHeight: 48,
                paddingHorizontal: active ? space.sm : 0,
                marginHorizontal: active ? -space.sm : 0,
                borderRadius: radius.control,
                backgroundColor: active ? colors.surfaceElevated : 'transparent',
                borderTopWidth: index && !active ? 1 : 0,
                borderTopColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}>
              <AppText variant="label" tone={active ? 'accent' : 'muted'} style={{ width: 22, textAlign: 'center', fontVariant: ['tabular-nums'] }}>
                {index + 4}
              </AppText>
              <Helmet team={team} size={30} />
              <AppText variant="small" numberOfLines={1} style={{ flex: 1, fontFamily: active || isMine ? fontFamily.bold : fontFamily.semibold }}>
                {team.name}
              </AppText>
              <AppText variant="small" style={{ fontFamily: fontFamily.bold, fontVariant: ['tabular-nums'] }}>
                {compact.format(share.fans)}
              </AppText>
              <AppText variant="caption" tone="muted" style={{ width: 34, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
                {percent(share.fans)}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {expandable && shares.length > 3 + rows ? (
        <Pressable accessibilityRole="button" onPress={() => setOpen((current) => !current)} style={{ minHeight: 40, justifyContent: 'center' }}>
          <AppText variant="small" tone="accent" style={{ fontFamily: fontFamily.semibold }}>
            {open ? t('home.showLess') : t('app.showAllTeams', { count: shares.length })}
          </AppText>
        </Pressable>
      ) : null}

      {mine && myRank > 0 && !mineVisible ? (
        <Pressable
          accessibilityRole="button"
          disabled={!onPickMine && !onPickTeam}
          onPress={() => (onPickMine ? onPickMine() : onPickTeam?.(mine.id))}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
            paddingVertical: space.sm,
            paddingLeft: space.sm,
            paddingRight: space.md,
            borderRadius: radius.pill,
            borderWidth: 1.5,
            borderColor: colors.accent,
            opacity: pressed ? 0.7 : 1,
          })}>
          <Helmet team={mine} size={32} />
          <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
            <AppText variant="small" tone="muted">
              {t('app.yourTeam')}{' '}
            </AppText>
            <AppText variant="small" style={{ fontFamily: fontFamily.bold }}>
              {mine.name}
            </AppText>
          </AppText>
          <AppText variant="small" tone="muted" style={{ fontVariant: ['tabular-nums'] }}>
            {compact.format(myFans)}
          </AppText>
          <AppText variant="label" tone="accent" style={{ fontFamily: fontFamily.stat, fontVariant: ['tabular-nums'] }}>
            #{myRank}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
