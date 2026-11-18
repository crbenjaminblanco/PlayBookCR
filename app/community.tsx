import { useEffect, useRef, useState } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { communityPosts } from '@/src/data/community';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, space } from '@/src/theme/tokens';
import { CostaRicaBoard } from '@/src/ui/CostaRicaBoard';
import { Screen } from '@/src/ui/Screen';
import { Stage } from '@/src/ui/Stage';
import { AppText } from '@/src/ui/Text';

type ChatMessage = {
  id: string;
  author: string;
  place?: string;
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
  const { colors, name } = useAppTheme();
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyIndex = useRef(0);
  const threadScroll = useRef<{ scrollToEnd: (options?: { animated?: boolean }) => void } | null>(null);
  const [draft, setDraft] = useState('');
  const [threadOpen, setThreadOpen] = useState(false);
  const [extra, setExtra] = useState<ChatMessage[]>([]);
  const samples: ChatMessage[] = communityPosts.map((post, index) => ({
    id: post.id,
    author: post.author,
    place: post.place,
    body: t(post.bodyKey),
    time: `${18}:${String(4 + index * 7).padStart(2, '0')}`,
  }));
  const messages = [...samples, ...extra];
  const latest = messages.slice(-3);
  const [typing, setTyping] = useState<{ author: string; place: string; body: string } | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  function send() {
    const body = draft.trim();
    if (!body || typing) return;
    const mine: ChatMessage = {
      id: `me-${Date.now()}`,
      author: t('community.you'),
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
    setTyping({ author: speaker.author, place: speaker.place, body: '' });
    let index = 0;
    replyTimer.current = setInterval(() => {
      index += 1;
      setTyping({ author: speaker.author, place: speaker.place, body: reply.slice(0, index) });
      if (index >= reply.length) {
        if (replyTimer.current) clearInterval(replyTimer.current);
        setTyping(null);
        setExtra((current) => [
          ...current,
          {
            id: `reply-${Date.now()}`,
            author: speaker.author,
            place: speaker.place,
            body: reply,
            time: clock(i18n.language),
          },
        ]);
      }
    }, 18) as unknown as ReturnType<typeof setTimeout>;
  }

  return (
    <Screen>
      <Stage kicker={t('home.kicker')} title={t('home.title')}>
        <AppText variant="body" tone="muted" style={{ maxWidth: 640 }}>
          {t('home.subtitle')}
        </AppText>
        <View style={{ gap: space.sm, maxWidth: 640 }}>
          <AppText variant="kicker" tone="accent">
            {t('community.social')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {socials.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="link"
                accessibilityLabel={item.label}
                onPress={() => Linking.openURL(item.url)}
                style={{
                  flexGrow: 1,
                  flexBasis: 140,
                  minHeight: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: space.sm,
                  paddingHorizontal: space.sm,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: 'transparent',
                }}>
                <FontAwesome6 name={item.icon} iconStyle="brand" size={14} color={colors.text} />
                {item.id === 'x' ? null : (
                  <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
                    {item.label}
                  </AppText>
                )}
              </Pressable>
            ))}
          </View>
        </View>
        <View
          style={{
            width: '100%',
            alignSelf: 'stretch',
            borderRadius: 16,
            backgroundColor: name === 'dark' ? '#141414' : '#FFFFFF',
            padding: space.lg,
            gap: space.md,
            boxShadow: name === 'dark' ? '0 16px 40px rgba(0,0,0,0.4)' : '0 14px 36px rgba(20,16,10,0.06)',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text }} />
              <AppText variant="heading">{t('community.live')}</AppText>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setThreadOpen((open) => !open)} style={{ minHeight: 44, justifyContent: 'center' }}>
              <AppText variant="small" style={{ fontFamily: fontFamily.semibold }}>
                {threadOpen ? t('home.showLess') : t('community.thread')}
              </AppText>
            </Pressable>
          </View>
          <ScrollView
            ref={threadScroll as never}
            scrollEnabled={threadOpen}
            style={{ maxHeight: threadOpen ? 480 : undefined }}
            contentContainerStyle={{ gap: space.sm }}
            onContentSizeChange={() => {
              if (threadOpen) threadScroll.current?.scrollToEnd({ animated: false });
            }}>
            {(threadOpen ? messages : latest).map((message) => (
              <Bubble key={message.id} message={message} />
            ))}
            {typing ? <Bubble message={{ id: 'typing', author: typing.author, place: typing.place, body: typing.body || '···', time: '' }} /> : null}
          </ScrollView>
          <Composer draft={draft} setDraft={setDraft} send={send} />
        </View>
        <CostaRicaBoard embedded showHeading={false} />
      </Stage>
    </Screen>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const { colors, name } = useAppTheme();
  const mine = Boolean(message.mine);
  const fill = mine ? (name === 'dark' ? '#F5F5F5' : '#171717') : name === 'dark' ? '#000000' : '#F3F1EC';
  const ink = mine ? (name === 'dark' ? '#111111' : '#FFFFFF') : colors.text;
  return (
    <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', gap: 4 }}>
      <AppText variant="small" tone="muted">
        {message.author}
        {message.place ? ` · ${message.place}` : ''}
        {message.time ? ` · ${message.time}` : ''}
      </AppText>
      <View
        style={{
          maxWidth: '82%',
          backgroundColor: fill,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 16,
          borderBottomRightRadius: mine ? 4 : 16,
          borderBottomLeftRadius: mine ? 16 : 4,
        }}>
        <AppText variant="body" style={{ color: ink, fontSize: 15, lineHeight: 22 }}>
          {message.body}
        </AppText>
      </View>
    </View>
  );
}

function Composer({
  draft,
  setDraft,
  send,
}: {
  draft: string;
  setDraft: (value: string) => void;
  send: () => void;
}) {
  const { t } = useTranslation();
  const { colors, name } = useAppTheme();
  return (
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
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          paddingHorizontal: space.lg,
          color: colors.text,
          backgroundColor: name === 'dark' ? '#000000' : '#F7F7F5',
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
          borderRadius: 16,
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
  );
}
