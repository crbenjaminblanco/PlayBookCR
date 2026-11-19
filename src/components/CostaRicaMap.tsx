import { Platform, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { leadingShare, teamFans, type ProvinceFanbase, type ProvinceId } from '@/src/data/provinces';
import { teamById } from '@/src/data/teams';
import { mapViewBox, provincePaths } from '@/src/data/mapPaths';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { Helmet } from '@/src/ui/Helmet';

/**
 * Punto más interior de cada provincia (polo de inaccesibilidad de su contorno principal),
 * en coordenadas del viewBox. Ahí va la insignia, lejos de los bordes.
 */
const anchors: Record<ProvinceId, { x: number; y: number }> = {
  Alajuela: { x: 158, y: 76 },
  Cartago: { x: 237, y: 154 },
  Guanacaste: { x: 50, y: 109 },
  Heredia: { x: 205, y: 82 },
  Limón: { x: 288, y: 168 },
  Puntarenas: { x: 279, y: 232 },
  'San José': { x: 239, y: 193 },
};

function channel(hex: string, index: number) {
  return parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
}

/** Mezcla dos colores hex: t = 0 da el primero, t = 1 el segundo. */
export function mixColor(from: string, to: string, t: number) {
  const mix = (index: number) => Math.round(channel(from, index) + (channel(to, index) - channel(from, index)) * t);
  return `#${[0, 1, 2].map((index) => mix(index).toString(16).padStart(2, '0')).join('')}`;
}

type Props = {
  provinces: ProvinceFanbase[];
  selectedId: ProvinceId | null;
  onSelect: (id: ProvinceId) => void;
  width: number;
  /** Con equipo, la intensidad es la afición de ese equipo; sin equipo, la afición total. */
  teamId?: string | null;
  /** Provincia bajo el cursor. No cambia la selección: solo la resalta. */
  hoveredId?: ProvinceId | null;
  onHover?: (id: ProvinceId | null) => void;
};

/**
 * Mapa de intensidad: cada provincia en la escala cobalto de la app según su afición,
 * con la insignia del equipo líder (o del equipo filtrado) encima para leerlo sin leyenda de colores.
 */
export function CostaRicaMap({ provinces, selectedId, onSelect, width, teamId = null, hoveredId = null, onHover }: Props) {
  const { colors } = useAppTheme();
  const height = width * (mapViewBox.height / mapViewBox.width);
  const byId = new Map(provinces.map((province) => [province.id, province]));
  const filterTeam = teamById(teamId);
  const values = provinces.map((province) => teamFans(province, teamId));
  const peak = Math.max(...values, 1);
  const floor = Math.min(...values);
  const scale = width / mapViewBox.width;
  const marker = width < 340 ? 24 : 28;

  // Resumen en texto del mapa: lo que lee un lector de pantalla en lugar de los colores.
  const summary = provinces
    .map((province) => {
      const leader = teamById(leadingShare(province).teamId);
      return `${province.id}: ${teamFans(province, teamId)}${filterTeam ? '' : leader ? `, ${leader.name}` : ''}`;
    })
    .join('; ');

  return (
    <View
      style={{ width, height }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
      {...(Platform.OS === 'web' ? ({ onMouseLeave: () => onHover?.(null) } as object) : {})}>
      <Svg width={width} height={height} viewBox={`0 0 ${mapViewBox.width} ${mapViewBox.height}`}>
        {provincePaths.map((shape) => {
          const province = byId.get(shape.id);
          const fans = province ? teamFans(province, teamId) : 0;
          // Escala relativa entre la provincia con menos y la con más, para que se lean las diferencias.
          const level = peak === floor ? 1 : (fans - floor) / (peak - floor);
          const active = shape.id === selectedId;
          const hot = shape.id === hoveredId;
          const select = () => onSelect(shape.id);
          return (
            <Path
              key={shape.id}
              d={shape.d}
              fill={mixColor(colors.mapLow, colors.mapHigh, hot || active ? Math.min(1, 0.42 + level * 0.58) : 0.18 + level * 0.82)}
              stroke={active ? colors.text : hot ? colors.accent : colors.surface}
              strokeWidth={active ? 3.2 : hot ? 2.6 : 1.6}
              strokeLinejoin="round"
              accessibilityLabel={shape.id}
              onPress={select}
              {...(Platform.OS === 'web'
                ? {
                    onClick: select,
                    onMouseEnter: () => onHover?.(shape.id),
                    style: { cursor: 'pointer', transition: 'fill 180ms ease-out, stroke 180ms ease-out, stroke-width 180ms ease-out' },
                  }
                : null)}
            />
          );
        })}
      </Svg>
      {provincePaths.map((shape) => {
        const province = byId.get(shape.id);
        if (!province) return null;
        const team = filterTeam ?? teamById(leadingShare(province).teamId);
        if (!team) return null;
        const point = anchors[shape.id];
        const active = shape.id === selectedId;
        const hot = shape.id === hoveredId;
        const size = active ? marker + 8 : hot ? marker + 4 : marker;
        return (
          <View
            key={shape.id}
            pointerEvents="none"
            style={{ position: 'absolute', left: point.x * scale - size / 2, top: point.y * scale - size / 2 }}>
            <Helmet team={team} size={size} ring={active ? colors.text : hot ? colors.accent : colors.surface} />
          </View>
        );
      })}
    </View>
  );
}
