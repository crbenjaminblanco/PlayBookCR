import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/ui/Button';
import { ScreenHeader } from '@/src/ui/Kit';
import { Screen } from '@/src/ui/Screen';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('common.appName'), headerShown: false }} />
      <Screen>
        <ScreenHeader title={t('notFound.title')} />
        <Button label={t('notFound.action')} onPress={() => router.replace('/')} />
      </Screen>
    </>
  );
}
