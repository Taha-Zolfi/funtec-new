import initTranslations from '../../i18n';
import TranslationsProvider from '../../components/TranslationsProvider';
import AboutContent from './About';
import Nav from '../Nav/Nav';

const i18nNamespaces = ['common', 'about'];

// این تابع کاملاً صحیح است و باید باقی بماند
export async function generateStaticParams() {
  const supportedLngs = ['fa', 'en', 'ar'];
  return supportedLngs.map((lang) => ({ locale: lang }));
}

// !!!   تغییر اصلی برای رفع خطا اینجاست   !!!
// امضای تابع را برای دسترسی مستقیم به locale تغییر می‌دهیم
export default async function Page({ params: { locale } }) {
  // دیگر نیازی به params.locale نیست و خطا برطرف می‌شود
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={locale} // اینجا هم از locale استفاده می‌کنیم
      resources={resources}
    >
  <Nav />
      <AboutContent />
    </TranslationsProvider>
  );
}
