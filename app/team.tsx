import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { teams, type Conference } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, radius, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Screen } from '@/src/ui/Screen';
import { TeamMark } from '@/src/ui/TeamMark';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

const filters: Array<Conference | 'all'> = ['all', 'AFC', 'NFC'];

export default function TeamScreen() {
  const { t } = useTranslation();
  const { auth, setTeam } = useSession();
  const { colors } = useAppTheme();
  const { teamColumns } = useBreakpoint();
  const [filter, setFilter] = useState<Conference | 'all'>('all');
  const [selected, setSelected] = useState<string | null>(auth?.teamId ?? null);

  if (!auth) return <Redirect href="/welcome" />;

  const visible = teams.filter((team) => filter === 'all' || team.conference === filter);
  const basis = teamColumns === 2 ? '48%' : teamColumns === 3 ? '31.5%' : '23.5%';

  async function confirm() {
    if (!selected) return;
    await setTeam(selected);
    router.replace('/');
  }

  return (
    <Screen
      footer={
        <Button label={t('common.continue')} disabled={!selected} onPress={confirm} />
      }>
      <View style={{ gap: space.sm }}>
        <AppText variant="title">{auth.teamId ? t('team.changeTitle') : t('team.title')}</AppText>
        <AppText variant="body" tone="muted">
          {t('team.subtitle')}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        {filters.map((item) => {
          const active = item === filter;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item)}
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
              <AppText
                variant="small"
                tone={active ? 'inverse' : 'default'}
                style={{ fontFamily: fontFamily.semibold }}>
                {item === 'all' ? t('team.all') : item}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.md }}>
        {visible.map((team) => {
          const active = team.id === selected;
          return (
            <Pressable
              key={team.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${team.city} ${team.name}`}
              onPress={() => setSelected(team.id)}
              style={{
                width: basis,
                minHeight: 88,
                borderRadius: radius.card,
                borderWidth: active ? 2 : 1,
                borderColor: active ? colors.accent : colors.border,
                backgroundColor: colors.surface,
                padding: space.md,
                gap: space.sm,
                justifyContent: 'center',
              }}>
              <TeamMark team={team} />
              <AppText variant="small" numberOfLines={1} style={{ fontFamily: fontFamily.semibold }}>
                {team.name}
              </AppText>
              <AppText variant="small" tone="muted" numberOfLines={1}>
                {team.city}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
