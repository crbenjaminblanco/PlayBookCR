import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, usePathname } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { teamById } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hero, lift, radius, space, tabBar } from '@/src/theme/tokens';
import { AiMark } from '@/src/ui/AiMark';
import { Brand } from '@/src/ui/Brand';
import { Helmet } from '@/src/ui/Helmet';
import { Avatar, type IconName } from '@/src/ui/Kit';
import { useAsk } from '@/src/ui/AskDock';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type Href = '/' | '/analysis' | '/community' | '/store' | '/profile';

type Item = {
  id: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
  href?: Href;
};

/** Rutas de entrada: sin barra de pestañas para no distraer del primer paso. */
const bare = ['/welcome', '/team'];

const frosted = Platform.OS === 'web' ? ({ backdropFilter: 'blur(20px) saturate(1.4)' } as object) : null;

function useItems(): Item[] {
  const { t } = useTranslation();
  return [
    { id: 'home', label: t('tabs.home'), icon: 'home-outline', activeIcon: 'home', href: '/' },
    { id: 'games', label: t('landing.navGames'), icon: 'scoreboard-outline', activeIcon: 'scoreboard', href: '/analysis' },
    { id: 'ask', label: t('landing.navAsk'), icon: 'creation', activeIcon: 'creation' },
    { id: 'community', label: t('landing.navCommunity'), icon: 'account-group-outline', activeIcon: 'account-group', href: '/community' },
    { id: 'store', label: t('tabs.store'), icon: 'shopping-outline', activeIcon: 'shopping', href: '/store' },
  ];
}

function useNav() {
  const pathname = usePathname();
  const { open, setOpen } = useAsk();
  return {
    pathname,
    isActive: (item: Item) => (item.href ? pathname === item.href : open),
    follow: (item: Item) => {
      if (!item.href) {
        setOpen(!open);
        return;
      }
      setOpen(false);
      router.push(item.href);
    },
  };
}

export function AppDock({ placement }: { placement: 'top' | 'bottom' }) {
  const { wide } = useBreakpoint();
  const { pathname } = useNav();
  if (bare.includes(pathname)) return null;
  if (placement === 'top') return wide ? <TopBar /> : null;
  return wide ? null : <TabBar />;
}

function TabBar() {
  const { colors, name } = useAppTheme();
  const insets = useSafeAreaInsets();
  const items = useItems();
  const { isActive, follow } = useNav();
  const tabs = items.filter((item) => item.href);
  const ask = items.find((item) => !item.href);
  const dark = name === 'dark';
  const shadow = { shadowColor: '#0B1324', shadowOpacity: dark ? 0.4 : 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 10 };

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, tabBar.inset), alignItems: 'center', zIndex: 40 }}>
      <View style={{ width: '100%', maxWidth: 520, paddingHorizontal: tabBar.inset, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {/* Píldora oscura con las secciones: la activa se abre y muestra su nombre. */}
        <View
          accessibilityRole="tablist"
          style={[
            {
              flex: 1,
              height: tabBar.height,
              borderRadius: radius.pill,
              backgroundColor: dark ? 'rgba(27,34,51,0.94)' : 'rgba(11,19,36,0.94)',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 6,
              gap: 4,
              borderWidth: dark ? 1 : 0,
              borderColor: colors.border,
            },
            shadow,
            frosted,
          ]}>
          {tabs.map((item) => (
            <Tab key={item.id} item={item} active={isActive(item)} onPress={() => follow(item)} />
          ))}
        </View>
        {/* La IA, aparte: es una acción, no una sección. */}
        {ask ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ask.label}
            accessibilityState={{ expanded: isActive(ask) }}
            onPress={() => follow(ask)}
            style={({ pressed }) => [
              {
                width: tabBar.height,
                height: tabBar.height,
                borderRadius: tabBar.height / 2,
                backgroundColor: isActive(ask) ? hero.base : colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.94 : 1 }],
              },
              { ...shadow, shadowColor: colors.accent, shadowOpacity: 0.4 },
            ]}>
            {isActive(ask) ? <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" /> : <AiMark size={30} />}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Tab({ item, active, onPress }: { item: Item; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        // Las inactivas tienen ancho fijo de icono; la activa toma el resto para que su nombre quepa.
        flexGrow: active ? 1 : 0,
        flexBasis: active ? 0 : 40,
        width: active ? undefined : 40,
        height: '100%',
        borderRadius: radius.pill,
        backgroundColor: active ? '#FFFFFF' : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 10,
        opacity: pressed && !active ? 0.6 : 1,
      })}>
      <MaterialCommunityIcons name={active ? item.activeIcon : item.icon} size={22} color={active ? hero.base : 'rgba(255,255,255,0.62)'} />
      {active ? (
        <AppText numberOfLines={1} style={{ fontSize: 13, lineHeight: 17, fontFamily: fontFamily.bold, color: hero.base, flexShrink: 1 }}>
          {item.label}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function TopBar() {
  const { colors, name } = useAppTheme();
  const items = useItems();
  const { pathname, isActive, follow } = useNav();
  const glass = name === 'dark' ? 'rgba(8,12,21,0.85)' : 'rgba(242,244,248,0.85)';

  return (
    <View style={[{ backgroundColor: glass, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 40 }, frosted]}>
      <View
        style={{
          width: '100%',
          maxWidth: 1180,
          alignSelf: 'center',
          paddingHorizontal: 40,
          height: 72,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.lg,
        }}>
        <Pressable accessibilityRole="link" accessibilityLabel={items[0].label} onPress={() => router.push('/')}>
          <Brand />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
          {items.map((item) => {
            const active = isActive(item);
            const ask = !item.href;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
                onPress={() => follow(item)}
                style={({ hovered }: { hovered?: boolean }) => [
                  {
                    minHeight: 40,
                    paddingHorizontal: 16,
                    borderRadius: radius.pill,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: ask ? colors.accent : active ? colors.surface : hovered ? colors.surface : 'transparent',
                  },
                  active && !ask && name === 'light' ? { ...lift, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } : null,
                ]}>
                {ask ? (
                  <AiMark size={20} />
                ) : (
                  <MaterialCommunityIcons name={active ? item.activeIcon : item.icon} size={17} color={active ? colors.text : colors.textMuted} />
                )}
                <AppText variant="small" style={{ fontFamily: fontFamily.semibold, color: ask ? '#FFFFFF' : active ? colors.text : colors.textMuted }}>
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <AccountButton active={pathname === '/profile'} />
      </View>
    </View>
  );
}

/**
 * Botón de cuenta, igual en teléfono y escritorio: la insignia del equipo (o la inicial,
 * o un icono) con la palabra "Cuenta". Lleva a Perfil, donde se configura todo.
 */
export function AccountButton({ active = false }: { active?: boolean }) {
  const { t } = useTranslation();
  const { colors, name } = useAppTheme();
  const { auth } = useSession();
  const team = teamById(auth?.teamId);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('landing.account')}
      accessibilityState={{ selected: active }}
      onPress={() => router.push('/profile')}
      style={({ pressed }) => [
        {
          minHeight: 44,
          paddingLeft: 4,
          paddingRight: 12,
          borderRadius: radius.pill,
          backgroundColor: colors.surface,
          borderWidth: active ? 1.5 : name === 'dark' ? 1 : 0,
          borderColor: active ? colors.accent : colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          opacity: pressed ? 0.75 : 1,
        },
        name === 'light' ? lift : null,
      ]}>
      {team ? (
        <Helmet team={team} size={36} />
      ) : auth?.email ? (
        <Avatar label={auth.email[0].toUpperCase()} size={36} color={colors.surfaceElevated} />
      ) : (
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="account-outline" size={20} color={colors.text} />
        </View>
      )}
      <AppText variant="small" style={{ fontFamily: fontFamily.bold }}>
        {t('landing.account')}
      </AppText>
    </Pressable>
  );
}
