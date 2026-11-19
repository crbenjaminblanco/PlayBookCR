import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { teamById } from '@/src/data/teams';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hero, lift, radius, space } from '@/src/theme/tokens';
import type { FinalScore } from '@/src/ui/Match';
import { AppText } from '@/src/ui/Text';

/** Píxeles por segundo: lo bastante lento para leer un marcador al pasar. */
const SPEED = 36;

/**
 * Barra de marcadores al estilo de un canal deportivo: la etiqueta queda fija
 * y los resultados desfilan en bucle. Con movimiento reducido, se desliza a mano.
 */
export function ScoreTicker({ label, results, onPress }: { label: string; results: FinalScore[]; onPress?: () => void }) {
  const { colors, name } = useAppTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const x = useSharedValue(0);

  useEffect(() => {
    if (!width || reduced || paused) {
      cancelAnimation(x);
      return;
    }
    const from = x.value <= -width ? 0 : x.value;
    const remaining = width + from;
    x.value = withTiming(-width, { duration: (remaining / SPEED) * 1000, easing: Easing.linear }, (done) => {
      if (!done) return;
      x.value = 0;
      x.value = withRepeat(withTiming(-width, { duration: (width / SPEED) * 1000, easing: Easing.linear }), -1, false);
    });
    return () => cancelAnimation(x);
  }, [width, reduced, paused, x]);

  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const items = results.map((result) => <TickerItem key={`${result.awayId}-${result.homeId}`} result={result} />);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setPaused(true)}
      onHoverOut={() => setPaused(false)}
      style={[
        {
          height: 52,
          borderRadius: radius.pill,
          backgroundColor: colors.surface,
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
          borderWidth: name === 'dark' ? 1 : 0,
          borderColor: colors.border,
        },
        name === 'light' ? lift : null,
      ]}>
      <View
        style={{
          height: '100%',
          paddingLeft: space.lg,
          paddingRight: space.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: hero.base,
          zIndex: 2,
        }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger }} />
        <AppText variant="caption" style={{ color: hero.text, fontFamily: fontFamily.bold, letterSpacing: 0.2 }}>
          {label}
        </AppText>
      </View>
      <View style={{ flex: 1, height: '100%', overflow: 'hidden', justifyContent: 'center' }}>
        {reduced ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
            {items}
          </ScrollView>
        ) : (
          <Animated.View style={[{ flexDirection: 'row', alignSelf: 'flex-start' }, slide]}>
            <View style={{ flexDirection: 'row', flexShrink: 0 }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
              {items}
            </View>
            <View style={{ flexDirection: 'row', flexShrink: 0 }} aria-hidden={Platform.OS === 'web' ? true : undefined} importantForAccessibility="no-hide-descendants">
              {items}
            </View>
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
}

function TickerItem({ result }: { result: FinalScore }) {
  const { colors } = useAppTheme();
  const away = teamById(result.awayId);
  const home = teamById(result.homeId);
  if (!away || !home) return null;
  const awayWon = result.awayScore > result.homeScore;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, gap: space.md, borderRightWidth: 1, borderRightColor: colors.border, height: 28 }}>
      <Side abbr={away.abbr} score={result.awayScore} won={awayWon} />
      <Side abbr={home.abbr} score={result.homeScore} won={!awayWon} />
    </View>
  );
}

function Side({ abbr, score, won }: { abbr: string; score: number; won: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
      <AppText variant="caption" tone={won ? 'default' : 'muted'} style={{ fontFamily: fontFamily.semibold, fontSize: 13 }}>
        {abbr}
      </AppText>
      <AppText variant="label" tone={won ? 'default' : 'muted'} style={{ fontFamily: won ? fontFamily.stat : fontFamily.medium, fontVariant: ['tabular-nums'] }}>
        {score}
      </AppText>
    </View>
  );
}
