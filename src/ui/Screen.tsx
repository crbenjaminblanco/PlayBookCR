import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Platform, ScrollView, View, type ScrollViewInstance, type ViewProps } from 'react-native';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { dockHeight, space } from '@/src/theme/tokens';
import { useHomeScroll } from '@/src/ui/homeScroll';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type Props = ViewProps & {
  scroll?: boolean;
  footer?: ReactNode;
  center?: boolean;
  /** Pantallas fuera de las pestañas (bienvenida, equipo) no reservan espacio para la barra. */
  tabs?: boolean;
};

export function Screen({ children, scroll = true, footer, center = false, tabs = true, style }: Props) {
  const { colors } = useAppTheme();
  const { contentMax, pad, wide } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const { reportScroll, registerScroller } = useHomeScroll();
  const pathname = usePathname();
  const scroller = useRef<ScrollViewInstance | null>(null);

  const toTop = useCallback(() => {
    const node = scroller.current as unknown as { scrollTo?: (options: { y: number; animated?: boolean }) => void; scrollTop?: number; getScrollableNode?: () => HTMLElement } | null;
    node?.scrollTo?.({ y: 0, animated: false });
    const host = node?.getScrollableNode?.() ?? (node as HTMLElement | null);
    if (host && typeof host.scrollTop === 'number') host.scrollTop = 0;
    reportScroll(0);
    if (Platform.OS === 'web') window.scrollTo(0, 0);
  }, [reportScroll]);

  useEffect(() => {
    registerScroller(toTop);
    return () => registerScroller(null);
  }, [registerScroller, toTop]);

  useLayoutEffect(() => {
    toTop();
  }, [pathname, toTop]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = (scroller.current as unknown as { getScrollableNode?: () => HTMLElement } | null)?.getScrollableNode?.();
    if (!node) return;
    const arrived = performance.now();
    // Al entrar, un control de más abajo (el mapa, el chat) no debe arrastrar la página.
    const onFocus = (event: FocusEvent) => {
      if (performance.now() - arrived > 800) return;
      const target = event.target;
      if (!(target instanceof HTMLElement) || !node.contains(target)) return;
      if (event.relatedTarget != null) return;
      if (target.getBoundingClientRect().top - node.getBoundingClientRect().top > 120) {
        node.scrollTop = 0;
        target.blur();
      }
    };
    node.addEventListener('focusin', onFocus);
    const later = setTimeout(toTop, 80);
    return () => {
      node.removeEventListener('focusin', onFocus);
      clearTimeout(later);
    };
  }, [pathname, toTop]);

  // En el teléfono el encabezado ya incluye el área segura. Bienvenida y equipo no tienen ese encabezado.
  const topPad = wide ? space.xxl : tabs ? space.lg : insets.top + space.md;
  const bottomPad = footer ? space.xl : insets.bottom + space.xxl + (wide || !tabs ? 0 : dockHeight);

  const body = (
    <View style={{ width: '100%', maxWidth: contentMax, alignSelf: 'center', paddingHorizontal: pad, gap: space.xl }}>
      {children}
    </View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {scroll ? (
        <ScrollView
          ref={scroller as never}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => reportScroll(event.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          contentContainerStyle={[
            {
              flexGrow: 1,
              justifyContent: center ? 'center' : 'flex-start',
              paddingTop: topPad,
              paddingBottom: bottomPad,
            },
            Platform.OS === 'web' ? ({ overflowAnchor: 'none' } as object) : null,
          ]}>
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: topPad }}>{body}</View>
      )}
      {footer ? (
        <View style={{ backgroundColor: colors.bg, paddingTop: space.md, paddingBottom: insets.bottom + space.lg }}>
          <View style={{ width: '100%', maxWidth: contentMax, alignSelf: 'center', paddingHorizontal: pad }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}
