import initTranslations from '../../i18n';
import TranslationsProvider from '../../components/TranslationsProvider';
import AboutPage from './About'; // Changed from AboutContent for clarity
import Nav from '../Nav/Nav';

const i18nNamespaces = ['common', 'about'];

// This function correctly pre-builds the pages for each language
export async function generateStaticParams() {
  // Assuming you have 'fa', 'en', 'ar' in your i18n config
  const supportedLngs = ['fa', 'en', 'ar']; 
  return supportedLngs.map((lang) => ({ locale: lang }));
}

// This is the main server component for the page
export default async function Page({ params: { locale } }) {
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={locale}
      resources={resources}
    >
      <Nav />
      <AboutPage />
    </TranslationsProvider>
  );
}