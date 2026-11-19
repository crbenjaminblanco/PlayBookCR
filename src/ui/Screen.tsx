import { useCallback, useEffect, useRef, type ReactNode } from 'react';
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
    scroller.current?.scrollTo({ y: 0, animated: false });
    reportScroll(0);
    if (Platform.OS === 'web') window.scrollTo(0, 0);
  }, [reportScroll]);

  useEffect(() => {
    registerScroller(toTop);
    return () => registerScroller(null);
  }, [registerScroller, toTop]);

  useEffect(() => {
    toTop();
  }, [pathname, toTop]);

  const topPad = wide ? space.xxl : insets.top + space.md;
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
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: center ? 'center' : 'flex-start',
            paddingTop: topPad,
            paddingBottom: bottomPad,
          }}>
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
