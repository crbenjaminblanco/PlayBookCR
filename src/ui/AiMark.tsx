import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

/**
 * La marca de la IA: un balón de la NFL con chispas que titilan alrededor.
 * El balón se mece y las chispas laten a destiempo; con movimiento reducido todo queda quieto.
 */
export function AiMark({ size = 26, color = '#FFFFFF', spark = '#FFFFFF', animated = true }: { size?: number; color?: string; spark?: string; animated?: boolean }) {
  const reduced = useReducedMotion();
  const live = animated && !reduced;
  const sway = useSharedValue(0);

  useEffect(() => {
    if (!live) return;
    sway.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [live, sway]);

  const ball = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-38 + sway.value * 16}deg` }, { scale: 1 + sway.value * 0.04 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={ball}>
        <MaterialCommunityIcons name="football" size={size * 0.78} color={color} />
      </Animated.View>
      <Spark size={size * 0.36} color={spark} style={{ top: -size * 0.08, right: -size * 0.12 }} delay={0} live={live} />
      <Spark size={size * 0.24} color={spark} style={{ bottom: -size * 0.02, left: -size * 0.1 }} delay={520} live={live} />
      <Spark size={size * 0.18} color={spark} style={{ top: size * 0.12, left: -size * 0.04 }} delay={980} live={live} />
    </View>
  );
}

function Spark({ size, color, style, delay, live }: { size: number; color: string; style: object; delay: number; live: boolean }) {
  const glow = useSharedValue(live ? 0 : 1);

  useEffect(() => {
    if (!live) {
      glow.value = 1;
      return;
    }
    glow.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }), withTiming(0.15, { duration: 900, easing: Easing.in(Easing.quad) })), -1, false),
    );
  }, [live, delay, glow]);

  const twinkle = useAnimatedStyle(() => ({
    opacity: 0.25 + glow.value * 0.75,
    transform: [{ scale: 0.6 + glow.value * 0.5 }, { rotate: `${glow.value * 45}deg` }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style, twinkle]}>
      <MaterialCommunityIcons name="star-four-points" size={size} color={color} />
    </Animated.View>
  );
}
