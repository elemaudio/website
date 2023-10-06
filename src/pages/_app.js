import '../styles/globals.css';

import Head from 'next/head'
import { RenderContextProvider } from '@/lib/RenderContext';


export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script defer data-domain="elementary.audio" src="https://plausible.io/js/script.js"></script>
      </Head>
      <RenderContextProvider>
        <Component {...pageProps} />
      </RenderContextProvider>
    </>
  );
}
