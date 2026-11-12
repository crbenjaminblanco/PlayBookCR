import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Share } from '@/src/data/provinces';
import { teamById } from '@/src/data/teams';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, radius, space } from '@/src/theme/tokens';
import { FanCount } from '@/src/ui/FanCount';
import { AppText } from '@/src/ui/Text';
import { readableTeamColor } from '@/src/ui/teamColor';

const TOP = 5;

export function ShareList({
  shares,
  favoriteId,
  compact = false,
}: {
  shares: Share[];
  favoriteId?: string | null;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? shares : shares.slice(0, TOP);
  const max = shares[0]?.fans || 1;

  return (
    <View style={{ gap: space.sm }}>
      {visible.map((share) => {
        const team = teamById(share.teamId);
        const mine = share.teamId === favoriteId;
        const mark = team ? readableTeamColor(team.color) : colors.textMuted;
        return (
          <View key={share.teamId} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1 }}>
                <View style={{ width: 10, height: 10, borderRadius: radius.pill, backgroundColor: mark }} />
                <AppText variant="small" style={{ fontFamily: mine ? fontFamily.bold : fontFamily.medium, flex: 1 }}>
                  {team ? (compact ? team.abbr : `${team.city} ${team.name}`) : share.teamId}
                </AppText>
              </View>
              <FanCount fans={share.fans} />
            </View>
            <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
              <View
                style={{
                  width: `${(share.fans / max) * 100}%`,
                  height: 8,
                  borderRadius: radius.pill,
                  backgroundColor: mark,
                }}
              />
            </View>
          </View>
        );
      })}
      {shares.length > TOP ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded((value) => !value)}
          style={{ minHeight: hitSize, justifyContent: 'center' }}>
          <AppText variant="small" tone="accent" style={{ fontFamily: fontFamily.semibold }}>
            {expanded ? t('home.showLess') : t('home.showMore')}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
