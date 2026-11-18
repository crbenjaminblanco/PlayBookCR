import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { teamById } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, space } from '@/src/theme/tokens';
import { Brand } from '@/src/ui/Brand';
import { Button } from '@/src/ui/Button';
import { Helmet } from '@/src/ui/Helmet';
import { useHomeScroll } from '@/src/ui/homeScroll';
import { ProModal } from '@/src/ui/ProModal';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';
type Item = { id: string; label: string; href: '/' | '/analysis' | '/community' | '/store' };

export function AppHeader() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { wide } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const { scrolled, scrollToTop } = useHomeScroll();
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const { auth } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const compact = scrolled && !menuOpen;
  const team = teamById(auth?.teamId);

  const items: Item[] = [
    { id: 'home', label: t('landing.navHome'), href: '/' },
    { id: 'games', label: t('landing.navGames'), href: '/analysis' },
    { id: 'community', label: t('landing.navCommunity'), href: '/community' },
    { id: 'store', label: t('tabs.store'), href: '/store' },
  ];

  function go(href: '/' | '/analysis' | '/community' | '/store' | '/profile' | '/welcome') {
    setMenuOpen(false);
    scrollToTop();
    router.push(href);
  }

  function follow(item: Item) {
    go(item.href);
  }

  function active(item: Item) {
    return pathname === item.href;
  }

  return (
    <MotiView
      animate={{ paddingBottom: compact ? 4 : 12 }}
      transition={{ type: 'timing', duration: reduced ? 0 : 220 } as never}
      style={{
        paddingTop: insets.top + (compact ? 2 : space.sm),
        paddingHorizontal: wide ? 48 : 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.bg,
        zIndex: 40,
        gap: space.sm,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('landing.navHome')} onPress={() => follow(items[0])}>
          <Brand />
        </Pressable>
        {wide ? (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
              {items.map((item) => (
                <NavLink key={item.id} label={item.label} selected={active(item)} onPress={() => follow(item)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Button label={t('landing.pro')} variant="gold" onPress={() => setProOpen(true)} />
              <Button label={t('landing.account')} variant="secondary" onPress={() => go('/profile')} />
              {team ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('tabs.profile')}
                  onPress={() => go('/profile')}
                  style={{ minHeight: 44, justifyContent: 'center' }}>
                  <Helmet team={team} size={40} />
                </Pressable>
              ) : auth ? (
                <Button label={t('tabs.profile')} variant="secondary" onPress={() => go('/profile')} />
              ) : (
                <Button label={t('landing.enter')} onPress={() => go('/welcome')} />
              )}
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('landing.menu')}
            accessibilityState={{ expanded: menuOpen }}
            onPress={() => setMenuOpen((open) => !open)}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Hamburger color={colors.text} />
          </Pressable>
        )}
      </View>
      {menuOpen && !wide ? (
        <View style={{ gap: space.sm }}>
          {items.map((item) => (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => follow(item)} style={{ minHeight: 44, justifyContent: 'center' }}>
              <AppText variant="body" tone={active(item) ? 'accent' : 'default'}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
          <Button
            label={t('landing.pro')}
            variant="gold"
            onPress={() => {
              setMenuOpen(false);
              setProOpen(true);
            }}
          />
          <Button
            label={t('landing.account')}
            variant="secondary"
            onPress={() => {
              setMenuOpen(false);
              go('/profile');
            }}
          />
          {team ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('tabs.profile')}
              onPress={() => {
                setMenuOpen(false);
                go('/profile');
              }}
              style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Helmet team={team} size={36} />
              <AppText variant="body">{t('tabs.profile')}</AppText>
            </Pressable>
          ) : auth ? (
            <Button
              label={t('tabs.profile')}
              variant="secondary"
              onPress={() => {
                setMenuOpen(false);
                go('/profile');
              }}
            />
          ) : (
            <Button
              label={t('landing.enter')}
              onPress={() => {
                setMenuOpen(false);
                go('/welcome');
              }}
            />
          )}
        </View>
      ) : null}
      <ProModal visible={proOpen} onClose={() => setProOpen(false)} />
    </MotiView>
  );
}

function Hamburger({ color }: { color: string }) {
  return (
    <View style={{ width: 22, gap: 5 }} accessibilityElementsHidden>
      {[0, 1, 2].map((line) => (
        <View key={line} style={{ height: 2, borderRadius: 1, backgroundColor: color }} />
      ))}
    </View>
  );
}

function NavLink({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, justifyContent: 'center', borderBottomWidth: selected ? 1 : 0, borderBottomColor: colors.text }}>
      <AppText variant="small" tone={selected ? 'accent' : 'default'} style={{ fontFamily: selected ? fontFamily.semibold : fontFamily.medium, letterSpacing: 0.8 }}>
        {label}
      </AppText>
    </Pressable>
  );
}
