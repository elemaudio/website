import Logo from './src/components/Logo';

import { useRouter } from 'next/router';


export default {
  logo: <Logo style={{ height: '2.8rem' }} />,
  project: {
    link: 'https://github.com/elemaudio/elementary'
  },
  chat: {
    link: 'https://discord.gg/xSu9JjHwYc',
  },
  primaryHue: {
    dark: 329,
    light: 329,
  },
  primarySaturation: {
    dark: 89,
    light: 89,
  },
  editLink: {
    text: null,
  },
  feedback: {
    content: null,
  },
  useNextSeoProps() {
    const { asPath } = useRouter();

    return {
      titleTemplate: (['/', '/docs'].includes(asPath)
        ? 'Elementary Audio'
        : '%s – Elementary Audio'),
    }
  },
  head() {
    let descrip = `Elementary is a library for building high performance, portable audio applications with functional, declarative JavaScript.`;

    return (
      <>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={descrip} />

        <meta property="og:image" content="https://www.elementary.audio/logo.png" />
        <meta property="og:description" content={descrip} />

        <script defer data-domain="elementary.audio" src="https://plausible.io/js/script.js"></script>
      </>
    );
  },
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://www.nickwritesablog.com/" target="_blank">
          Nick Thompson
        </a>
      </span>
    )
  }
}
