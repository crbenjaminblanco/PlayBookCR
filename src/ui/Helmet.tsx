import { Text, View } from 'react-native';

import type { Team } from '@/src/data/teams';
import { fontFamily } from '@/src/theme/tokens';
import { readableTeamColor } from '@/src/ui/teamColor';

export function InitialsBadge({
  label,
  color,
  size = 40,
  accessibilityLabel,
}: {
  label: string;
  color: string;
  size?: number;
  accessibilityLabel?: string;
}) {
  const fontSize = Math.round(size * (label.length > 2 ? 0.26 : 0.32));

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${color}33`,
        borderWidth: 1,
        borderColor: `${color}55`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          color,
          fontFamily: fontFamily.bold,
          fontSize,
          lineHeight: fontSize,
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </View>
  );
}

export function Helmet({ team, size = 40 }: { team: Team; size?: number }) {
  return (
    <InitialsBadge
      label={team.abbr}
      color={readableTeamColor(team.color)}
      size={size}
      accessibilityLabel={`${team.city} ${team.name}`}
    />
  );
}
