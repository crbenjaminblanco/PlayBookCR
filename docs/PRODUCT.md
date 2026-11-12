# PlayBookCR

PlayBookCR es la casa de la NFL en Costa Rica. Sirve para ver qué equipos siguen en cada provincia, leer estadísticas y recibir lecturas de quiniela o fantasy. La app funciona en la web desde el primer día y está hecha en Expo para poder publicarse después en iOS y Android con el mismo código.

## Para quién

Aficionados en Costa Rica que quieren un lugar claro para seguir la NFL, armar su quiniela con amigos o tomar decisiones de fantasy con una explicación al lado del número.

## Promesas

- **Identidad local.** El inicio es un mapa de las siete provincias. Cada provincia muestra el equipo que lidera la afición y el porcentaje. Al entrar, la persona elige su equipo favorito.
- **Análisis útil.** La pestaña de análisis muestra estadísticas y tres lecturas (quiniela, titular de fantasy y banca). En esta versión salen de reglas sobre datos de demostración, con la misma forma de pantalla que después ocupará un modelo.
- **Confianza.** Se puede entrar con un correo de demostración o como invitado. La tienda está separada del análisis. Las lecturas llevan un aviso de que son informativas.

## Idiomas

Español por defecto e inglés. Los textos viven en `src/i18n/es.ts` y `src/i18n/en.ts`. El idioma del dispositivo se usa la primera vez y luego se recuerda junto con el tema.

## Recorrido

1. Bienvenida: entrar o continuar como invitado.
2. Elegir equipo favorito. Se puede cambiar después desde Perfil.
3. Pestañas: Inicio, Análisis, Tienda, Perfil.

En la web el contenido se centra. En teléfono queda en una columna de hasta 480 px. Desde 720 px de ancho pasa a un lienzo de hasta 960 px, con el mapa al lado de la leyenda, la bienvenida en dos columnas y la tienda en grilla.

## Esta versión

Todo usa datos locales de demostración.

- Sesión guardada en el dispositivo. El correo no se envía a ningún servidor y no hay contraseña.
- Mapa SVG de Costa Rica por provincia, con porcentajes de afición inventados para la demo.
- Recomendaciones de quiniela y fantasy escritas como reglas, con aviso informativo.
- Tienda con catálogo y precios en colones. Se puede marcar un producto como guardado. No hay pago.

## Fuera de esta versión

API real de la NFL, modelo de IA, cuentas en servidor, pagos y publicación en App Store o Google Play.
