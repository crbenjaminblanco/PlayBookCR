import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, TextInput, View, type ScrollViewInstance, type TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { streamGemini, type GeminiTurn } from '@/src/ai/gemini';
import { teamById } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, radius, space } from '@/src/theme/tokens';
import { AiMark } from '@/src/ui/AiMark';
import { IconButton } from '@/src/ui/Kit';
import { TypingDots } from '@/src/ui/TypingDots';
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
  const { auth } = useSession();
  const { wide } = useBreakpoint();
  const insets = useSafeAreaInsets();
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

  async function send(override?: string) {
    const text = (override ?? draft).trim();
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

  const sheet = !wide;
  const canSend = Boolean(draft.trim() || photo) && !busy;
  const myTeam = teamById(auth?.teamId);
  const suggestions = [
    myTeam ? t('app.askTeam', { team: myTeam.name }) : t('app.ask1'),
    t('app.ask2'),
    t('app.ask3'),
    t('app.ask4'),
  ];

  return (
    <>
      {open ? (
        <Pressable
          accessibilityLabel={t('home.close')}
          onPress={() => setOpen(false)}
          style={{ position: Platform.OS === 'web' ? 'fixed' : 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(11,19,36,0.45)', zIndex: 70 }}
        />
      ) : null}
      {open ? (
        <View
          accessibilityViewIsModal
          style={{
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            top: sheet ? insets.top + 40 : space.md,
            right: sheet ? 0 : space.md,
            bottom: sheet ? 0 : space.md,
            left: sheet ? 0 : undefined,
            zIndex: 80,
            width: sheet ? '100%' : 440,
            backgroundColor: colors.surface,
            borderRadius: radius.sheet,
            borderBottomLeftRadius: sheet ? 0 : radius.sheet,
            borderBottomRightRadius: sheet ? 0 : radius.sheet,
            paddingHorizontal: space.lg + 4,
            paddingTop: sheet ? space.md : space.lg + 4,
            paddingBottom: sheet ? insets.bottom + space.md : space.lg,
            gap: space.md,
            shadowColor: '#0B1324',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.12,
            shadowRadius: 32,
            elevation: 12,
          }}>
          {sheet ? <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong }} /> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <AiBadge size={40} />
            <View style={{ flex: 1 }}>
              <AppText variant="heading">{t('analysis.chatTitle')}</AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {busy ? t('analysis.thinking') : t('app.aiOnline')}
              </AppText>
            </View>
            {turns.length ? (
              <IconButton
                icon="square-edit-outline"
                label={t('app.newChat')}
                tone="plain"
                onPress={() => {
                  if (busy) return;
                  setTurns([]);
                  setError(null);
                }}
              />
            ) : null}
            <IconButton icon="close" label={t('home.close')} tone="plain" onPress={() => setOpen(false)} />
          </View>
          <ScrollView ref={threadRef} style={{ flex: 1 }} onContentSizeChange={followThread} contentContainerStyle={{ gap: space.md, paddingVertical: space.sm, flexGrow: 1 }}>
            {turns.length === 0 ? <Welcome suggestions={suggestions} onPick={(text) => send(text)} /> : null}
            {turns.map((turn, index) => {
              const mine = turn.role === 'user';
              const waiting = !mine && !turn.text && busy;
              return (
                <View key={`${turn.role}-${index}`} style={{ flexDirection: 'row', justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: space.sm }}>
                  {mine ? null : <AiBadge size={28} />}
                  <View
                    style={{
                      maxWidth: '84%',
                      backgroundColor: mine ? colors.accent : colors.surfaceElevated,
                      borderRadius: 20,
                      borderBottomRightRadius: mine ? 6 : 20,
                      borderBottomLeftRadius: mine ? 20 : 6,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      gap: space.xs,
                    }}>
                    {turn.image ? (
                      <AppText variant="caption" style={{ color: mine ? 'rgba(255,255,255,0.8)' : colors.textMuted }}>
                        {t('analysis.photoAttached')}
                      </AppText>
                    ) : null}
                    {mine ? (
                      <AppText variant="body" style={{ color: '#FFFFFF', fontSize: 15, lineHeight: 22 }}>
                        {turn.text}
                      </AppText>
                    ) : waiting ? (
                      <TypingDots color={colors.textMuted} />
                    ) : (
                      <AnswerText text={turn.text} />
                    )}
                  </View>
                </View>
              );
            })}
            {error ? (
              <AppText variant="small" tone="danger">
                {error}
              </AppText>
            ) : null}
          </ScrollView>
          {photo ? (
            <AppText variant="caption" tone="accent">
              {t('analysis.photoReady')}
            </AppText>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, padding: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
            {Platform.OS === 'web' ? (
              <IconButton
                icon="camera-outline"
                label={t('analysis.photo')}
                tone="plain"
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
            ) : (
              <View style={{ width: space.md }} />
            )}
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t('analysis.placeholder')}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel={t('analysis.placeholder')}
              onSubmitEditing={() => send()}
              style={{ flex: 1, minHeight: hitSize, color: colors.text, fontFamily: fontFamily.medium, fontSize: 15 }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('analysis.send')}
              accessibilityState={{ disabled: !canSend }}
              disabled={!canSend}
              onPress={() => send()}
              style={{ width: hitSize, height: hitSize, borderRadius: hitSize / 2, backgroundColor: canSend ? colors.accent : colors.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="arrow-up" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : null}
    </>
  );
}

/** Insignia de la IA: círculo cobalto con el balón animado. */
function AiBadge({ size }: { size: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
      <AiMark size={size * 0.56} />
    </View>
  );
}

/** Pantalla inicial del asistente: qué puede hacer y preguntas listas para tocar. */
function Welcome({ suggestions, onPick }: { suggestions: string[]; onPick: (text: string) => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', gap: space.lg, paddingTop: space.lg }}>
      <View style={{ alignItems: 'center', gap: space.md }}>
        <AiBadge size={64} />
        <AppText variant="title" style={{ textAlign: 'center', fontSize: 22, lineHeight: 28 }}>
          {t('app.aiWelcome')}
        </AppText>
        <AppText variant="small" tone="muted" style={{ textAlign: 'center', maxWidth: 320 }}>
          {t('analysis.chatHint')}
        </AppText>
      </View>
      <View style={{ gap: space.sm }}>
        {suggestions.map((text) => (
          <Pressable
            key={text}
            accessibilityRole="button"
            onPress={() => onPick(text)}
            style={({ pressed }) => ({
              minHeight: 52,
              paddingHorizontal: space.lg,
              borderRadius: radius.control + 4,
              backgroundColor: pressed ? colors.borderStrong : colors.surfaceElevated,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.sm,
            })}>
            <MaterialCommunityIcons name="star-four-points" size={15} color={colors.accent} />
            <AppText variant="small" style={{ flex: 1, fontFamily: fontFamily.semibold }}>
              {text}
            </AppText>
            <MaterialCommunityIcons name="arrow-top-right" size={17} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
