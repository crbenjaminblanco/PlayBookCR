import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { AppText } from '@/src/ui/Text';
import { TextField } from '@/src/ui/TextField';

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ProModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.close')}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: space.lg }}>
        <Pressable onPress={() => undefined} style={{ maxWidth: 440, width: '100%', alignSelf: 'center' }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="title" style={{ flex: 1 }}>
                {t('landing.proTitle')}
              </AppText>
              <Pressable accessibilityRole="button" accessibilityLabel={t('home.close')} onPress={onClose} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
                <AppText variant="heading" tone="muted">
                  ×
                </AppText>
              </Pressable>
            </View>
            <AppText variant="small" tone="muted">
              {t('landing.proBody')}
            </AppText>
            <TextField
              label={t('welcome.email')}
              value={email}
              onChangeText={setEmail}
              error={error}
              placeholder="tu@correo.com"
              keyboardType="email-address"
            />
            <Button label={t('landing.proSubmit')} onPress={submit} />
            {thanks ? (
              <AppText variant="small" style={{ color: colors.success }}>
                {t('landing.proThanks')}
              </AppText>
            ) : null}
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
