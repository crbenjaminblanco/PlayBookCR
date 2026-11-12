import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';

type ScrollFn = (id: string) => void;

const HomeScrollContext = createContext<{
  register: (fn: ScrollFn | null) => void;
  scrollTo: (id: string) => boolean;
} | null>(null);

export function HomeScrollProvider({ children }: { children: ReactNode }) {
  const current = useRef<ScrollFn | null>(null);
  const value = useMemo(
    () => ({
      register: (fn: ScrollFn | null) => {
        current.current = fn;
      },
      scrollTo: (id: string) => {
        if (!current.current) return false;
        current.current(id);
        return true;
      },
    }),
    [],
  );

  return <HomeScrollContext.Provider value={value}>{children}</HomeScrollContext.Provider>;
}

export function useHomeScroll() {
  const value = useContext(HomeScrollContext);
  if (!value) throw new Error('HomeScrollProvider is missing');
  return value;
}
