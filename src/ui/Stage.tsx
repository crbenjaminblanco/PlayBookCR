import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { MotiView } from 'moti';
import { useReducedMotion } from 'react-native-reanimated';

import { space } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

type StageProps = {
  kicker?: string;
  title: string;
  fill?: boolean;
  image?: unknown;
  children?: ReactNode;
};

export function Stage({ title, children }: StageProps) {
  return (
    <View style={{ gap: space.lg, paddingBottom: space.xl }}>
      <View style={{ gap: space.sm, maxWidth: 920 }}>
        <AppText variant="title" accessibilityRole="header">{title}</AppText>
      </View>
      {children}
    </View>
  );
}

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <MotiView
      from={{ opacity: reduced ? 1 : 0, translateY: reduced ? 0 : 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: reduced ? 0 : 420, delay: reduced ? 0 : delay } as never}>
      {children}
    </MotiView>
  );
}

export function InView({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<View | null>(null);
  const [shown, setShown] = useState(reduced || Platform.OS !== 'web');

  useEffect(() => {
    if (shown || Platform.OS !== 'web') return;
    const node = ref.current as unknown as Element | null;
    if (!node || typeof node.getBoundingClientRect !== 'function' || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <View ref={ref as never} collapsable={false}>
      <MotiView
        animate={{ opacity: shown ? 1 : 0, translateY: shown || reduced ? 0 : 12 }}
        transition={{ type: 'timing', duration: reduced ? 0 : 420 } as never}>
        {children}
      </MotiView>
    </View>
  );
}
