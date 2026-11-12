# Sistema visual

Dirección: estadio de noche, claro y sobrio. Un solo acento Caribe. Los colores de los equipos NFL solo aparecen en la marca del equipo (el recuadro con las siglas), nunca como fondo de la app. El azul, blanco y rojo de la bandera tampoco se usan como cromo, para que no compitan con los equipos.

Los colores de interfaz viven en un archivo por tema:

- Oscuro: [src/theme/colors/dark.ts](../src/theme/colors/dark.ts)
- Claro: [src/theme/colors/light.ts](../src/theme/colors/light.ts)

Espacio, radio, tipografía y anchos están en [src/theme/tokens.ts](../src/theme/tokens.ts). Las pantallas leen el tema activo; no declaran hex propios.

## Tipografía

**Barlow** para la interfaz y **Barlow Semi Condensed** solo para cifras grandes (porcentajes y estadísticas).

Barlow es una grotesca de interfaz con una postura un poco ancha, pensada para leerse en tamaños chicos y con números estables. Semi Condensed acerca las cifras a un marcador sin abrir una segunda voz de marca. Los títulos de sección usan Barlow en peso 700.

Pesos cargados:

- Barlow 400, 500, 600 y 700
- Barlow Semi Condensed 700 para `fontFamily.stat`

Los números de estadísticas usan `fontVariant: ['tabular-nums']`.

## Contraste

Medido con la fórmula WCAG 2.x. El texto corrido busca 4.5:1. Bordes de campos y controles buscan 3:1 contra la superficie.

Tema oscuro:

- Texto `#F4F7FB` sobre fondo `#0B1220`: 17.42:1
- Texto secundario `#A8B3C7` sobre fondo `#0B1220`: 8.86:1; sobre superficie `#141C2F`: 8.03:1
- Texto de acento `#06281C` sobre `#2EE6A6`: 9.78:1
- Texto `#06281C` sobre éxito `#3DDC97`: 8.95:1; sobre aviso `#F5C16C`: 9.58:1; sobre error `#FF6B6B`: 5.70:1; sobre info `#7EB6FF`: 7.55:1
- Borde de campo `#627490` sobre superficie `#141C2F`: 3.57:1

Tema claro:

- Texto `#0E1525` sobre fondo `#F6F7FB`: 17.02:1; sobre superficie `#FFFFFF`: 18.22:1
- Texto secundario `#4E5D76` sobre fondo `#F6F7FB`: 6.22:1
- Texto de acento `#02140C` sobre `#0F8F68`: 4.65:1
- Borde de campo `#6E7C93` sobre `#FFFFFF`: 4.23:1

El borde decorativo de tarjetas puede ser más suave. El borde que define un campo usa `borderStrong`.

## Escala

- Espacio: 4, 8, 12, 16, 24, 32, 48
- Radio: 12 tarjetas, 16 hojas, píldora solo en filtros
- Área táctil mínima: 44 px
- Movimiento: 150–220 ms, sin rebote. El contenido entra una vez al terminar la carga

Una acción primaria por pantalla, en acento con `accentText`. La secundaria va en contorno, con el color de texto, sin un segundo color de marca.

## Responsive

- Menos de 720 px: columna, ancho máximo 480, tienda en 1 columna, equipos en 2
- Desde 720 px: ancho máximo 960, equipos en 3, tienda en 2
- Desde 960 px: equipos en 4, tienda en 3, inicio con mapa y leyenda en fila, bienvenida con relato a la izquierda y acceso a la derecha, análisis con estadísticas y lecturas en fila

## Mapa

La provincia con mayor porcentaje líder usa el acento del tema. El resto usa una escala de un solo verde (`mapLow`, `mapMid`, `mapHigh`). Al tocar una provincia, el detalle y las barras quedan debajo del mapa en teléfono y a la derecha desde 960 px.

## Estados

Inicio, Análisis y Tienda comparten carga, vacío y error. La carga es una espera corta de los datos de demostración. El vacío aparece en la tienda cuando la búsqueda no encuentra productos, y en análisis si no hay equipo. El error muestra la misma pieza con reintento.
