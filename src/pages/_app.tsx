import type { AppProps } from 'next/app'

function HireApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default HireApp
