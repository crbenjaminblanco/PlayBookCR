import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { BarlowSemiCondensed_700Bold } from '@expo-google-fonts/barlow-semi-condensed';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import '@/src/i18n';
import { SessionProvider, useSession } from '@/src/session/SessionProvider';
import { PaperBridge } from '@/src/theme/PaperBridge';
import { AppThemeProvider, useAppTheme } from '@/src/theme/ThemeProvider';
import { Platform, View } from 'react-native';
import { AppHeader } from '@/src/ui/AppHeader';
import { AskProvider } from '@/src/ui/AskDock';
import { HomeScrollProvider } from '@/src/ui/homeScroll';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    BarlowSemiCondensed_700Bold,
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
    setMeta('theme-color', '#030712', 'name');
    setMeta('og:title', 'PlayBookCR · La jornada de la NFL leída con IA', 'property');
    setMeta(
      'og:description',
      'Lectura de la jornada de la NFL con IA, hecha en Costa Rica. Afición por provincia y análisis de la semana.',
      'property',
    );
    setMeta('og:locale', 'es_CR', 'property');
    setMeta('og:type', 'website', 'property');
    const favicon = require('../assets/images/favicon.png') as string;
    let icon = document.querySelector('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.setAttribute('rel', 'icon');
      document.head.appendChild(icon);
    }
    icon.setAttribute('type', 'image/png');
    icon.setAttribute('href', favicon);
  }, []);
  return (
    <PaperBridge>
    <HomeScrollProvider>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      <AskProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppHeader />
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
      </View>
      </AskProvider>
    </HomeScrollProvider>
    </PaperBridge>
  );
}
