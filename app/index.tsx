import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { teamById } from '@/src/data/teams';
import { weekGames, weekResults, type WeekGame } from '@/src/data/week';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hero, radius, space } from '@/src/theme/tokens';
import { AccountButton } from '@/src/ui/AppDock';
import { Brand } from '@/src/ui/Brand';
import { Card } from '@/src/ui/Card';
import { DroneBall } from '@/src/ui/DroneBall';
import { FanPodium } from '@/src/ui/FanPodium';
import { Helmet } from '@/src/ui/Helmet';
import { Section } from '@/src/ui/Kit';
import { ScoreTicker } from '@/src/ui/ScoreTicker';
import { Screen } from '@/src/ui/Screen';
import { SwipeRow } from '@/src/ui/SwipeRow';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

/** Cobalto claro para resaltar "con IA" sobre el marino. */
const aiInk = '#9DB2FF';

/**
 * Inicio: lo que viene esta semana. El hero lleva la acción principal; la barra de
 * marcadores va debajo como información secundaria; las secciones no repiten la
 * barra de pestañas.
 */
export default function HomeScreen() {
  const { wide } = useBreakpoint();
  const { auth } = useSession();
  const pick = useHeroGame(auth?.teamId);

  if (wide) {
    return (
      <Screen>
        {/* En pantallas grandes la franja de marcadores ocupa todo el ancho, arriba. */}
        <Ticker />
        <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 5, gap: space.lg }}>
            <Hero pick={pick} />
          </View>
          <View style={{ flex: 6, gap: space.xl }}>
            <Featured skip={pick.game.id} />
            <Fans />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Como en las apps deportivas: logo, franja de marcadores y luego el hero. */}
      <View style={{ gap: space.md }}>
        <TopBar />
        <Ticker />
      </View>
      <Hero pick={pick} />
      <Featured skip={pick.game.id} />
      <Fans />
    </Screen>
  );
}

/** Los finales de la jornada anterior, desfilando. Tocarla abre esa jornada en Partidos. */
function Ticker() {
  const { t } = useTranslation();
  return (
    <ScoreTicker
      label={t('app.tickerLabel')}
      results={weekResults}
      onPress={() => router.push({ pathname: '/analysis', params: { week: '10' } })}
    />
  );
}

/**
 * Barra del teléfono: logo a la izquierda y la cuenta a la derecha.
 * Tema, idioma y equipo se configuran dentro de la cuenta, no en la portada.
 */
function TopBar() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <View style={{ flex: 1 }}>
        <Brand size={34} />
      </View>
      <AccountButton />
    </View>
  );
}

/**
 * El hero: saludo y promesa de la app sobre marino, con el enjambre de drones
 * formando el balón a la derecha. Debajo, la semana y las dos acciones.
 */
function Hero({ pick }: { pick: { game: WeekGame; mine: boolean } }) {
  const { t } = useTranslation();
  const { auth } = useSession();
  const { wide } = useBreakpoint();
  const team = teamById(auth?.teamId);
  const name = auth?.email ? auth.email.split('@')[0] : null;
  const glow =
    Platform.OS === 'web'
      ? ({
          backgroundImage: `radial-gradient(110% 80% at 100% 0%, ${hero.glow}B3 0%, transparent 58%), radial-gradient(70% 60% at 0% 100%, ${team?.color ?? hero.glow}4D 0%, transparent 62%)`,
        } as object)
      : null;

  return (
    <View
      style={[
        {
          backgroundColor: hero.base,
          borderRadius: radius.sheet,
          overflow: 'hidden',
          shadowColor: hero.glow,
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.22,
          shadowRadius: 36,
          elevation: 6,
        },
        glow,
      ]}>
      {/* Escritorio: el balón flota arriba a la derecha. Teléfono: va en el eje central, entre la semana y el saludo. */}
      {wide ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 4, right: -20, width: '58%', height: 170, opacity: 0.9 }}>
          <DroneBall height="100%" color="rgba(255,255,255,0.92)" accent={aiInk} />
        </View>
      ) : null}

      <View style={{ padding: space.xl, gap: space.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: wide ? 'flex-start' : 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: hero.chip }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: aiInk }} />
          <AppText variant="caption" style={{ color: hero.text, fontFamily: fontFamily.semibold }}>
            {t('app.week')} · {t('app.weekRange')}
          </AppText>
        </View>

        {wide ? null : (
          <View pointerEvents="none" style={{ height: 150, marginTop: -32, marginBottom: -36, opacity: 0.95 }}>
            <DroneBall height="100%" color="rgba(255,255,255,0.92)" accent={aiInk} />
          </View>
        )}

        <View style={{ paddingTop: wide ? 88 : 0, maxWidth: wide ? 420 : undefined, alignSelf: wide ? 'flex-start' : 'center' }}>
          <AppText
            variant="display"
            accessibilityRole="header"
            style={{ color: hero.text, fontSize: wide ? 40 : 34, lineHeight: wide ? 46 : 40, textAlign: wide ? 'left' : 'center' }}>
            {name ? `${t('app.hello')} ${name}, ` : `${t('app.hello')}, `}
            {t('app.heroTitle')}{' '}
            <AppText variant="display" style={{ color: aiInk, fontSize: wide ? 40 : 34, lineHeight: wide ? 46 : 40 }}>
              {t('app.heroAi')}
            </AppText>
          </AppText>
        </View>

        <HeroPick game={pick.game} mine={pick.mine} />

        {/* Una acción principal. Sin equipo, la segunda es elegirlo: es lo que personaliza todo lo demás. */}
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <HeroButton label={t('app.readGame')} solid onPress={() => router.push({ pathname: '/analysis', params: { game: pick.game.id } })} />
          {team ? null : <HeroButton label={t('app.noTeam')} icon="plus" onPress={() => router.push(auth ? '/team' : '/welcome')} />}
        </View>
      </View>
    </View>
  );
}

/**
 * El partido que el hero pone al frente: el del equipo de la persona si juega esta semana;
 * si no, el duelo con la línea más corta, que es el más abierto.
 */
function useHeroGame(teamId: string | null | undefined): { game: WeekGame; mine: boolean } {
  const own = teamId ? weekGames.find((game) => game.home.teamId === teamId || game.away.teamId === teamId) : undefined;
  if (own) return { game: own, mine: true };
  const closest = weekGames.reduce((best, game) => (game.margin < best.margin ? game : best));
  return { game: closest, mine: false };
}

/** La lectura de la IA sobre ese partido, en el vidrio del hero. */
function HeroPick({ game, mine }: { game: WeekGame; mine: boolean }) {
  const { t } = useTranslation();
  const away = teamById(game.away.teamId);
  const home = teamById(game.home.teamId);
  const favorite = teamById(game.favoriteId);
  if (!away || !home) return null;

  return (
    <View style={{ padding: space.lg, borderRadius: radius.card - 4, backgroundColor: hero.chip, gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
        <AppText variant="caption" style={{ color: hero.muted, fontFamily: fontFamily.semibold }}>
          {mine ? t('app.yourGame') : t('app.closestGame')}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name="clock-outline" size={13} color={hero.muted} />
          <AppText variant="caption" style={{ color: hero.muted }}>
            {game.kickoff}
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={{ width: 74, height: 40 }}>
          <Helmet team={away} size={40} ring={hero.base} />
          <View style={{ position: 'absolute', left: 34 }}>
            <Helmet team={home} size={40} ring={hero.base} />
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="label" numberOfLines={1} style={{ color: hero.text, fontSize: 17 }}>
            {away.name} <AppText variant="label" style={{ color: hero.muted, fontSize: 17 }}>@</AppText> {home.name}
          </AppText>
          <AppText variant="caption" numberOfLines={1} style={{ color: hero.muted, fontSize: 13, lineHeight: 18 }}>
            {away.abbr} {game.away.record} · {home.abbr} {game.home.record}
          </AppText>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        <MaterialCommunityIcons name="creation" size={16} color={aiInk} style={{ marginTop: 2 }} />
        <AppText variant="small" numberOfLines={3} style={{ color: hero.text, flex: 1, lineHeight: 21 }}>
          {t(game.noteKey ?? `analysis.read.${game.id}`)}
        </AppText>
      </View>
      <AppText variant="caption" style={{ color: hero.muted }}>
        {t('app.aiPick', { team: favorite?.name ?? '', margin: game.margin })}
      </AppText>
    </View>
  );
}

function HeroButton({ label, onPress, solid = false, icon }: { label: string; onPress: () => void; solid?: boolean; icon?: 'creation' | 'plus' }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 50,
        borderRadius: radius.pill,
        backgroundColor: solid ? '#FFFFFF' : 'transparent',
        borderWidth: solid ? 0 : 1,
        borderColor: 'rgba(255,255,255,0.28)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}>
      {icon ? <MaterialCommunityIcons name={icon} size={17} color={aiInk} /> : null}
      <AppText variant="small" numberOfLines={1} style={{ color: solid ? hero.base : hero.text, fontFamily: fontFamily.bold }}>
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * Scoreboard de la jornada, como la franja de marcadores de un canal deportivo:
 * casillas pequeñas en una sola tira, sin repetir el partido del hero.
 * No compite con la pestaña Partidos: aquí se ojea, allá se lee.
 */
function Featured({ skip }: { skip: string }) {
  const { t } = useTranslation();
  const { pad, wide } = useBreakpoint();
  const list = weekGames.filter((game) => game.id !== skip);
  return (
    <Section title={t('app.featured')} action={t('app.seeAll')} onAction={() => router.push('/analysis')}>
      <SwipeRow itemWidth={SCORE_TILE} gap={space.sm + 2} inset={wide ? 0 : pad} bleed={!wide} contentStyle={{ paddingVertical: space.sm }}>
        {list.map((game) => (
          <Card key={game.id} flush style={{ overflow: 'hidden' }}>
            <ScoreTile game={game} />
          </Card>
        ))}
      </SwipeRow>
    </Section>
  );
}

const SCORE_TILE = 136;

function ScoreTile({ game }: { game: WeekGame }) {
  const { colors } = useAppTheme();
  const away = teamById(game.away.teamId);
  const home = teamById(game.home.teamId);
  const favorite = teamById(game.favoriteId);
  if (!away || !home) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${away.name} @ ${home.name}, ${game.kickoff}`}
      onPress={() => router.push({ pathname: '/analysis', params: { game: game.id } })}
      style={({ pressed }) => ({ width: SCORE_TILE, paddingHorizontal: space.md + 2, paddingVertical: space.md, gap: 6, backgroundColor: pressed ? colors.surfaceElevated : 'transparent' })}>
      <AppText variant="caption" tone="muted" style={{ fontSize: 11, lineHeight: 14 }}>
        {game.kickoff}
      </AppText>
      {[
        { team: away, side: game.away },
        { team: home, side: game.home },
      ].map(({ team, side }) => (
        <View key={team.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: team.color }} />
          <AppText variant="small" style={{ flex: 1, fontFamily: game.favoriteId === team.id ? fontFamily.bold : fontFamily.semibold }}>
            {team.abbr}
          </AppText>
          <AppText variant="caption" tone="muted" style={{ fontVariant: ['tabular-nums'] }}>
            {side.record}
          </AppText>
        </View>
      ))}
      <AppText variant="caption" tone="accent" style={{ fontFamily: fontFamily.bold, fontSize: 11, lineHeight: 14, fontVariant: ['tabular-nums'] }}>
        {favorite?.abbr} −{game.margin}
      </AppText>
    </Pressable>
  );
}

/** Afición en el país: el mismo podio que el ranking de Comunidad. */
function Fans() {
  const { t } = useTranslation();
  return (
    <Section title={t('app.fans')} action={t('app.fansAction')} onAction={() => router.push('/community')}>
      <Card>
        <FanPodium rows={2} onPickMine={() => router.push('/community')} />
      </Card>
    </Section>
  );
}
