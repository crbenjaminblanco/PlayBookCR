import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>PlayBookCR · La jornada de la NFL leída con IA</title>
        <meta
          name="description"
          content="Lectura de la jornada de la NFL con IA, hecha en Costa Rica. Vea la afición por provincia y el análisis de la semana."
        />
        <meta name="theme-color" content="#030712" />
        <meta property="og:title" content="PlayBookCR · La jornada de la NFL leída con IA" />
        <meta
          property="og:description"
          content="Lectura de la jornada de la NFL con IA, hecha en Costa Rica. Afición por provincia y análisis de la semana."
        />
        <meta property="og:locale" content="es_CR" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #0B1220;
}`;
