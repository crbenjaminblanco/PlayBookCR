import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { DroneBall } from '@/src/ui/DroneBall';
import { Screen } from '@/src/ui/Screen';
import { AppText } from '@/src/ui/Text';
import { WeekTicker } from '@/src/ui/WeekTicker';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { wide, regular, pad } = useBreakpoint();
  const { colors } = useAppTheme();
  const { prefs } = useSession();

  return (
    <Screen>
      <View style={{ gap: wide ? space.xxxl : space.xl }}>
        {!wide ? (
          <View style={{ marginHorizontal: -pad }}>
            <DroneBall height={280} />
          </View>
        ) : null}
        <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'stretch', gap: wide ? 48 : space.lg }}>
          <View style={{ flex: 1, justifyContent: 'flex-end', gap: space.lg, minWidth: 0 }}>
            <AppText variant="kicker" tone="muted">
              {t('landing.resultsKicker')}
            </AppText>
            <AppText variant="display">{t('landing.heroTitle')}</AppText>
            <AppText variant="body" tone="muted" style={{ maxWidth: 520 }}>
              {t('landing.heroBody')}
            </AppText>
            <View style={{ flexDirection: regular ? 'row' : 'column', gap: space.sm }}>
              <Button
                label={t('landing.tryPredictor')}
                style={regular ? undefined : { alignSelf: 'stretch' }}
                onPress={() => router.push('/analysis')}
              />
              <Button
                label={t('landing.join')}
                variant="secondary"
                style={regular ? undefined : { alignSelf: 'stretch' }}
                onPress={() => router.push('/community')}
              />
            </View>
          </View>
          {wide ? (
            <View style={{ width: '36%' }}>
              <DroneBall height={480} />
            </View>
          ) : null}
        </View>
        <View style={{ marginHorizontal: -pad }}>
          <WeekTicker />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <View style={{ width: 8, height: 8, backgroundColor: colors.text }} />
          <AppText variant="small" tone="muted">
            {new Intl.NumberFormat(prefs.language === 'en' ? 'en-US' : 'es-CR').format(2480)} {t('landing.statRegistered')} · {t('landing.statRegisteredNote')}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}
