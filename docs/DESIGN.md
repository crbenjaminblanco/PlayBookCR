# Sistema visual

Dirección: app móvil moderna, clara y confiable, en la línea de las apps financieras actuales (referencia: el caso Payno de Orbix Studio). Fondo gris azulado aireado, tarjetas blancas con elevación suave, tinta azul marina y un solo acento cobalto. Los colores de los equipos NFL solo aparecen en sus insignias y en sus barras de afición, nunca como fondo de la app.

Los colores viven en un archivo por tema. Claro es el tema por defecto.

- Claro: [src/theme/colors/light.ts](../src/theme/colors/light.ts) — fondo `#F2F4F8`, superficie `#FFFFFF`, texto `#0B1324`, acento `#2350F5`
- Oscuro: [src/theme/colors/dark.ts](../src/theme/colors/dark.ts) — fondo `#080C15`, superficie `#121826`, texto `#F3F5FA`, acento `#7891FF`

Espacio, radios, barra de pestañas, elevación (`lift`) y la tarjeta oscura (`hero`) están en [src/theme/tokens.ts](../src/theme/tokens.ts). Las pantallas leen el tema activo; no declaran hex propios, salvo el blanco sobre el acento.

## Marca

El logo es una P trazada como ruta de un diagrama de playbook, con la "O" del jugador en cobalto dentro de su hueco ([src/ui/Brand.tsx](../src/ui/Brand.tsx), favicon en [public/brand-mark.svg](../public/brand-mark.svg)). El cuadro es marino en claro y marino más claro con filete en oscuro. El nombre va en Plus Jakarta Sans 800 con "CR" en el acento.

El hero de Inicio lleva el enjambre de drones ([src/ui/DroneBall.tsx](../src/ui/DroneBall.tsx)) formando un balón que gira arriba a la derecha, en blanco con uno de cada siete drones en cobalto claro. Solo se anima en web y respeta el movimiento reducido.

## Inicio

El inicio es para la jornada que viene. Primero el hero, con el partido de la persona (o el duelo más parejo si no tiene equipo) y una sola acción principal, "Ver la lectura"; sin equipo, la segunda es "Elija su equipo". Justo debajo va la barra de marcadores ([src/ui/ScoreTicker.tsx](../src/ui/ScoreTicker.tsx)) como información secundaria: la etiqueta "Finales · Sem. 10" queda fija y los resultados desfilan en bucle; se pausa al pasar el puntero y, con movimiento reducido, se desliza a mano. Tocarla abre la semana 10 en Partidos. Después, más partidos de la semana (sin repetir el del hero; cada fila abre su lectura) y la afición.

El inicio no repite la barra de pestañas: no hay fila de accesos rápidos, y "Preguntar a la IA" vive solo en el botón central de la barra.

Partidos tiene un selector de jornada en el encabezado: semana 11 (próximos, con lecturas) y semana 10 (resultados finales).

## Tipografía

**Plus Jakarta Sans** en toda la app, pesos 400 a 800.

- `display` 32/38 y `title` 26/32: 700, tracking negativo
- `heading` 18/24: 700
- `label` 15/20: 600, para nombres en filas y botones
- `body` 16/24, `small` 14/20, `caption` 12/16
- `stat`: 800 con cifras de tabla, para el número protagonista

No se usan sobretítulos ni etiquetas encima de un título.

## Piezas

Todas en [src/ui/Kit.tsx](../src/ui/Kit.tsx), además de `Button`, `Card`, `Screen` y `Match`.

- `ScreenHeader`: título grande de pantalla, con atrás y acción opcional
- `Section`: título de sección con enlace "Ver todo"
- `QuickAction`: círculo de 58 px con icono y rótulo
- `ListRow`: fila con elemento a la izquierda, dos líneas y chevron
- `Segmented`: control segmentado tipo iOS
- `Badge`, `Avatar`, `IconButton`, `IconTile`
- `MatchRow` y `PairMark`: partido con las dos insignias superpuestas

## Superficies

- Tarjetas: radio 24, sin borde en claro y con sombra suave; en oscuro, filete de 1 px y sin sombra.
- Hojas (asistente, membresía): radio 28 y tirador arriba en teléfono.
- Controles: píldora (botones, búsqueda, chat, segmentados).
- La tarjeta de la semana y la de membresía son marino profundo con un brillo cobalto. Son iguales en ambos temas.

## Acciones

Una primaria por pantalla: píldora rellena con `accentFill` (tinta en claro, blanco en oscuro). La de IA y la del chat usan el acento cobalto. La secundaria es una píldora con contorno.

## Navegación

- Teléfono: barra de pestañas flotante en dos piezas. Una píldora marina con las cuatro secciones, donde la activa se abre en blanco con su nombre, y aparte un botón redondo cobalto para la IA. No aparece en bienvenida ni en elegir equipo.
- La IA se reconoce por su marca ([src/ui/AiMark.tsx](../src/ui/AiMark.tsx)): un balón de la NFL que se mece con chispas que titilan. Va en el botón de la barra, en el encabezado del asistente y como avatar de sus respuestas.
- En el inicio del teléfono, arriba a la derecha solo va "Cuenta"; tema, idioma y equipo se configuran ahí.
- Escritorio (desde 960 px): barra superior con las pestañas en un control segmentado y el perfil a la derecha.
- Perfil se abre desde el avatar del inicio o desde la barra superior.

## Web

`app/+html.tsx` tematiza la selección, el cursor, el anillo de foco y las barras de desplazamiento con el cobalto.

## Escala

- Espacio: 4, 8, 12, 16, 24, 32, 48
- Área táctil mínima: 44 px
- Ancho de contenido: 560 en teléfono y tableta, 1180 en escritorio
- Movimiento: 160–260 ms, sin rebote; pulsar escala a 0.97–0.98

## Contraste

Pendiente de medir con WCAG 2.x sobre estos tokens. Objetivo: 4.5:1 para texto y 3:1 para bordes de controles.

## Estados

Inicio, Partidos y Tienda comparten carga, vacío y error (`StateMessage`). El vacío aparece en la tienda cuando la búsqueda no encuentra productos.
