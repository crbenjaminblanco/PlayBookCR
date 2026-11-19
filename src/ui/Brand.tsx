import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hero } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

/** Cobalto más luminoso para que la "O" se lea sobre el marino. */
const marker = '#4D74FF';

/**
 * La jugada: una P trazada como ruta de un diagrama de playbook,
 * con la "O" del jugador en su hueco.
 */
export function BrandMark({ size = 32, plain = false }: { size?: number; plain?: boolean }) {
  const { name } = useAppTheme();
  const dark = name === 'dark';
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityLabel="PlayBookCR">
      {plain ? null : (
        <Rect
          x={0.5}
          y={0.5}
          width={31}
          height={31}
          rx={9.5}
          fill={dark ? '#1B2440' : hero.base}
          stroke={dark ? 'rgba(255,255,255,0.14)' : 'none'}
          strokeWidth={1}
        />
      )}
      <Path
        d="M11 24.5V8.6H17.4A5.6 5.6 0 0 1 17.4 19.8H11"
        fill="none"
        stroke={plain ? hero.base : hero.text}
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={17} cy={14.2} r={2.3} fill={marker} />
    </Svg>
  );
}

export function Brand({ size = 32 }: { size?: number }) {
  const { colors } = useAppTheme();
  const type = Math.round(size * 0.56);
  return (
    <View accessibilityLabel="PlayBookCR" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <BrandMark size={size} />
      <AppText style={{ fontFamily: fontFamily.stat, fontSize: type, lineHeight: type + 4, letterSpacing: -0.6 }}>
        PlayBook
        <AppText style={{ fontFamily: fontFamily.stat, fontSize: type, lineHeight: type + 4, letterSpacing: -0.6, color: colors.accent }}>CR</AppText>
      </AppText>
    </View>
  );
}
