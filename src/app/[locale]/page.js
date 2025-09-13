// مسیر: app/[locale]/page.js

import initTranslations from '../i18n';
import TranslationsProvider from '../components/TranslationsProvider';
import MainPageClient from './MainPageClient';

const i18nNamespaces = ['common', 'home', 'about', 'contact'];

// این تابع کاملاً صحیح است و باید باقی بماند
export async function generateStaticParams() {
  const supportedLngs = ['fa', 'en', 'ar'];
  return supportedLngs.map((lang) => ({ locale: lang }));
}

// !!!   تغییر اصلی برای رفع خطا اینجاست   !!!
// امضای تابع را برای دسترسی مستقیم به locale تغییر می‌دهیم
export default async function Page({ params }) {
  // Get locale from params
  const { locale } = params;
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={locale} // اینجا هم از locale استفاده می‌کنیم
      resources={resources}
    >
      <MainPageClient />
    </TranslationsProvider>
  );
}