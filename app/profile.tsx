import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { teamById } from '@/src/data/teams';
import { useSession, type Language } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ThemeName } from '@/src/theme/colors';
import { fontFamily, hero, radius, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Helmet } from '@/src/ui/Helmet';
import { Avatar, Badge, IconTile, ListRow, ScreenHeader, Section, Segmented } from '@/src/ui/Kit';
import { ProModal } from '@/src/ui/ProModal';
import { Screen } from '@/src/ui/Screen';
import { AppText } from '@/src/ui/Text';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { auth, prefs, setLanguage, setTheme, signOut } = useSession();
  const { colors } = useAppTheme();
  const [proOpen, setProOpen] = useState(false);
  const team = teamById(auth?.teamId);
  const name = auth?.email ?? t('profile.guest');

  async function leave() {
    await signOut();
    router.replace('/');
  }

  return (
    <Screen>
      <ScreenHeader title={t('profile.title')} back />

      <View style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.sm }}>
        {team ? (
          <Helmet team={team} size={84} />
        ) : auth?.email ? (
          <Avatar label={auth.email[0].toUpperCase()} size={84} color={colors.surface} />
        ) : (
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="account-outline" size={40} color={colors.textMuted} />
          </View>
        )}
        <AppText variant="heading" numberOfLines={1} style={{ fontSize: 20, lineHeight: 26, marginTop: space.sm }}>
          {name}
        </AppText>
        {auth ? (
          <Badge label={auth.mode === 'account' ? t('profile.account') : t('profile.guest')} tone="accent" />
        ) : (
          <View style={{ gap: space.md, alignItems: 'center' }}>
            <AppText variant="small" tone="muted" style={{ textAlign: 'center', maxWidth: 320 }}>
              {t('welcome.demoHint')}
            </AppText>
            <Button label={t('landing.enter')} onPress={() => router.push('/welcome')} style={{ alignSelf: 'center' }} />
          </View>
        )}
      </View>

      <MembershipCard onPress={() => setProOpen(true)} />

      {auth ? (
        <Section title={t('profile.team')}>
          <Card style={{ paddingVertical: space.xs, gap: 0 }}>
            <ListRow
              leading={team ? <Helmet team={team} size={40} /> : <IconTile icon="football" />}
              title={team ? `${team.city} ${team.name}` : t('app.noTeam')}
              subtitle={t('profile.changeTeam')}
              onPress={() => router.push('/team')}
              chevron
              divider={false}
            />
          </Card>
        </Section>
      ) : null}

      <Section title={t('app.preferences')}>
        <Card style={{ gap: space.lg }}>
          <View style={{ gap: space.sm }}>
            <RowLabel icon="translate" label={t('profile.language')} />
            <Segmented<Language>
              options={[
                { id: 'es', label: 'Español' },
                { id: 'en', label: 'English' },
              ]}
              value={prefs.language}
              onChange={setLanguage}
            />
          </View>
          <View style={{ gap: space.sm }}>
            <RowLabel icon="theme-light-dark" label={t('profile.theme')} />
            <Segmented<ThemeName>
              options={[
                { id: 'light', label: t('profile.themeLight') },
                { id: 'dark', label: t('profile.themeDark') },
              ]}
              value={prefs.theme}
              onChange={setTheme}
            />
          </View>
        </Card>
      </Section>

      {auth ? (
        <Card style={{ paddingVertical: space.xs, gap: 0 }}>
          <Pressable accessibilityRole="button" onPress={leave} style={({ pressed }) => ({ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.md, opacity: pressed ? 0.6 : 1 })}>
            <IconTile icon="logout" tint={colors.danger} />
            <AppText variant="label" tone="danger">
              {t('profile.signOut')}
            </AppText>
          </Pressable>
        </Card>
      ) : null}

      <ProModal visible={proOpen} onClose={() => setProOpen(false)} />
    </Screen>
  );
}

function RowLabel({ icon, label }: { icon: 'translate' | 'theme-light-dark'; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.textMuted} />
      <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
        {label}
      </AppText>
    </View>
  );
}

function MembershipCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const glow = Platform.OS === 'web' ? ({ backgroundImage: `radial-gradient(90% 120% at 100% 0%, ${hero.glow}99 0%, transparent 60%)` } as object) : null;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.99 : 1 }] })}>
      <View style={[{ backgroundColor: hero.base, borderRadius: radius.card, padding: space.xl, flexDirection: 'row', alignItems: 'center', gap: space.lg, overflow: 'hidden' }, glow]}>
        <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: hero.chip, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="crown-outline" size={24} color={hero.text} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="label" style={{ color: hero.text }}>
            {t('landing.pro')}
          </AppText>
          <AppText variant="caption" style={{ color: hero.muted, fontSize: 13, lineHeight: 18 }}>
            {t('app.proBody')}
          </AppText>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={hero.text} />
      </View>
    </Pressable>
  );
}
