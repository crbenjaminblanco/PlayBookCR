import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, View, type ScrollViewInstance, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { lift } from '@/src/theme/tokens';

/** Equipos con mouse o trackpad (sin pantalla táctil): ahí se muestran flechas. */
function usesPointer() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
}

type Props = {
  children: ReactNode;
  /** Ancho de cada elemento: activa el snap para que cada uno se acomode al soltar. */
  itemWidth?: number;
  gap?: number;
  /** Relleno lateral; con `bleed` la fila llega hasta el borde de la pantalla. */
  inset?: number;
  bleed?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Lleva ese elemento a la vista dentro de la fila, sin mover el scroll de la página. */
  focusIndex?: number;
};

/**
 * Fila horizontal que se desliza como en una app: con el dedo en el teléfono y,
 * en la web, también arrastrando con el mouse. Con `itemWidth`, cada elemento se
 * acomoda al soltar (nativo: snapToInterval; web: lo hace este componente).
 */
export function SwipeRow({ children, itemWidth, gap = 0, inset = 0, bleed = false, style, contentStyle, accessibilityLabel, focusIndex = -1 }: Props) {
  const ref = useRef<ScrollViewInstance | null>(null);
  const [arrows] = useState(usesPointer);
  const [edges, setEdges] = useState({ left: false, right: false });

  function scrollNode() {
    return (ref.current as unknown as { getScrollableNode?: () => HTMLElement } | null)?.getScrollableNode?.();
  }

  /** Avanza una página hacia un lado, alineada a las casillas si hay ancho fijo. */
  function page(direction: 1 | -1) {
    const node = scrollNode();
    if (!node) return;
    const step = itemWidth ? itemWidth + gap : 1;
    const amount = Math.max(step, Math.floor((node.clientWidth * 0.8) / step) * step);
    node.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = scrollNode();
    if (!node) return;
    node.style.cursor = 'grab';
    const measure = () => setEdges({ left: node.scrollLeft > 4, right: node.scrollLeft + node.clientWidth < node.scrollWidth - 4 });
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(node);
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;

    const settle = () => {
      if (!itemWidth) return;
      const step = itemWidth + gap;
      const target = Math.round(node.scrollLeft / step) * step;
      if (Math.abs(target - node.scrollLeft) > 1) node.scrollTo({ left: target, behavior: 'smooth' });
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      down = true;
      moved = false;
      startX = event.clientX;
      startLeft = node.scrollLeft;
      node.style.cursor = 'grabbing';
    };
    const onMove = (event: PointerEvent) => {
      if (!down) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      node.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      node.style.cursor = 'grab';
      settle();
    };
    // Dedo o trackpad: cuando el desplazamiento termina, se acomoda a la casilla más cercana.
    const onScrollEnd = () => {
      if (!down) settle();
    };
    // Un arrastre no debe contar como toque en la casilla que quedó debajo.
    const onClick = (event: MouseEvent) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    };

    node.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    node.addEventListener('scrollend', onScrollEnd);
    node.addEventListener('click', onClick, true);
    node.addEventListener('scroll', measure, { passive: true });
    return () => {
      resize.disconnect();
      node.removeEventListener('scroll', measure);
      node.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      node.removeEventListener('scrollend', onScrollEnd);
      node.removeEventListener('click', onClick, true);
    };
  }, [itemWidth, gap]);

  useEffect(() => {
    if (focusIndex < 0 || Platform.OS !== 'web') return;
    const frame = requestAnimationFrame(() => {
      const node = scrollNode();
      const inner = node?.firstElementChild;
      const child = inner?.children.item(focusIndex) as HTMLElement | null;
      if (!node || !child) return;
      const left = child.offsetLeft - (node.clientWidth - child.offsetWidth) / 2;
      node.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusIndex]);

  const row = (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      snapToInterval={itemWidth ? itemWidth + gap : undefined}
      snapToAlignment="start"
      decelerationRate={itemWidth ? 'fast' : 'normal'}
      style={[bleed ? { marginHorizontal: -inset } : null, style]}
      contentContainerStyle={[{ paddingHorizontal: inset, gap }, contentStyle]}>
      {Children.map(children, (child) => (child == null ? null : <View style={{ flexShrink: 0 }}>{child}</View>))}
    </ScrollView>
  );

  if (!arrows) return row;
  return (
    <View style={{ position: 'relative' }}>
      {row}
      {edges.left ? <Arrow side="left" offset={bleed ? -inset : 0} onPress={() => page(-1)} /> : null}
      {edges.right ? <Arrow side="right" offset={bleed ? -inset : 0} onPress={() => page(1)} /> : null}
    </View>
  );
}

function Arrow({ side, offset, onPress }: { side: 'left' | 'right'; offset: number; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors, name } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={side === 'left' ? t('app.previous') : t('app.next')}
      onPress={onPress}
      style={({ hovered }: { hovered?: boolean }) => [
        {
          position: 'absolute',
          top: '50%',
          marginTop: -20,
          [side]: offset + 6,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: hovered ? colors.surfaceElevated : colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        },
        name === 'light' ? { ...lift, shadowOpacity: 0.16 } : { borderWidth: 1, borderColor: colors.borderStrong },
      ]}>
      <MaterialCommunityIcons name={side === 'left' ? 'chevron-left' : 'chevron-right'} size={22} color={colors.text} />
    </Pressable>
  );
}
