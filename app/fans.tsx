import { useTranslation } from 'react-i18next';

import { CostaRicaBoard } from '@/src/ui/CostaRicaBoard';
import { ScreenHeader } from '@/src/ui/Kit';
import { Screen } from '@/src/ui/Screen';

export default function FansScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <ScreenHeader title={t('home.title')} subtitle={t('home.subtitle')} back />
      <CostaRicaBoard />
    </Screen>
  );
}
