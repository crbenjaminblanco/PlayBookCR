import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type ScrollFn = (id: string) => void;

const HomeScrollContext = createContext<{
  register: (fn: ScrollFn | null) => void;
  scrollTo: (id: string) => boolean;
  scrolled: boolean;
  reportScroll: (y: number) => void;
  registerScroller: (fn: (() => void) | null) => void;
  scrollToTop: () => void;
} | null>(null);

export function HomeScrollProvider({ children }: { children: ReactNode }) {
  const current = useRef<ScrollFn | null>(null);
  const scroller = useRef<(() => void) | null>(null);
  const scrolledRef = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  const reportScroll = useCallback((y: number) => {
    const next = y > 28;
    if (scrolledRef.current === next) return;
    scrolledRef.current = next;
    setScrolled(next);
  }, []);
  const registerScroller = useCallback((fn: (() => void) | null) => {
    scroller.current = fn;
  }, []);
  const scrollToTop = useCallback(() => {
    scroller.current?.();
    scrolledRef.current = false;
    setScrolled(false);
  }, []);
  const value = useMemo(
    () => ({
      scrolled,
      register: (fn: ScrollFn | null) => {
        current.current = fn;
      },
      scrollTo: (id: string) => {
        if (!current.current) return false;
        current.current(id);
        return true;
      },
      reportScroll,
      registerScroller,
      scrollToTop,
    }),
    [registerScroller, reportScroll, scrollToTop, scrolled],
  );

  return <HomeScrollContext.Provider value={value}>{children}</HomeScrollContext.Provider>;
}

export function useHomeScroll() {
  const value = useContext(HomeScrollContext);
  if (!value) throw new Error('HomeScrollProvider is missing');
  return value;
}
