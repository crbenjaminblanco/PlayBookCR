import { useState } from 'react';
import { Button, Menu } from 'react-native-paper';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, space } from '@/src/theme/tokens';

type Option = { id: string; label: string };

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (id: string) => void;
}) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.id === value)?.label ?? options[0]?.label ?? '';

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      contentStyle={{ backgroundColor: colors.surface, borderRadius: 16, paddingVertical: space.sm }}
      anchor={
        <Button
          mode="outlined"
          accessibilityLabel={label}
          onPress={() => setOpen((next) => !next)}
          icon={open ? 'chevron-up' : 'chevron-down'}
          textColor={colors.text}
          style={{ width: '100%', alignSelf: 'stretch', borderRadius: 16, borderColor: colors.borderStrong, backgroundColor: colors.bg }}
          contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: space.sm }}
          labelStyle={{ fontFamily: fontFamily.regular, fontSize: 16, textAlign: 'left', marginLeft: space.sm }}>
          {current}
        </Button>
      }>
      {options.map((option) => (
        <Menu.Item
          key={option.id || 'all'}
          title={option.label}
          leadingIcon={option.id === value ? 'check' : undefined}
          titleStyle={{ color: colors.text, fontFamily: fontFamily.regular }}
          style={{ backgroundColor: colors.surface, paddingHorizontal: space.lg, minHeight: 48, justifyContent: 'center' }}
          onPress={() => {
            onChange(option.id);
            setOpen(false);
          }}
        />
      ))}
    </Menu>
  );
}
