import { Text, View } from 'react-native';

import type { Team } from '@/src/data/teams';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily } from '@/src/theme/tokens';

export function InitialsBadge({
  label,
  color,
  textColor = '#FFFFFF',
  size = 40,
  ring,
  accessibilityLabel,
}: {
  label: string;
  color: string;
  textColor?: string;
  size?: number;
  /** Color del anillo para separar insignias superpuestas. */
  ring?: string;
  accessibilityLabel?: string;
}) {
  const { colors, name } = useAppTheme();
  const fontSize = Math.round(size * (label.length > 2 ? 0.28 : 0.34));

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: ring ? 2 : name === 'dark' ? 1 : 0,
        borderColor: ring ?? colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          color: textColor,
          fontFamily: fontFamily.bold,
          fontSize,
          lineHeight: fontSize + 2,
          letterSpacing: -0.2,
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </View>
  );
}

export function Helmet({ team, size = 40, ring }: { team: Team; size?: number; ring?: string }) {
  return (
    <InitialsBadge
      label={team.abbr}
      color={team.color}
      textColor={team.onColor}
      size={size}
      ring={ring}
      accessibilityLabel={`${team.city} ${team.name}`}
    />
  );
}
