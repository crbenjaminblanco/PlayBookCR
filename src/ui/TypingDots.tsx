import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

/** Tres puntos que laten en ola. Con movimiento reducido quedan quietos. */
export function TypingDots({ color, size = 7 }: { color: string; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: size * 0.6, alignItems: 'center', height: size * 2 }}>
      {[0, 1, 2].map((dot) => (
        <Dot key={dot} delay={dot * 160} color={color} size={size} />
      ))}
    </View>
  );
}

function Dot({ delay, color, size }: { delay: number; color: string; size: number }) {
  const reduced = useReducedMotion();
  const rise = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(() => {
      rise.value = withRepeat(withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }), -1, true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, reduced, rise]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + rise.value * 0.65,
    transform: [{ translateY: -rise.value * (size * 0.5) }],
  }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
}
