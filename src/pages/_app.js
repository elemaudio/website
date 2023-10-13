import '../styles/globals.css';

import { RenderContextProvider } from '@/lib/RenderContext';


export default function App({ Component, pageProps }) {
  return (
    <RenderContextProvider>
      <Component {...pageProps} />
    </RenderContextProvider>
  );
}
