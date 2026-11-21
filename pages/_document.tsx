import { Head, Html, Main, NextScript } from 'next/document';
import { ACTIVE_SKIN } from '@/skin.config';
import { SKINS } from '@/skins';

export default function Document() {
  return (
    <Html lang="en" data-skin={ACTIVE_SKIN}>
      <Head>
        <meta name="theme-color" content={SKINS[ACTIVE_SKIN].themeColor} />
        <meta name="description" content="kaBINGO! The party game where you predict what's going to happen, then call it first." />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Luckiest+Guy&family=Nunito:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
