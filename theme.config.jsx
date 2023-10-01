import Logo from './src/components/Logo';


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
