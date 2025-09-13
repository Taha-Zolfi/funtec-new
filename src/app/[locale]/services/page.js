// مسیر: src/app/[locale]/services/page.js

import initTranslations from '../../i18n';
import TranslationsProvider from '../../components/TranslationsProvider';
import ServicesPage from './services';
// [FIX] به جای api از توابع مستقیم دیتا استفاده می‌کنیم
import { getServicesData, getProductsData } from '@/lib/data';

const i18nNamespaces = ['common', 'services'];

export async function generateStaticParams() {
  const supportedLngs = ['fa', 'en', 'ar'];
  return supportedLngs.map((lang) => ({ locale: lang }));
}

export default async function Services({ params }) {
  const resolved = await params;
  const currentLocale = resolved?.locale || 'fa';
  const { resources } = await initTranslations(currentLocale, i18nNamespaces);

  let servicesData = [];
  let productsData = [];
  try {
    // [FIX] فراخوانی مستقیم توابع دیتابیس به جای fetch
    // این کار حلقه شبکه را حذف کرده و فرآیند را آنی می‌کند
    const [fetchedServices, fetchedProducts] = await Promise.all([
      getServicesData({ locale: currentLocale }),
      getProductsData({ locale: currentLocale })
    ]);
    servicesData = fetchedServices;
    productsData = fetchedProducts.slice(0, 4);
  } catch (error) {
    console.error("Error fetching data for services page on server:", error.message);
  }

  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={currentLocale} 
      resources={resources}
    >
      <ServicesPage initialServices={servicesData} initialProducts={productsData} />
    </TranslationsProvider>
  );
}