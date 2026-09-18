import '@/styles/globals.css';
import '@/i18n';
import type { AppProps } from 'next/app';
import LanguageToggle from '@/components/LanguageToggle';

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <LanguageToggle />
      <Component {...pageProps} />
    </>
  );
}

export default App;
