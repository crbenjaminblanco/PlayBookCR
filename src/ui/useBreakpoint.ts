import { useWindowDimensions } from 'react-native';

import { breakpoint, layout } from '@/src/theme/tokens';

export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  const wide = width >= breakpoint.wide;
  const regular = width >= breakpoint.regular;
  return {
    width,
    height,
    wide,
    regular,
    compact: !regular,
    contentMax: wide ? layout.wideMax : layout.appMax,
    pad: wide ? 40 : 20,
    teamColumns: wide ? 4 : 3,
    storeColumns: wide ? 4 : 2,
  };
}
