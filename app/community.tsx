import { useEffect, useRef, useState } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { Linking, Platform, Pressable, ScrollView, TextInput, View, type ScrollViewInstance } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { communityPosts } from '@/src/data/community';
import { teamById } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, radius, space } from '@/src/theme/tokens';
import { CostaRicaBoard } from '@/src/ui/CostaRicaBoard';
import { Helmet, InitialsBadge } from '@/src/ui/Helmet';
import { Card } from '@/src/ui/Card';
import { AppText } from '@/src/ui/Text';
import { useBreakpoint } from '@/src/ui/useBreakpoint';

type ChatMessage = {
  id: string;
  author: string;
  place?: string;
  teamId?: string;
  body: string;
  mine?: boolean;
  time: string;
};

const socials = [
  { id: 'instagram', label: 'Instagram', url: 'https://instagram.com', icon: 'instagram', color: '#E1306C' },
  { id: 'x', label: 'X', url: 'https://x.com', icon: 'x-twitter', color: '#111827' },
  { id: 'facebook', label: 'Facebook', url: 'https://facebook.com', icon: 'facebook-f', color: '#1877F2' },
] as const;

const replies = ['community.reply1', 'community.reply2', 'community.reply3'] as const;

function clock(language: string) {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-CR', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
}

export default function CommunityScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const { auth } = useSession();
  const { wide } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyIndex = useRef(0);
  const favorite = teamById(auth?.teamId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [extra, setExtra] = useState<ChatMessage[]>([]);
  const samples: ChatMessage[] = communityPosts.map((post, index) => ({
    id: post.id,
    author: post.author,
    place: post.place,
    teamId: post.teamId,
    body: t(post.bodyKey),
    time: `${18}:${String(4 + index * 7).padStart(2, '0')}`,
  }));
  const messages = [...samples, ...extra];
  const latest = messages[messages.length - 1];

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [open, messages.length]);

  const [typing, setTyping] = useState<{ author: string; place: string; teamId?: string; body: string } | null>(null);

  function send() {
    const body = draft.trim();
    if (!body || typing) return;
    const mine: ChatMessage = {
      id: `me-${Date.now()}`,
      author: t('community.you'),
      teamId: favorite?.id,
      body,
      mine: true,
      time: clock(i18n.language),
    };
    setExtra((current) => [...current, mine]);
    setDraft('');
    const speaker = communityPosts[replyIndex.current % communityPosts.length];
    const reply = t(replies[replyIndex.current % replies.length]);
    replyIndex.current += 1;
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setTyping({ author: speaker.author, place: speaker.place, teamId: speaker.teamId, body: '' });
    let index = 0;
    replyTimer.current = setInterval(() => {
      index += 1;
      setTyping({ author: speaker.author, place: speaker.place, teamId: speaker.teamId, body: reply.slice(0, index) });
      if (index >= reply.length) {
        if (replyTimer.current) clearInterval(replyTimer.current);
        setTyping(null);
        setExtra((current) => [
          ...current,
          {
            id: `reply-${Date.now()}`,
            author: speaker.author,
            place: speaker.place,
            teamId: speaker.teamId,
            body: reply,
            time: clock(i18n.language),
          },
        ]);
      }
    }, 18) as unknown as ReturnType<typeof setTimeout>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
        <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center', alignItems: 'center', paddingHorizontal: wide ? 32 : 16, paddingTop: space.lg, gap: space.sm }}>
          <AppText variant="kicker" tone="accent" style={{ textAlign: 'center' }}>
            {t('community.social')}
          </AppText>
          <View style={{ flexDirection: 'row', gap: space.sm, width: '100%', maxWidth: 560, justifyContent: 'center' }}>
            {socials.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="link"
                accessibilityLabel={item.label}
                onPress={() => Linking.openURL(item.url)}
                style={{
                  flex: 1,
                  minHeight: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: space.sm,
                  paddingHorizontal: space.sm,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.surface,
                }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: item.color, alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesome6 name={item.icon} iconStyle="brand" size={13} color="#FFFFFF" />
                </View>
                <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
        <CostaRicaBoard />
      </ScrollView>

      {open ? null : (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('community.live')}
        onPress={() => setOpen(true)}
        style={{
          position: Platform.OS === 'web' ? 'fixed' : 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom + 12,
          zIndex: 40,
          maxWidth: 720,
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          minHeight: 56,
          paddingHorizontal: space.md,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surface,
        }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }} />
        <View style={{ flex: 1 }}>
          <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
            {t('community.live')}
          </AppText>
          <AppText variant="small" tone="muted" numberOfLines={1}>
            {latest ? `${latest.author}: ${latest.body}` : t('community.placeholder')}
          </AppText>
        </View>
      </Pressable>
      )}

      {open ? (
        <Pressable
          accessibilityLabel={t('home.close')}
          onPress={() => setOpen(false)}
          style={{
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(7,11,22,0.55)',
            zIndex: 70,
          }}
        />
      ) : null}
      {open ? (
        <View
          style={{
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            bottom: insets.bottom + 84,
            zIndex: 80,
            ...(wide ? { right: 16, width: 440 } : { left: 16, right: 16 }),
          }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }} />
                <AppText variant="heading">{t('community.live')}</AppText>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={t('home.close')} onPress={() => setOpen(false)} style={{ minWidth: hitSize, minHeight: hitSize, alignItems: 'center', justifyContent: 'center' }}>
                <AppText variant="heading" tone="muted">
                  ×
                </AppText>
              </Pressable>
            </View>
            <ScrollView
              ref={scrollRef}
              style={{ maxHeight: 360 }}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
              contentContainerStyle={{ gap: space.md }}>
              {messages.map((message) => {
                const team = teamById(message.teamId);
                return (
                  <View key={message.id} style={{ flexDirection: message.mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: space.sm }}>
                    {message.mine ? (
                      favorite ? (
                        <Helmet team={favorite} size={28} />
                      ) : (
                        <InitialsBadge label="CR" color={colors.accent} size={28} />
                      )
                    ) : team ? (
                      <Helmet team={team} size={28} />
                    ) : null}
                    <View style={{ maxWidth: '78%', gap: 4, alignItems: message.mine ? 'flex-end' : 'flex-start' }}>
                      {message.mine ? null : (
                        <AppText variant="small" tone="muted">
                          {message.author}
                          {message.place ? ` · ${message.place}` : ''}
                        </AppText>
                      )}
                      <View
                        style={{
                          backgroundColor: message.mine ? colors.accentFill : colors.bg,
                          borderRadius: 16,
                          borderBottomRightRadius: message.mine ? 4 : 16,
                          borderBottomLeftRadius: message.mine ? 16 : 4,
                          paddingHorizontal: space.md,
                          paddingVertical: space.sm,
                        }}>
                        <AppText variant="body" tone={message.mine ? 'inverse' : 'default'}>
                          {message.body}
                        </AppText>
                      </View>
                    </View>
                  </View>
                );
              })}
              {typing ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
                  {teamById(typing.teamId) ? <Helmet team={teamById(typing.teamId)!} size={28} /> : null}
                  <View style={{ maxWidth: '78%', gap: 4 }}>
                    <AppText variant="small" tone="muted">
                      {typing.author} · {typing.place}
                    </AppText>
                    <View style={{ backgroundColor: colors.bg, borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: space.md, paddingVertical: space.sm }}>
                      <AppText variant="body">{typing.body || '···'}</AppText>
                    </View>
                  </View>
                </View>
              ) : null}
            </ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={t('community.placeholder')}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={t('community.placeholder')}
                onSubmitEditing={send}
                style={{
                  flex: 1,
                  minHeight: hitSize,
                  borderWidth: 1.5,
                  borderColor: colors.borderStrong,
                  borderRadius: radius.pill,
                  paddingHorizontal: space.lg,
                  color: colors.text,
                  backgroundColor: colors.bg,
                  fontFamily: fontFamily.regular,
                  fontSize: 16,
                }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('community.send')}
                onPress={send}
                style={{
                  minHeight: hitSize,
                  paddingHorizontal: space.lg,
                  borderRadius: radius.pill,
                  backgroundColor: colors.accentFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: draft.trim() ? 1 : 0.45,
                }}>
                <AppText variant="small" tone="inverse" style={{ fontFamily: fontFamily.semibold }}>
                  {t('community.send')}
                </AppText>
              </Pressable>
            </View>
          </Card>
        </View>
      ) : null}
    </View>
  );
}
