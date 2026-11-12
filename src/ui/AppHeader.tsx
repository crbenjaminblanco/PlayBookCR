import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { teamById } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, space } from '@/src/theme/tokens';
import { Brand } from '@/src/ui/Brand';
import { Button } from '@/src/ui/Button';
import { Helmet } from '@/src/ui/Helmet';
import { ProModal } from '@/src/ui/ProModal';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';
import { useHomeScroll } from '@/src/ui/homeScroll';

type Item = { id: string; label: string; href?: '/analysis' | '/store' | '/community' };

export function AppHeader() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { regular } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { auth } = useSession();
  const { scrollTo } = useHomeScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const team = teamById(auth?.teamId);

  const items: Item[] = [
    { id: 'home', label: t('landing.navHome') },
    { id: 'analysis', label: t('tabs.analysis'), href: '/analysis' },
    { id: 'community', label: t('landing.navCommunity'), href: '/community' },
    { id: 'store', label: t('tabs.store'), href: '/store' },
  ];

  function follow(item: Item) {
    setMenuOpen(false);
    if (item.href) {
      router.push(item.href);
      return;
    }
    if (pathname === '/' && scrollTo(item.id)) return;
    router.push({ pathname: '/', params: { section: item.id } });
  }

  function active(item: Item) {
    return item.href ? pathname === item.href : pathname === '/' && item.id === 'home';
  }

  return (
    <View
      style={{
        paddingTop: insets.top + space.sm,
        paddingBottom: space.sm,
        paddingHorizontal: regular ? 32 : 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        zIndex: 40,
        gap: space.sm,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('landing.navHome')} onPress={() => follow(items[0])} style={{ flex: 1 }}>
          <Brand />
        </Pressable>
        {regular ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
            {items.map((item) => (
              <NavLink key={item.id} label={item.label} selected={active(item)} onPress={() => follow(item)} />
            ))}
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setMenuOpen((open) => !open)} style={{ minHeight: 44, justifyContent: 'center' }}>
            <AppText variant="small" tone="accent">
              {t('landing.menu')}
            </AppText>
          </Pressable>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          {regular ? <Button label={t('landing.pro')} onPress={() => setProOpen(true)} /> : null}
          <Button label={t('landing.account')} variant="secondary" onPress={() => router.push('/profile')} />
          {team ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('tabs.profile')}
              onPress={() => router.push('/profile')}
              style={{ minHeight: 44, justifyContent: 'center' }}>
              <Helmet team={team} size={40} />
            </Pressable>
          ) : auth ? (
            <Button label={t('tabs.profile')} variant="secondary" onPress={() => router.push('/profile')} />
          ) : (
            <Button label={t('landing.enter')} onPress={() => router.push('/welcome')} />
          )}
        </View>
      </View>
      {menuOpen && !regular ? (
        <View style={{ gap: space.xs }}>
          {items.map((item) => (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => follow(item)} style={{ minHeight: 44, justifyContent: 'center' }}>
              <AppText variant="body" tone={active(item) ? 'accent' : 'default'}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
          <Button
            label={t('landing.pro')}
            onPress={() => {
              setMenuOpen(false);
              setProOpen(true);
            }}
          />
          <Button label={t('landing.account')} variant="secondary" onPress={() => { setMenuOpen(false); router.push('/profile'); }} />
        </View>
      ) : null}
      <ProModal visible={proOpen} onClose={() => setProOpen(false)} />
    </View>
  );
}

function NavLink({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, justifyContent: 'center' }}>
      <AppText variant="small" tone={selected ? 'accent' : 'default'} style={{ fontFamily: selected ? fontFamily.semibold : fontFamily.medium }}>
        {label}
      </AppText>
    </Pressable>
  );
}
