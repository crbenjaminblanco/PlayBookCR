import { useEffect, useRef, type ReactNode } from 'react';
import { Image, Platform, ScrollView, View, type ImageSourcePropType, type ScrollViewInstance, type ViewProps } from 'react-native';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { useHomeScroll } from '@/src/ui/homeScroll';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type Props = ViewProps & {
  scroll?: boolean;
  footer?: ReactNode;
  center?: boolean;
  backdrop?: ImageSourcePropType;
};

export function Screen({ children, scroll = true, footer, center = false, backdrop, style }: Props) {
  const { colors, name } = useAppTheme();
  const { contentMax, pad } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const { reportScroll, registerScroller } = useHomeScroll();
  const pathname = usePathname();
  const scroller = useRef<ScrollViewInstance | null>(null);

  function toTop() {
    scroller.current?.scrollTo({ y: 0, animated: false });
    reportScroll(0);
    if (Platform.OS === 'web') {
      window.scrollTo(0, 0);
      document.querySelectorAll('div').forEach((node) => {
        if (node.scrollTop > 0) node.scrollTop = 0;
      });
    }
  }

  useEffect(() => {
    registerScroller(toTop);
    return () => registerScroller(null);
  });

  useEffect(() => {
    toTop();
  }, [pathname]);

  const body = (
    <View style={{ width: '100%', maxWidth: contentMax, alignSelf: 'center', paddingHorizontal: pad, gap: space.xxl }}>
      {children}
    </View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {backdrop ? <Image source={backdrop} resizeMode="cover" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} /> : null}
      {backdrop ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: name === 'dark' ? 'rgba(12,11,9,0.88)' : 'rgba(246,241,231,0.9)' }}
        />
      ) : null}
      {scroll ? (
        <ScrollView
          ref={scroller as never}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          onScroll={(event) => reportScroll(event.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: center ? 'center' : 'flex-start',
            paddingTop: space.md,
            paddingBottom: footer ? space.xl : insets.bottom + space.xxxl,
          }}>
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: space.md }}>{body}</View>
      )}
      {footer ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.bg,
            paddingTop: space.md,
            paddingBottom: insets.bottom + space.md,
          }}>
          <View style={{ width: '100%', maxWidth: contentMax, alignSelf: 'center', paddingHorizontal: pad }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}
