import AsyncStorage from '@react-native-async-storage/async-storage';
import { SymbolView } from 'expo-symbols';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, View, type ScrollViewInstance, type TextStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { IconButton, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { streamGemini, type GeminiTurn } from '@/src/ai/gemini';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, space } from '@/src/theme/tokens';
import { Button } from '@/src/ui/Button';
import { Card } from '@/src/ui/Card';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

const CHAT_KEY = 'playbookcr.chat.v1';

type AskValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AskContext = createContext<AskValue | null>(null);

export function useAsk() {
  const value = useContext(AskContext);
  if (!value) throw new Error('useAsk debe usarse dentro de AskProvider');
  return value;
}

export function AskProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AskContext.Provider value={{ open, setOpen }}>
      {children}
      <AskDock />
    </AskContext.Provider>
  );
}

function AnswerText({ text }: { text: string }) {
  const lines = text
    .replace(/\*\*/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <View style={{ gap: space.sm }}>
      {lines.map((line, index) => {
        const item = /^[-•]\s+(.*)/.exec(line);
        if (!item) return <LinkedLine key={index} text={line} />;
        return (
          <View key={index} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
            <AppText variant="body">•</AppText>
            <View style={{ flex: 1 }}>
              <LinkedLine text={item[1]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const wrap = Platform.OS === 'web' ? ({ overflowWrap: 'anywhere' } as TextStyle) : undefined;

function LinkedLine({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/);
  return (
    <AppText variant="body" style={wrap}>
      {parts.map((part, index) =>
        part.startsWith('http') ? (
          <AppText
            key={index}
            variant="body"
            tone="accent"
            onPress={() => Linking.openURL(part)}
            style={[wrap, { textDecorationLine: 'underline' }]}>
            {part}
          </AppText>
        ) : (
          part
        ),
      )}
    </AppText>
  );
}

function AskDock() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const { wide } = useBreakpoint();
  const { open, setOpen } = useAsk();
  const [draft, setDraft] = useState('');
  const [photo, setPhoto] = useState<{ mime: string; data: string } | null>(null);
  const [turns, setTurns] = useState<GeminiTurn[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<ScrollViewInstance>(null);

  function followThread() {
    threadRef.current?.scrollToEnd({ animated: false });
  }

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(CHAT_KEY).then((raw) => {
      if (cancelled || !raw) {
        setReady(true);
        return;
      }
      try {
        const stored = JSON.parse(raw) as GeminiTurn[];
        if (Array.isArray(stored)) setTurns(stored);
      } catch {
        // A damaged transcript should not block a new question.
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const slim = turns.map((turn) =>
      turn.image && turn.image.data.length > 180_000 ? { role: turn.role, text: turn.text } : turn,
    );
    AsyncStorage.setItem(CHAT_KEY, JSON.stringify(slim)).catch(() => undefined);
  }, [turns, ready]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(followThread);
    return () => cancelAnimationFrame(frame);
  }, [open, turns, error]);

  function onPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const [meta, data] = result.split(',');
      const mime = /data:(.*?);/.exec(meta)?.[1] ?? 'image/jpeg';
      if (data) setPhoto({ mime, data });
    };
    reader.readAsDataURL(file);
  }

  async function send() {
    const text = draft.trim();
    if ((!text && !photo) || busy) return;
    const next = [...turns, { role: 'user' as const, text, image: photo ?? undefined }];
    setTurns([...next, { role: 'model', text: '' }]);
    setDraft('');
    setPhoto(null);
    setBusy(true);
    setError(null);
    try {
      await streamGemini(i18n.language, next, (answer) => {
        setTurns((current) => current.map((turn, index) => (index === current.length - 1 && turn.role === 'model' ? { ...turn, text: answer } : turn)));
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '';
      setError(message === 'missing' ? t('analysis.missingKey') : message === '429' ? t('analysis.rateLimit') : t('analysis.chatError'));
      setTurns((current) => {
        const last = current[current.length - 1];
        return last?.role === 'model' && !last.text ? current.slice(0, -1) : current;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open ? (
        <Pressable
          accessibilityLabel={t('home.close')}
          onPress={() => setOpen(false)}
          style={{ position: Platform.OS === 'web' ? 'fixed' : 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(7,11,22,0.55)', zIndex: 70 }}
        />
      ) : null}
      {open ? (
        <View
          style={{
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            bottom: 88,
            zIndex: 80,
            ...(wide ? { right: 16, width: 420 } : { left: 16, right: 16 }),
          }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1 }}>
                <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} tintColor={colors.accent} size={20} />
                <AppText variant="heading">{t('analysis.chatTitle')}</AppText>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={t('home.close')} onPress={() => setOpen(false)} style={{ minWidth: hitSize, minHeight: hitSize, alignItems: 'center', justifyContent: 'center' }}>
                <AppText variant="heading" tone="muted">×</AppText>
              </Pressable>
            </View>
            <AppText variant="small" tone="muted">
              {t('analysis.chatHint')}
            </AppText>
            <ScrollView ref={threadRef} style={{ maxHeight: 480 }} onContentSizeChange={followThread} contentContainerStyle={{ gap: space.md }}>
              {turns.map((turn, index) => {
                const mine = turn.role === 'user';
                const waiting = !mine && !turn.text && busy;
                return (
                  <View key={`${turn.role}-${index}`} style={{ alignItems: mine ? 'flex-end' : 'flex-start', gap: 4 }}>
                    <AppText variant="small" tone="muted">
                      {mine ? t('analysis.you') : t('analysis.assistant')}
                    </AppText>
                    <View
                      style={{
                        maxWidth: '92%',
                        backgroundColor: mine ? colors.accentFill : colors.bg,
                        borderRadius: 16,
                        borderBottomRightRadius: mine ? 4 : 16,
                        borderBottomLeftRadius: mine ? 16 : 4,
                        paddingHorizontal: space.md,
                        paddingVertical: space.sm,
                        gap: space.xs,
                      }}>
                      {turn.image ? (
                        <AppText variant="small" tone={mine ? 'inverse' : 'muted'}>
                          {t('analysis.photoAttached')}
                        </AppText>
                      ) : null}
                      {mine ? (
                        <AppText variant="body" tone="inverse">
                          {turn.text}
                        </AppText>
                      ) : waiting ? (
                        <Thinking label={t('analysis.thinking')} />
                      ) : (
                        <AnswerText text={turn.text} />
                      )}
                    </View>
                  </View>
                );
              })}
              {error ? (
                <AppText variant="small" tone="muted">
                  {error}
                </AppText>
              ) : null}
            </ScrollView>
            {photo ? (
              <AppText variant="small" tone="accent">
                {t('analysis.photoReady')}
              </AppText>
            ) : null}
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              {Platform.OS === 'web' ? (
                <IconButton
                  icon="camera-outline"
                  mode="contained-tonal"
                  size={22}
                  accessibilityLabel={t('analysis.photo')}
                  onPress={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (file) onPhoto(file);
                    };
                    input.click();
                  }}
                />
              ) : null}
              <TextInput
                mode="outlined"
                dense
                value={draft}
                onChangeText={setDraft}
                placeholder={t('analysis.placeholder')}
                accessibilityLabel={t('analysis.placeholder')}
                onSubmitEditing={send}
                outlineColor={colors.borderStrong}
                activeOutlineColor={colors.accent}
                textColor={colors.text}
                style={{ flex: 1, backgroundColor: colors.bg, fontFamily: fontFamily.regular }}
              />
              <Button label={t('analysis.send')} disabled={(!draft.trim() && !photo) || busy} onPress={send} />
            </View>
          </Card>
        </View>
      ) : null}
      <View
        style={{
          position: Platform.OS === 'web' ? 'fixed' : 'absolute',
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          zIndex: 81,
        }}>
        <AskPulse color={colors.accent} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('analysis.ask')}
          onPress={() => setOpen(!open)}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.accentFill,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} tintColor={colors.accentText} size={26} />
        </Pressable>
      </View>
    </>
  );
}

function AskPulse({ color }: { color: string }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    scale.value = withRepeat(withTiming(1.28, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [reduced, scale]);
  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : 0.45 * (1.35 - scale.value),
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function Thinking({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2].map((dot) => (
          <ThinkDot key={dot} delay={dot * 160} />
        ))}
      </View>
      <AppText variant="body" tone="muted">
        {label}
      </AppText>
    </View>
  );
}

function ThinkDot({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  const rise = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(() => {
      rise.value = withRepeat(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }), -1, true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, reduced, rise]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + rise.value * 0.65,
    transform: [{ translateY: -rise.value * 4 }],
  }));
  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6' }, style]} />;
}
