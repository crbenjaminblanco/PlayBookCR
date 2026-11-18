import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/src/ui/Screen';
import { Stage } from '@/src/ui/Stage';
import { AppText } from '@/src/ui/Text';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('common.appName'), headerShown: false }} />
      <Screen>
        <Stage title={t('notFound.title')} fill={false} />
        <Link href="/">
          <AppText variant="body" tone="accent">
            {t('notFound.action')}
          </AppText>
        </Link>
      </Screen>
    </>
  );
}
