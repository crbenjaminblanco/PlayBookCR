import { useState } from 'react';
import { Button, Menu } from 'react-native-paper';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily } from '@/src/theme/tokens';

type Option = { id: string; label: string };

export function Select({
  label,
  value,
  options,
  onChange,
  large = false,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (id: string) => void;
  large?: boolean;
}) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.id === value)?.label ?? options[0]?.label ?? '';

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <Button
          mode="outlined"
          accessibilityLabel={label}
          onPress={() => setOpen((next) => !next)}
          icon={open ? 'chevron-up' : 'chevron-down'}
          textColor={colors.text}
          style={{ width: '100%', borderRadius: 12, borderColor: colors.borderStrong, backgroundColor: colors.surface }}
          contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between', minHeight: large ? 56 : 48 }}
          labelStyle={{ fontFamily: fontFamily.regular, fontSize: large ? 18 : 16 }}>
          {current}
        </Button>
      }>
      {options.map((option) => (
        <Menu.Item
          key={option.id || 'all'}
          title={option.label}
          leadingIcon={option.id === value ? 'check' : undefined}
          onPress={() => {
            onChange(option.id);
            setOpen(false);
          }}
        />
      ))}
    </Menu>
  );
}
