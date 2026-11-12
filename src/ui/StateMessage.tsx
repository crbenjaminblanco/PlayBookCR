import { View } from 'react-native';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { AppText } from '@/src/ui/Text';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'loading' | 'empty' | 'error';
};

export function StateMessage({ title, actionLabel, onAction, variant = 'empty' }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={{ gap: space.lg, paddingVertical: space.xl }} accessibilityRole="text">
      {variant === 'loading' ? (
        <View style={{ gap: space.md }}>
          {[0.92, 0.7, 0.5].map((width) => (
            <View
              key={width}
              style={{
                height: width === 0.92 ? 180 : 18,
                width: `${width * 100}%`,
                borderRadius: radius.card,
                backgroundColor: colors.surfaceElevated,
              }}
            />
          ))}
        </View>
      ) : null}
      <AppText variant={variant === 'loading' ? 'small' : 'heading'} tone="muted">
        {title}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}
