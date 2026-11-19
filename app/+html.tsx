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
        <meta name="theme-color" content="#F2F4F8" />
        <meta property="og:title" content="PlayBookCR · La jornada de la NFL leída con IA" />
        <meta
          property="og:description"
          content="Lectura de la jornada de la NFL con IA, hecha en Costa Rica. Afición por provincia y análisis de la semana."
        />
        <meta property="og:locale" content="es_CR" />
        <meta property="og:type" content="website" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9.5' fill='%230B1324'/%3E%3Cpath d='M11 24.5V8.6H17.4A5.6 5.6 0 0 1 17.4 19.8H11' fill='none' stroke='%23FFFFFF' stroke-width='3.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='17' cy='14.2' r='2.3' fill='%234D74FF'/%3E%3C/svg%3E" />

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
  background-color: #F2F4F8;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;

}
::selection {
  background: rgba(35, 80, 245, 0.22);
  color: inherit;
}
input, textarea {
  caret-color: #2350F5;
}
:focus-visible {
  outline: 2px solid #2350F5;
  outline-offset: 3px;
}
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(35, 80, 245, 0.22) transparent;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: rgba(11, 19, 36, 0.18);
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}`;
