import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import i18n from '@/src/i18n';
import type { ThemeName } from '@/src/theme/colors';

const AUTH_KEY = 'playbookcr.auth.v1';
const PREFS_KEY = 'playbookcr.prefs.v1';

export type Language = 'es' | 'en';

export type AuthState = {
  mode: 'guest' | 'account';
  email: string | null;
  teamId: string | null;
};

export type Prefs = {
  language: Language;
  theme: ThemeName;
};

type SessionContextValue = {
  ready: boolean;
  auth: AuthState | null;
  prefs: Prefs;
  signInGuest: () => Promise<void>;
  signInAccount: (email: string) => Promise<void>;
  setTeam: (teamId: string) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setTheme: (theme: ThemeName) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function deviceLanguage(): Language {
  return i18n.language === 'en' ? 'en' : 'es';
}

const defaultPrefs: Prefs = { language: 'es', theme: 'dark' };

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const authRef = useRef<AuthState | null>(null);
  const prefsRef = useRef<Prefs>(defaultPrefs);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedAuth, storedPrefs] = await Promise.all([
          readJson<AuthState>(AUTH_KEY),
          readJson<Prefs>(PREFS_KEY),
        ]);
        if (cancelled) return;
        const nextPrefs = storedPrefs ?? { language: deviceLanguage(), theme: 'dark' as const };
        prefsRef.current = nextPrefs;
        authRef.current = storedAuth;
        setPrefs(nextPrefs);
        setAuth(storedAuth);
        await i18n.changeLanguage(nextPrefs.language);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistAuth = useCallback(async (next: AuthState | null) => {
    authRef.current = next;
    setAuth(next);
    if (next) await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(AUTH_KEY);
  }, []);

  const persistPrefs = useCallback(async (patch: Partial<Prefs>) => {
    const next = { ...prefsRef.current, ...patch };
    prefsRef.current = next;
    setPrefs(next);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    if (next.language !== i18n.language) await i18n.changeLanguage(next.language);
  }, []);

  const signInGuest = useCallback(async () => {
    await persistAuth({ mode: 'guest', email: null, teamId: null });
  }, [persistAuth]);

  const signInAccount = useCallback(
    async (email: string) => {
      await persistAuth({ mode: 'account', email: email.trim(), teamId: null });
    },
    [persistAuth],
  );

  const setTeam = useCallback(
    async (teamId: string) => {
      if (!authRef.current) return;
      await persistAuth({ ...authRef.current, teamId });
    },
    [persistAuth],
  );

  const setLanguage = useCallback(
    async (language: Language) => {
      await persistPrefs({ language });
    },
    [persistPrefs],
  );

  const setTheme = useCallback(
    async (theme: ThemeName) => {
      await persistPrefs({ theme });
    },
    [persistPrefs],
  );

  const signOut = useCallback(async () => {
    await persistAuth(null);
  }, [persistAuth]);

  const value = useMemo(
    () => ({ ready, auth, prefs, signInGuest, signInAccount, setTeam, setLanguage, setTheme, signOut }),
    [ready, auth, prefs, signInGuest, signInAccount, setTeam, setLanguage, setTheme, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de SessionProvider');
  return value;
}
