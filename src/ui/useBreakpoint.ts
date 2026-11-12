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
    contentMax: regular ? layout.regularMax : layout.compactMax,
    pad: regular ? 32 : 16,
    teamColumns: wide ? 4 : regular ? 3 : 2,
    storeColumns: wide ? 3 : regular ? 2 : 1,
  };
}
