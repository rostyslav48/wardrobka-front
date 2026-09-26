import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

import { colors } from '@/theme/colors';

// Expo Router's web shell prerenders <html>/<body>/#root transparent, so the
// browser's default white canvas fills the viewport until the entry bundle
// hydrates and RootLayout's ThemeProvider/StatusBar pin ever runs. Grounding
// the shell itself here removes that gap - no code path exists that paints
// anything before this file. `colors.background`'s literal is hand-kept in
// sync (inline <style> can't import the TS token), same convention as the
// splash-screen/adaptive-icon backgroundColor literals in app.json.
// Web half of the app's one family (theme/layout.ts `fontFamily.body`); native
// embeds the same files through app.json's `expo-font` plugin.
const archivoFaces = [
  [400, 'Regular'],
  [500, 'Medium'],
  [600, 'SemiBold'],
  [700, 'Bold'],
]
  .map(
    ([weight, name]) =>
      `@font-face { font-family: 'Archivo'; font-weight: ${weight}; font-style: normal; font-display: swap; src: url('/fonts/Archivo-${name}.ttf') format('truetype'); }`,
  )
  .join('');

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `html, body, #root { background-color: ${colors.background}; }${archivoFaces}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
