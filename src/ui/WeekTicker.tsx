import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { weekResults } from '@/src/data/week';
import { teamById } from '@/src/data/teams';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, space } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

export function WeekTicker() {
  const { colors } = useAppTheme();
  const reduced = useReducedMotion();
  const [span, setSpan] = useState(0);
  const offset = useSharedValue(0);
  const line = weekResults
    .map((game) => {
      const away = teamById(game.awayId)?.abbr ?? '';
      const home = teamById(game.homeId)?.abbr ?? '';
      return `${away}  ${game.awayScore}–${game.homeScore}  ${home}`;
    })
    .join('     ·     ');

  useEffect(() => {
    if (reduced || span === 0) return;
    offset.value = 0;
    offset.value = withRepeat(withTiming(-span, { duration: 28000, easing: Easing.linear }), -1, false);
  }, [offset, reduced, span]);

  const motion = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <View style={{ overflow: 'hidden', backgroundColor: colors.surface, paddingVertical: space.md }}>
      <Animated.View style={[{ flexDirection: 'row', width: span ? span * 2 : undefined }, motion]}>
        {[0, 1].map((copy) => (
          <View key={copy} onLayout={copy === 0 ? (event) => setSpan(event.nativeEvent.layout.width) : undefined}>
            <AppText variant="small" numberOfLines={1} style={{ fontFamily: fontFamily.stat, letterSpacing: 1.4, paddingRight: space.xxl }}>
              {line}
            </AppText>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
