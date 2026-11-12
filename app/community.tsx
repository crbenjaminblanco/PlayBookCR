import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, TextInput, View, type ScrollViewInstance } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { communityPosts } from '@/src/data/community';
import { teamById } from '@/src/data/teams';
import { useSession } from '@/src/session/SessionProvider';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, radius, space } from '@/src/theme/tokens';
import { Helmet, InitialsBadge } from '@/src/ui/Helmet';
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
  { id: 'instagram', label: 'Instagram', url: 'https://instagram.com' },
  { id: 'x', label: 'X', url: 'https://x.com' },
  { id: 'facebook', label: 'Facebook', url: 'https://facebook.com' },
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
  const { pad } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyIndex = useRef(0);
  const favorite = teamById(auth?.teamId);
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

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

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
      <View
        style={{
          paddingHorizontal: pad,
          paddingVertical: space.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
        }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }} />
        <View style={{ flex: 1, gap: space.sm }}>
          <View>
            <AppText variant="heading">{t('community.title')}</AppText>
            <AppText variant="small" tone="muted">
              {t('community.live')}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm }}>
            <AppText variant="small" tone="muted" style={{ fontFamily: fontFamily.semibold }}>
              {t('community.social')}
            </AppText>
            {socials.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="link"
                onPress={() => Linking.openURL(item.url)}
                style={{
                  minHeight: 36,
                  paddingHorizontal: space.md,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                  justifyContent: 'center',
                }}>
                <AppText variant="small">{item.label}</AppText>
              </Pressable>
            ))}
          </View>
          <AppText variant="small" tone="muted">
            {t('community.socialNote')}
          </AppText>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
          paddingHorizontal: pad,
          paddingVertical: space.lg,
          gap: space.md,
        }}>
        {messages.map((message) => {
          const team = teamById(message.teamId);
          return (
            <View
              key={message.id}
              style={{
                flexDirection: message.mine ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: space.sm,
              }}>
              {message.mine ? (
                favorite ? (
                  <Helmet team={favorite} size={32} />
                ) : (
                  <InitialsBadge label="CR" color={colors.accent} size={32} />
                )
              ) : team ? (
                <Helmet team={team} size={32} />
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
                    backgroundColor: message.mine ? colors.accentFill : colors.surface,
                    borderWidth: message.mine ? 0 : 1,
                    borderColor: colors.border,
                    borderRadius: 18,
                    borderBottomRightRadius: message.mine ? 4 : 18,
                    borderBottomLeftRadius: message.mine ? 18 : 4,
                    paddingHorizontal: space.md,
                    paddingVertical: space.sm,
                  }}>
                  <AppText variant="body" tone={message.mine ? 'inverse' : 'default'}>
                    {message.body}
                  </AppText>
                </View>
                <AppText variant="small" tone="muted">
                  {message.time}
                </AppText>
              </View>
            </View>
          );
        })}
        {typing ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
            {teamById(typing.teamId) ? <Helmet team={teamById(typing.teamId)!} size={32} /> : null}
            <View style={{ maxWidth: '78%', gap: 4 }}>
              <AppText variant="small" tone="muted">
                {typing.author} · {typing.place}
              </AppText>
              <View style={{ backgroundColor: colors.surfaceElevated, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: space.md, paddingVertical: space.sm }}>
                <AppText variant="body">{typing.body || '···'}</AppText>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.sm,
          paddingHorizontal: pad,
        }}>
        <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
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
      </View>
    </View>
  );
}
