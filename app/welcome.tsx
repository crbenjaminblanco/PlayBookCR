import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { Screen } from '@/src/ui/Screen';
import { AppText } from '@/src/ui/Text';
import { TextField } from '@/src/ui/TextField';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { auth, signInGuest, signInAccount } = useSession();
  const { wide } = useBreakpoint();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (auth?.teamId) return <Redirect href="/" />;
  if (auth) return <Redirect href="/team" />;

  async function enter() {
    if (!email.trim()) {
      setError(t('welcome.emailRequired'));
      return;
    }
    if (!isEmail(email)) {
      setError(t('welcome.emailInvalid'));
      return;
    }
    await signInAccount(email);
    router.replace('/team');
  }

  async function guest() {
    await signInGuest();
    router.replace('/team');
  }

  const story = (
    <View style={{ gap: space.lg, flex: 1 }}>
      <AppText variant="kicker" tone="accent">
        {t('welcome.kicker')}
      </AppText>
      <AppText variant="display">{t('welcome.title')}</AppText>
      <AppText variant="body" tone="muted">
        {t('welcome.subtitle')}
      </AppText>
      <View style={{ gap: space.md }}>
        {[t('welcome.pointMap'), t('welcome.pointAdvice'), t('welcome.pointStore')].map((point) => (
          <View key={point} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
            <AppText variant="body">{point}</AppText>
          </View>
        ))}
      </View>
    </View>
  );

  const form = (
    <Card style={{ flex: wide ? 0.9 : undefined, padding: space.xl }}>
      <TextField
        label={t('welcome.email')}
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (error) setError('');
        }}
        error={error}
        keyboardType="email-address"
        placeholder="ana@correo.com"
      />
      <Button label={t('welcome.signIn')} onPress={enter} />
      <Button label={t('welcome.guest')} variant="secondary" onPress={guest} />
      <AppText variant="small" tone="muted" style={{ fontFamily: fontFamily.regular }}>
        {t('welcome.demoHint')}
      </AppText>
    </Card>
  );

  return (
    <Screen center>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 48 : 28, alignItems: 'stretch' }}>
        {story}
        {form}
      </View>
    </Screen>
  );
}
