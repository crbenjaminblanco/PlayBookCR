import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/src/session/SessionProvider';
import { space } from '@/src/theme/tokens';
import { BrandMark } from '@/src/ui/Brand';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { IconTile, type IconName } from '@/src/ui/Kit';
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

  const points: { icon: IconName; label: string }[] = [
    { icon: 'map-marker-radius-outline', label: t('welcome.pointMap') },
    { icon: 'chart-box-outline', label: t('welcome.pointAdvice') },
    { icon: 'shopping-outline', label: t('welcome.pointStore') },
  ];

  return (
    <Screen center tabs={false}>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? space.xxxl : space.xl, alignItems: wide ? 'center' : 'stretch' }}>
        <View style={{ flex: wide ? 1 : undefined, gap: space.xl }}>
          <BrandMark size={56} />
          <View style={{ gap: space.md }}>
            <AppText variant="display" accessibilityRole="header">
              {t('welcome.title')}
            </AppText>
            <AppText variant="body" tone="muted">
              {t('welcome.subtitle')}
            </AppText>
          </View>
          <View style={{ gap: space.md }}>
            {points.map((point) => (
              <View key={point.label} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                <IconTile icon={point.icon} />
                <AppText variant="label" style={{ flex: 1 }}>
                  {point.label}
                </AppText>
              </View>
            ))}
          </View>
        </View>
        <Card style={{ flex: wide ? 1 : undefined, gap: space.md, padding: space.xl }}>
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
          <Button label={t('welcome.signIn')} block onPress={enter} />
          <Button label={t('welcome.guest')} variant="secondary" block onPress={guest} />
          <AppText variant="caption" tone="muted" style={{ textAlign: 'center', fontSize: 13, lineHeight: 18 }}>
            {t('welcome.demoHint')}
          </AppText>
        </Card>
      </View>
    </Screen>
  );
}
