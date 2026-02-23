// src/pages/_app.js
import '../styles/globals.css'
import { LanguageProvider } from '../components/LanguageProvider';

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}
