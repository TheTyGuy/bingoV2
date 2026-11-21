import type { AppProps } from 'next/app';
import Head from 'next/head';
import { FallingLeaves } from '@/components/SkinDecor';
import { SkinProvider } from '@/lib/useSkin';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>kaBINGO!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <SkinProvider>
        <FallingLeaves />
        <Component {...pageProps} />
      </SkinProvider>
    </>
  );
}
