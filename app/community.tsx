import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { communityPosts } from '@/src/data/community';
import { teamById } from '@/src/data/teams';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, lift, radius, space } from '@/src/theme/tokens';
import { Card } from '@/src/ui/Card';
import { CostaRicaBoard } from '@/src/ui/CostaRicaBoard';
import { Helmet } from '@/src/ui/Helmet';
import { Avatar, ScreenHeader, Section } from '@/src/ui/Kit';
import { Screen } from '@/src/ui/Screen';
import { TypingDots } from '@/src/ui/TypingDots';
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
  { id: 'instagram', label: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
  { id: 'x', label: 'X', url: 'https://x.com', icon: 'x-twitter' },
  { id: 'facebook', label: 'Facebook', url: 'https://facebook.com', icon: 'facebook-f' },
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
  const { wide } = useBreakpoint();
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyIndex = useRef(0);
  const threadScroll = useRef<{ scrollToEnd: (options?: { animated?: boolean }) => void } | null>(null);
  const [draft, setDraft] = useState('');
  const [extra, setExtra] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<{ author: string; teamId: string } | null>(null);

  const samples: ChatMessage[] = communityPosts.map((post, index) => ({
    id: post.id,
    author: post.author,
    place: post.place,
    teamId: post.teamId,
    body: t(post.bodyKey),
    time: `18:${String(4 + index * 7).padStart(2, '0')}`,
  }));
  const messages = [...samples, ...extra];
  const quick = [t('app.quick1'), t('app.quick2'), t('app.quick3')];

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  /** Envía lo escrito (o una respuesta rápida). Alguien de la muestra "escribe" un momento y responde. */
  function send(text?: string) {
    const body = (text ?? draft).trim();
    if (!body || typing) return;
    setExtra((current) => [...current, { id: `me-${Date.now()}`, author: t('community.you'), body, mine: true, time: clock(i18n.language) }]);
    setDraft('');
    const speaker = communityPosts[replyIndex.current % communityPosts.length];
    const reply = t(replies[replyIndex.current % replies.length]);
    replyIndex.current += 1;
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setTyping({ author: speaker.author, teamId: speaker.teamId });
    replyTimer.current = setTimeout(() => {
      setTyping(null);
      setExtra((current) => [
        ...current,
        { id: `reply-${Date.now()}`, author: speaker.author, place: speaker.place, teamId: speaker.teamId, body: reply, time: clock(i18n.language) },
      ]);
    }, 1400);
  }

  const chat = (
    <Section title={t('app.chat')}>
      <Card style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg + 2, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row' }}>
            {communityPosts.slice(0, 3).map((post, index) => {
              const team = teamById(post.teamId);
              return team ? (
                <View key={post.id} style={{ marginLeft: index ? -10 : 0 }}>
                  <Helmet team={team} size={28} ring={colors.surface} />
                </View>
              ) : null;
            })}
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="label" numberOfLines={1}>
              {t('app.chatRoom')}
            </AppText>
            <AppText variant="caption" tone="muted" numberOfLines={1}>
              {typing ? t('app.typing', { name: typing.author }) : t('app.chatPeople', { count: communityPosts.length })}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success }} />
            <AppText variant="caption" style={{ fontFamily: fontFamily.semibold }}>
              {t('app.live')}
            </AppText>
          </View>
        </View>

        <ScrollView
          ref={threadScroll as never}
          style={{ height: 360 }}
          contentContainerStyle={{ gap: space.md, padding: space.lg + 2 }}
          onContentSizeChange={() => threadScroll.current?.scrollToEnd({ animated: true })}>
          {messages.map((message, index) => (
            <Bubble key={message.id} message={message} grouped={index > 0 && messages[index - 1].author === message.author} />
          ))}
          {typing ? <TypingBubble teamId={typing.teamId} /> : null}
        </ScrollView>

        <View style={{ gap: space.sm, padding: space.md, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
            {quick.map((text) => (
              <Pressable
                key={text}
                accessibilityRole="button"
                disabled={Boolean(typing)}
                onPress={() => send(text)}
                style={({ pressed }) => ({
                  minHeight: 36,
                  paddingHorizontal: 14,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                  justifyContent: 'center',
                  opacity: typing ? 0.4 : pressed ? 0.7 : 1,
                })}>
                <AppText variant="caption" style={{ fontFamily: fontFamily.semibold, fontSize: 13 }}>
                  {text}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
          <Composer draft={draft} setDraft={setDraft} send={() => send()} />
          <AppText variant="caption" tone="muted" style={{ paddingHorizontal: space.xs }}>
            {t('community.note')}
          </AppText>
        </View>
      </Card>
    </Section>
  );

  return (
    <Screen>
      <ScreenHeader
        title={t('app.quickCommunity')}
        subtitle={t('app.communitySubtitle')}
        trailing={
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {socials.map((item) => (
              <SocialButton key={item.id} item={item} />
            ))}
          </View>
        }
      />
      {/* Escritorio: mapa a todo el ancho y, debajo, ranking y chat lado a lado. */}
      {wide ? (
        <CostaRicaBoard aside={chat} />
      ) : (
        <>
          {chat}
          <CostaRicaBoard />
        </>
      )}
    </Screen>
  );
}

function SocialButton({ item }: { item: (typeof socials)[number] }) {
  const { colors, name } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={item.label}
      onPress={() => Linking.openURL(item.url)}
      style={({ pressed }) => [
        { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 },
        name === 'light' ? lift : { borderWidth: 1, borderColor: colors.border },
      ]}>
      <FontAwesome6 name={item.icon} iconStyle="brand" size={15} color={colors.text} />
    </Pressable>
  );
}

/** Burbuja de chat. Mensajes seguidos de la misma persona se agrupan sin repetir nombre ni insignia. */
function Bubble({ message, grouped = false }: { message: ChatMessage; grouped?: boolean }) {
  const { colors } = useAppTheme();
  const mine = Boolean(message.mine);
  const team = teamById(message.teamId);

  return (
    <View style={{ flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: space.sm, marginTop: grouped ? -space.sm : 0 }}>
      {mine ? null : grouped ? (
        <View style={{ width: 32 }} />
      ) : team ? (
        <Helmet team={team} size={32} />
      ) : (
        <Avatar label={message.author[0]} size={32} />
      )}
      <View style={{ flex: 1, alignItems: mine ? 'flex-end' : 'flex-start', gap: 4 }}>
        {mine || grouped ? null : (
          <AppText variant="caption" tone="muted">
            <AppText variant="caption" style={{ fontFamily: fontFamily.semibold, color: colors.text }}>
              {message.author}
            </AppText>
            {message.place ? ` · ${message.place}` : ''}
          </AppText>
        )}
        <View
          style={{
            maxWidth: '86%',
            backgroundColor: mine ? colors.accent : colors.surfaceElevated,
            paddingHorizontal: 14,
            paddingTop: 9,
            paddingBottom: 7,
            borderRadius: 20,
            borderBottomRightRadius: mine ? 6 : 20,
            borderBottomLeftRadius: mine ? 20 : 6,
            gap: 2,
          }}>
          <AppText variant="body" style={{ color: mine ? '#FFFFFF' : colors.text, fontSize: 15, lineHeight: 21 }}>
            {message.body}
          </AppText>
          {message.time ? (
            <AppText style={{ alignSelf: 'flex-end', fontSize: 10.5, lineHeight: 13, fontFamily: fontFamily.medium, color: mine ? 'rgba(255,255,255,0.72)' : colors.textMuted }}>
              {message.time}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** "Escribiendo…": la insignia de quien responde y tres puntos que laten. */
function TypingBubble({ teamId }: { teamId: string }) {
  const { colors } = useAppTheme();
  const team = teamById(teamId);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
      {team ? <Helmet team={team} size={32} /> : null}
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderBottomLeftRadius: 6, backgroundColor: colors.surfaceElevated }}>
        <TypingDots color={colors.textMuted} />
      </View>
    </View>
  );
}

function Composer({ draft, setDraft, send }: { draft: string; setDraft: (value: string) => void; send: () => void }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const ready = Boolean(draft.trim());
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: 4, paddingLeft: space.lg, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={t('community.placeholder')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('community.placeholder')}
        onSubmitEditing={send}
        style={{ flex: 1, minHeight: hitSize, color: colors.text, fontFamily: fontFamily.medium, fontSize: 15 }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('community.send')}
        accessibilityState={{ disabled: !ready }}
        onPress={send}
        style={{
          width: hitSize,
          height: hitSize,
          borderRadius: hitSize / 2,
          backgroundColor: ready ? colors.accent : colors.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <MaterialCommunityIcons name="arrow-up" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
