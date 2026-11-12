import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Ellipse, Line, Rect } from 'react-native-svg';

import { radius } from '@/src/theme/tokens';

const YARDS = [0, 10, 20, 30, 40, 50, 40, 30, 20, 10, 0];

export function FieldLive() {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 0.4 : 0);
  const sweep = useSharedValue(0);
  const width = useSharedValue(360);

  useEffect(() => {
    if (reduced) return;
    progress.value = withRepeat(withTiming(1, { duration: 4800, easing: Easing.inOut(Easing.cubic) }), -1, true);
    sweep.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false);
  }, [progress, reduced, sweep]);

  const ballStyle = useAnimatedStyle(() => {
    const travel = Math.max(48, width.value - 44);
    return {
      transform: [
        { translateX: progress.value * travel },
        { translateY: Math.sin(progress.value * Math.PI) * -14 },
        { rotate: `${progress.value * 50 - 25}deg` },
      ],
    };
  });

  const lightStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : 0.22,
    transform: [{ translateX: sweep.value * Math.max(48, width.value) - 40 }],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(event) => {
        width.value = event.nativeEvent.layout.width;
      }}
      style={{
        height: 96,
        borderRadius: radius.card,
        overflow: 'hidden',
        backgroundColor: '#0B3A2C',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
      }}>
      <Svg width="100%" height="100%" viewBox="0 0 440 96" preserveAspectRatio="none">
        <Rect x="0" y="0" width="440" height="96" fill="#0B3A2C" />
        <Rect x="0" y="0" width="18" height="96" fill="#123F73" />
        <Rect x="422" y="0" width="18" height="96" fill="#123F73" />
        {YARDS.map((yard, index) => (
          <Line key={yard + index} x1={28 + index * 38} y1="10" x2={28 + index * 38} y2="86" stroke="rgba(255,255,255,0.34)" strokeWidth="1.4" />
        ))}
        <Line x1="18" y1="48" x2="422" y2="48" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
      </Svg>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 54,
            backgroundColor: '#F8FAFC',
          },
          lightStyle,
        ]}
      />
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 8, top: 36 }, ballStyle]}>
        <Svg width="30" height="18" viewBox="0 0 30 18">
          <Ellipse cx="15" cy="9" rx="14" ry="8" fill="#D86A2A" />
          <Line x1="8" y1="9" x2="22" y2="9" stroke="#F8FAFC" strokeWidth="1.2" />
          <Line x1="11" y1="6" x2="11" y2="12" stroke="#F8FAFC" strokeWidth="1" />
          <Line x1="15" y1="5" x2="15" y2="13" stroke="#F8FAFC" strokeWidth="1" />
          <Line x1="19" y1="6" x2="19" y2="12" stroke="#F8FAFC" strokeWidth="1" />
        </Svg>
      </Animated.View>
    </View>
  );
}
