import { getProductsData } from '@/lib/data';
import Products from './Products'; // کامپوننت کلاینت شما
import initTranslations from '../../i18n';
import TranslationsProvider from '../../components/TranslationsProvider';
import Nav from '../Nav/Nav';

// [FIX] این خط را اضافه کنید
// به Next.js می‌گوید که این صفحه را هر 1 ساعت یک بار بازسازی کند
export const revalidate = 3600;

const i18nNamespaces = ['common', 'products'];

export async function generateStaticParams() {
  const supportedLngs = ['fa', 'en', 'ar'];
  return supportedLngs.map((lang) => ({ locale: lang }));
}

export default async function ProductsPage({ params: { locale } }) {
  const { resources } = await initTranslations(locale, i18nNamespaces);
  
  let productsData = [];
  try {
    productsData = await getProductsData({ locale });
  } catch (error) {
    console.error("Error fetching products on server:", error.message);
  }

  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={locale} 
      resources={resources}
    >
  <Nav />
      <Products initialProducts={productsData} />
    </TranslationsProvider>
  );
}