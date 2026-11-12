import { HelperText, TextInput } from 'react-native-paper';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily } from '@/src/theme/tokens';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
};

export function TextField({ label, value, onChangeText, error, placeholder, keyboardType = 'default' }: Props) {
  const { colors } = useAppTheme();
  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        error={Boolean(error)}
        outlineColor={colors.borderStrong}
        activeOutlineColor={colors.accent}
        textColor={colors.text}
        style={{ backgroundColor: colors.surface, fontFamily: fontFamily.regular }}
      />
      {error ? <HelperText type="error">{error}</HelperText> : null}
    </>
  );
}
