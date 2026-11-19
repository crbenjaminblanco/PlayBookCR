/**
 * Piezas compartidas de la app: encabezado de pantalla, secciones, filas de lista,
 * acciones rápidas, avatar, control segmentado y botón de icono.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/theme/ThemeProvider';
import { fontFamily, hitSize, lift, radius, space } from '@/src/theme/tokens';
import { AppText } from '@/src/ui/Text';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Título grande de pantalla con acción a la derecha, como en iOS. */
export function ScreenHeader({
  title,
  subtitle,
  back = false,
  trailing,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  trailing?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: space.md }}>
      {back ? <IconButton icon="chevron-left" label={t('app.back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.lg }}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="small" tone="muted">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {trailing}
      </View>
    </View>
  );
}

/** Título de sección con enlace opcional a la derecha ("Ver todo"). */
export function Section({
  title,
  action,
  onAction,
  children,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ gap: space.md }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 }}>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        {action && onAction ? (
          <Pressable accessibilityRole="link" onPress={onAction} hitSlop={10}>
            <AppText variant="small" tone="accent" style={{ fontFamily: fontFamily.semibold }}>
              {action}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** Botón redondo de icono, 44 px. */
export function IconButton({
  icon,
  label,
  onPress,
  tone = 'surface',
  size = hitSize,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  tone?: 'surface' | 'plain' | 'accent';
  size?: number;
}) {
  const { colors, name } = useAppTheme();
  const fill = tone === 'accent' ? colors.accentFill : tone === 'surface' ? colors.surface : 'transparent';
  const ink = tone === 'accent' ? colors.accentText : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fill,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        tone === 'surface' && name === 'light' ? lift : null,
      ]}>
      <MaterialCommunityIcons name={icon} size={Math.round(size * 0.48)} color={ink} />
    </Pressable>
  );
}

/** Círculo con icono y rótulo debajo. Fila de accesos rápidos del inicio. */
export function QuickAction({ icon, label, onPress, primary = false }: { icon: IconName; label: string; onPress: () => void; primary?: boolean }) {
  const { colors, name } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: space.sm, opacity: pressed ? 0.75 : 1 })}>
      <View
        style={[
          {
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: primary ? colors.accent : colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          },
          name === 'light' ? lift : { borderWidth: primary ? 0 : 1, borderColor: colors.border },
        ]}>
        <MaterialCommunityIcons name={icon} size={24} color={primary ? '#FFFFFF' : colors.text} />
      </View>
      <AppText variant="caption" numberOfLines={1} style={{ fontFamily: fontFamily.semibold }}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Fila de lista: elemento a la izquierda, dos líneas de texto y algo a la derecha. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  chevron = false,
  divider = true,
}: {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  divider?: boolean;
}) {
  const { colors } = useAppTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64, paddingVertical: space.md }}>
      {leading}
      <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
        <AppText variant="label" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 13, lineHeight: 18 }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing}
      {chevron ? <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} /> : null}
    </View>
  );
  const rule = divider ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null;
  if (!onPress) return <View style={rule}>{content}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [rule, { opacity: pressed ? 0.6 : 1 }]}>
      {content}
    </Pressable>
  );
}

/** Círculo tintado con un icono. Va a la izquierda de las filas de ajustes. */
export function IconTile({ icon, tint }: { icon: IconName; tint?: string }) {
  const { colors } = useAppTheme();
  const ink = tint ?? colors.accent;
  return (
    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name={icon} size={20} color={ink} />
    </View>
  );
}

/** Avatar circular con iniciales. */
export function Avatar({ label, size = 44, color, ink }: { label: string; size?: number; color?: string; ink?: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText style={{ fontFamily: fontFamily.bold, fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * 0.44), color: ink ?? colors.text }}>
        {label}
      </AppText>
    </View>
  );
}

/** Control segmentado tipo iOS. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  const { colors, name } = useAppTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.id)}
            style={[
              {
                flex: 1,
                minHeight: 38,
                borderRadius: radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: space.md,
                backgroundColor: active ? colors.surface : 'transparent',
              },
              active && name === 'light' ? { ...lift, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } : null,
            ]}>
            <AppText variant="small" style={{ fontFamily: fontFamily.semibold, color: active ? colors.text : colors.textMuted }}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Etiqueta pequeña de estado. */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' | 'success' | 'danger' }) {
  const { colors } = useAppTheme();
  const ink = { neutral: colors.textMuted, accent: colors.accent, success: colors.success, danger: colors.danger }[tone];
  return (
    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated }}>
      <AppText variant="caption" style={{ color: ink, fontFamily: fontFamily.semibold }}>
        {label}
      </AppText>
    </View>
  );
}
