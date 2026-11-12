import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { teamById, teamLabel } from '@/src/data/teams';
import { useSession, type Language } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ThemeName } from '@/src/theme/colors';
import { fontFamily, hitSize, radius, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Screen } from '@/src/ui/Screen';
import { TeamMark } from '@/src/ui/TeamMark';
import { AppText } from '@/src/ui/Text';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { auth, prefs, setLanguage, setTheme, signOut } = useSession();
  const team = teamById(auth?.teamId);

  async function leave() {
    await signOut();
    router.replace('/');
  }

  return (
    <Screen>
      <AppText variant="title">{t('profile.title')}</AppText>
      {!auth ? (
        <Card>
          <AppText variant="body" tone="muted">
            {t('welcome.demoHint')}
          </AppText>
          <Button label={t('landing.enter')} onPress={() => router.push('/welcome')} />
        </Card>
      ) : (
        <>
          <Card>
            <AppText variant="small" tone="muted">
              {auth.mode === 'account' ? t('profile.account') : t('profile.guest')}
            </AppText>
            <AppText variant="heading">{auth.email ?? t('profile.guest')}</AppText>
          </Card>

          <Card>
            <AppText variant="small" tone="muted">
              {t('profile.team')}
            </AppText>
            {team ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <TeamMark team={team} size={40} />
                <AppText variant="heading">{teamLabel(team)}</AppText>
              </View>
            ) : null}
            <Button label={t('profile.changeTeam')} variant="secondary" onPress={() => router.push('/team')} />
          </Card>
        </>
      )}

      <Card>
        <AppText variant="heading">{t('profile.language')}</AppText>
        <ChoiceRow
          options={[
            { id: 'es' as Language, label: 'Español' },
            { id: 'en' as Language, label: 'English' },
          ]}
          selected={prefs.language}
          onSelect={setLanguage}
        />
        <AppText variant="heading">{t('profile.theme')}</AppText>
        <ChoiceRow
          options={[
            { id: 'dark' as ThemeName, label: t('profile.themeDark') },
            { id: 'light' as ThemeName, label: t('profile.themeLight') },
          ]}
          selected={prefs.theme}
          onSelect={setTheme}
        />
      </Card>

      {auth ? <Button label={t('profile.signOut')} variant="secondary" onPress={leave} /> : null}
    </Screen>
  );
}

function ChoiceRow<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { id: T; label: string }[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
      {options.map((option) => {
        const active = option.id === selected;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(option.id)}
            style={{
              minHeight: hitSize,
              paddingHorizontal: space.lg,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? colors.accentFill : colors.surface,
              borderWidth: 1,
              borderColor: active ? colors.accentFill : colors.borderStrong,
            }}>
            <AppText variant="small" tone={active ? 'inverse' : 'default'} style={{ fontFamily: fontFamily.semibold }}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
