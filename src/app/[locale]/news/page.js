// مسیر: src/app/[locale]/news/page.js

import initTranslations from '../../i18n';
import TranslationsProvider from '../../components/TranslationsProvider';
import News from './News';
import Nav from '../Nav/Nav';
// [FIX] به جای api از تابع مستقیم دیتا استفاده می‌کنیم
import { getNewsData } from '@/lib/data';

const i18nNamespaces = ['common', 'news'];

export async function generateStaticParams() {
  const supportedLngs = ['fa', 'en', 'ar'];
  return supportedLngs.map((lang) => ({ locale: lang }));
}

export default async function NewsPage({ params: { locale } }) {
  const { resources } = await initTranslations(locale, i18nNamespaces);

  let newsData = [];
  try {
    // [FIX] فراخوانی مستقیم تابع دیتابیس به جای fetch
    // این کار حلقه شبکه را برای این صفحه هم حذف می‌کند
    newsData = await getNewsData({ locale });
  } catch (error) {
    console.error("Error fetching news on server:", error.message);
  }

  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={locale} 
      resources={resources}
    >
  <Nav />
      <News initialNews={newsData} />
    </TranslationsProvider>
  );
}