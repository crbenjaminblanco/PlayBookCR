import { useTranslation } from 'react-i18next';

import { CostaRicaBoard } from '@/src/ui/CostaRicaBoard';
import { Screen } from '@/src/ui/Screen';
import { Stage } from '@/src/ui/Stage';
import { AppText } from '@/src/ui/Text';

export default function FansScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <Stage kicker={t('home.kicker')} title={t('home.title')}>
        <AppText variant="body" tone="muted" style={{ maxWidth: 640 }}>
          {t('home.subtitle')}
        </AppText>
        <CostaRicaBoard embedded showHeading={false} />
      </Stage>
      <AppText variant="small" tone="muted">
        {t('landing.footer')}
      </AppText>
    </Screen>
  );
}
