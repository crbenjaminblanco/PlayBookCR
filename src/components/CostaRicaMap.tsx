import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { leadingShare, teamFans, type ProvinceFanbase, type ProvinceId } from '@/src/data/provinces';
import { teamById } from '@/src/data/teams';
import { mapViewBox, provincePaths } from '@/src/data/mapPaths';
import { readableTeamColor } from '@/src/ui/teamColor';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { hitSize, radius, space } from '@/src/theme/tokens';
import { ShareList } from '@/src/ui/ShareList';
import { AppText } from '@/src/ui/Text';

type Measurable = {
  measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) => void;
};

const anchors: Record<ProvinceId, { x: number; y: number }> = {
  Guanacaste: { x: 48, y: 78 },
  Alajuela: { x: 128, y: 72 },
  Heredia: { x: 214, y: 92 },
  Limón: { x: 292, y: 150 },
  Cartago: { x: 232, y: 156 },
  'San José': { x: 188, y: 168 },
  Puntarenas: { x: 168, y: 230 },
};

type Props = {
  provinces: ProvinceFanbase[];
  selectedId: ProvinceId | null;
  openId: ProvinceId | null;
  onOpen: (id: ProvinceId) => void;
  onClose: () => void;
  onSelect: (id: ProvinceId) => void;
  width: number;
  favoriteId?: string | null;
  teamId?: string | null;
};

export function CostaRicaMap({
  provinces,
  selectedId,
  openId,
  onOpen,
  onClose,
  onSelect,
  width,
  favoriteId,
  teamId = null,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const height = width * (mapViewBox.height / mapViewBox.width);
  const { width: screenW, height: screenH } = useWindowDimensions();
  const hostRef = useRef<Measurable | null>(null);
  const [origin, setOrigin] = useState({ x: 16, y: 120, w: width, h: height });

  const byId = useMemo(() => new Map(provinces.map((province) => [province.id, province])), [provinces]);
  const filterTeam = teamById(teamId);
  const filterColor = filterTeam ? readableTeamColor(filterTeam.color) : null;
  const peak = useMemo(() => {
    if (!teamId) return 1;
    return Math.max(...provinces.map((province) => teamFans(province, teamId)), 1);
  }, [provinces, teamId]);
  const opened = openId ? byId.get(openId) : undefined;
  const tip = openId ? anchors[openId] : null;
  const narrow = screenW < 720;
  const panelWidth = narrow ? Math.min(420, screenW - 32) : Math.min(280, Math.max(220, origin.w - 16));
  const panelMaxHeight = Math.max(220, Math.min(420, screenH - 140));
  const anchorX = tip ? origin.x + (tip.x / mapViewBox.width) * origin.w : origin.x;
  const anchorY = tip ? origin.y + (tip.y / mapViewBox.height) * origin.h : origin.y;
  const panelLeft = narrow
    ? Math.max(16, (screenW - panelWidth) / 2)
    : Math.max(16, Math.min(anchorX + 16, screenW - panelWidth - 16));
  const panelTop = narrow
    ? Math.max(88, Math.min(origin.y + 24, screenH - panelMaxHeight - 16))
    : Math.max(88, Math.min(anchorY - 12, screenH - panelMaxHeight - 16));

  useEffect(() => {
    if (!openId) return;
    hostRef.current?.measureInWindow((x, y, w, h) => setOrigin({ x, y, w, h }));
  }, [openId, width, height, screenW, screenH]);

  return (
    <View
      ref={(node) => {
        hostRef.current = node as Measurable | null;
      }}
      onLayout={() => {
        hostRef.current?.measureInWindow((x, y, w, h) => setOrigin({ x, y, w, h }));
      }}
      style={{ width, height, position: 'relative', zIndex: 22, cursor: Platform.OS === 'web' ? 'pointer' : undefined }}>
      <Svg width={width} height={height} viewBox={`0 0 ${mapViewBox.width} ${mapViewBox.height}`}>
        {provincePaths.map((shape) => {
          const province = byId.get(shape.id);
          const leader = province ? teamById(leadingShare(province).teamId) : undefined;
          const fans = province ? teamFans(province, teamId ?? null) : 0;
          const fill = filterColor ?? (leader ? readableTeamColor(leader.color) : colors.surfaceElevated);
          const fillOpacity = filterColor ? (fans === 0 ? 0.18 : 0.4 + 0.6 * (fans / peak)) : 1;
          const active = shape.id === openId || shape.id === selectedId;
          const handlers =
            Platform.OS === 'web'
              ? {
                  onMouseEnter: () => onOpen(shape.id),
                  onClick: () => {
                    onOpen(shape.id);
                    onSelect(shape.id);
                  },
                }
              : {
                  onPress: () => {
                    onOpen(shape.id);
                    onSelect(shape.id);
                  },
                };
          return (
            <Path
              key={shape.id}
              d={shape.d}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={active ? colors.text : 'rgba(244,247,251,0.55)'}
              strokeWidth={active ? 2.6 : 1.4}
              accessibilityLabel={shape.id}
              {...handlers}
            />
          );
        })}
      </Svg>
      {opened && tip ? (
        <View
          style={{
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            zIndex: 35,
            left: Platform.OS === 'web' ? panelLeft : 8,
            top: Platform.OS === 'web' ? panelTop : 8,
            width: Platform.OS === 'web' ? panelWidth : width - 16,
            maxHeight: panelMaxHeight,
            backgroundColor: colors.surface,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            padding: space.md,
            gap: space.sm,
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
            <AppText variant="heading" style={{ flex: 1 }}>
              {opened.id}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.close')}
              onPress={onClose}
              style={{
                minWidth: hitSize,
                minHeight: hitSize,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppText variant="heading" tone="muted">
                ×
              </AppText>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: panelMaxHeight - 72 }} keyboardShouldPersistTaps="handled">
            <ShareList key={opened.id} shares={opened.shares} favoriteId={favoriteId} compact />
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
