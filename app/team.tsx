import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { teams, type Conference } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, lift, radius, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Helmet } from '@/src/ui/Helmet';
import { ScreenHeader, Segmented } from '@/src/ui/Kit';
import { Screen } from '@/src/ui/Screen';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type Filter = Conference | 'all';

export default function TeamScreen() {
  const { t } = useTranslation();
  const { auth, setTeam } = useSession();
  const { colors, name } = useAppTheme();
  const { teamColumns } = useBreakpoint();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(auth?.teamId ?? null);

  if (!auth) return <Redirect href="/welcome" />;

  const visible = teams.filter((team) => filter === 'all' || team.conference === filter);
  const basis = teamColumns === 4 ? '23.6%' : '31.6%';

  async function confirm() {
    if (!selected) return;
    await setTeam(selected);
    router.replace('/');
  }

  return (
    <Screen tabs={false} footer={<Button label={t('common.continue')} block disabled={!selected} onPress={confirm} />}>
      <ScreenHeader title={auth.teamId ? t('team.changeTitle') : t('team.title')} subtitle={t('team.subtitle')} back={Boolean(auth.teamId)} />
      <Segmented<Filter>
        options={[
          { id: 'all', label: t('team.all') },
          { id: 'AFC', label: 'AFC' },
          { id: 'NFC', label: 'NFC' },
        ]}
        value={filter}
        onChange={setFilter}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.md }}>
        {visible.map((team) => {
          const active = team.id === selected;
          return (
            <Pressable
              key={team.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${team.city} ${team.name}`}
              onPress={() => setSelected(team.id)}
              style={({ pressed }) => [
                {
                  width: basis,
                  paddingVertical: space.lg,
                  paddingHorizontal: space.sm,
                  borderRadius: radius.card - 4,
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: active ? colors.accent : name === 'dark' ? colors.border : 'transparent',
                  alignItems: 'center',
                  gap: space.sm,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
                name === 'light' ? lift : null,
              ]}>
              <Helmet team={team} size={48} />
              <View style={{ alignItems: 'center' }}>
                <AppText variant="small" numberOfLines={1} style={{ fontFamily: fontFamily.bold }}>
                  {team.name}
                </AppText>
                <AppText variant="caption" tone="muted" numberOfLines={1}>
                  {team.city}
                </AppText>
              </View>
              {active ? (
                <View style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
