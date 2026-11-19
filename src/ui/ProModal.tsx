import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { hero, radius, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { IconButton } from '@/src/ui/Kit';
import { AppText } from '@/src/ui/Text';
import { TextField } from '@/src/ui/TextField';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Hoja inferior en teléfono, diálogo centrado en escritorio. */
export function ProModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { wide } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [thanks, setThanks] = useState(false);

  function submit() {
    if (!email.trim()) {
      setError(t('welcome.emailRequired'));
      setThanks(false);
      return;
    }
    if (!isEmail(email)) {
      setError(t('welcome.emailInvalid'));
      setThanks(false);
      return;
    }
    setError('');
    setThanks(true);
  }

  return (
    <Modal visible={visible} transparent animationType={wide ? 'fade' : 'slide'} onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.close')}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(11,19,36,0.45)', justifyContent: wide ? 'center' : 'flex-end', padding: wide ? space.lg : 0 }}>
        <Pressable
          onPress={() => undefined}
          style={{
            maxWidth: wide ? 440 : undefined,
            width: '100%',
            alignSelf: 'center',
            backgroundColor: colors.surface,
            borderRadius: radius.sheet,
            borderBottomLeftRadius: wide ? radius.sheet : 0,
            borderBottomRightRadius: wide ? radius.sheet : 0,
            padding: space.xl,
            paddingBottom: wide ? space.xl : insets.bottom + space.xl,
            gap: space.lg,
          }}>
          {wide ? null : <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, marginTop: -8 }} />}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.md }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: hero.base, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="crown-outline" size={26} color={hero.text} />
            </View>
            <IconButton icon="close" label={t('home.close')} tone="plain" onPress={onClose} />
          </View>
          <View style={{ gap: space.sm }}>
            <AppText variant="title">{t('landing.proTitle')}</AppText>
            <AppText variant="small" tone="muted">
              {t('landing.proBody')}
            </AppText>
          </View>
          <TextField
            label={t('welcome.email')}
            value={email}
            onChangeText={setEmail}
            error={error}
            placeholder="tu@correo.com"
            keyboardType="email-address"
          />
          <Button label={t('landing.proSubmit')} block onPress={submit} />
          {thanks ? (
            <AppText variant="small" tone="success">
              {t('landing.proThanks')}
            </AppText>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
