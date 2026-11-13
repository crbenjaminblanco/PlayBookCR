import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { CostaRicaBoard } from '@/src/ui/CostaRicaBoard';
import { AppText } from '@/src/ui/Text';

export default function FansScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl, gap: space.xl }}>
      <CostaRicaBoard />
      <AppText variant="small" tone="muted" style={{ textAlign: 'center' }}>
        {t('landing.footer')}
      </AppText>
    </ScrollView>
  );
}
