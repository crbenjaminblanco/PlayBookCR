import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import '@/src/i18n';
import { SessionProvider, useSession } from '@/src/session/SessionProvider';
import { PaperBridge } from '@/src/theme/PaperBridge';
import { AppThemeProvider, useAppTheme } from '@/src/theme/ThemeProvider';
import { Platform, View } from 'react-native';
import { AppDock } from '@/src/ui/AppDock';
import { AskProvider } from '@/src/ui/AskDock';
import { HomeScrollProvider } from '@/src/ui/homeScroll';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return (
    <SessionProvider>
      <Boot />
    </SessionProvider>
  );
}

function Boot() {
  const { ready } = useSession();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AppThemeProvider>
      <ThemedStack />
    </AppThemeProvider>
  );
}

function ThemedStack() {
  const { colors, name } = useAppTheme();
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.lang = 'es';
    document.title = 'PlayBookCR · La jornada de la NFL leída con IA';
    const setMeta = (key: string, content: string, attr: 'name' | 'property') => {
      let node = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!node) {
        node = document.createElement('meta');
        node.setAttribute(attr, key);
        document.head.appendChild(node);
      }
      node.setAttribute('content', content);
    };
    setMeta(
      'description',
      'Lectura de la jornada de la NFL con IA, hecha en Costa Rica. Vea la afición por provincia y el análisis de la semana.',
      'name',
    );
    setMeta('theme-color', colors.bg, 'name');
    setMeta('og:title', 'PlayBookCR · La jornada de la NFL leída con IA', 'property');
    setMeta(
      'og:description',
      'Lectura de la jornada de la NFL con IA, hecha en Costa Rica. Afición por provincia y análisis de la semana.',
      'property',
    );
    setMeta('og:locale', 'es_CR', 'property');
    setMeta('og:type', 'website', 'property');
    const prefix = window.location.pathname.startsWith('/PlayBookCR') ? '/PlayBookCR' : '';
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((node) => node.remove());
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/svg+xml';
    icon.href = `${prefix}/brand-mark.svg?v=9`;
    document.head.appendChild(icon);
  }, [colors.bg]);
  return (
    <PaperBridge>
    <HomeScrollProvider>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      <AskProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppDock placement="top" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="team" />
          <Stack.Screen name="analysis" />
          <Stack.Screen name="community" />
          <Stack.Screen name="store" />
          <Stack.Screen name="profile" />
        </Stack>
        <AppDock placement="bottom" />
      </View>
      </AskProvider>
    </HomeScrollProvider>
    </PaperBridge>
  );
}
