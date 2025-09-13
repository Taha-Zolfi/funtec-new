// مسیر: src/app/[locale]/products/[id]/ProductLoader.jsx

// این فایل جدید است
import { notFound } from 'next/navigation';
import initTranslations from '../../../i18n';
import TranslationsProvider from '../../../components/TranslationsProvider';
import ProductDetail from '../ProductDetail';
import { api } from '@/lib/api';

const i18nNamespaces = ['common', 'products'];

// این کامپوننت جدید، تمام کارهای async را انجام می‌دهد
export default async function ProductLoader({ params }) {
  const { locale, id } = params;

  if (!locale || !id) {
    notFound();
  }

  const { resources } = await initTranslations(locale, i18nNamespaces);

  let productData = null;
  try {
    productData = await api.getProduct(id);
  } catch (error) {
    console.error(`Error fetching product with ID ${id} on server:`, error.message);
  }
  
  if (!productData) {
    notFound();
  }

  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={locale} 
      resources={resources}
    >
      <ProductDetail initialProduct={productData} />
    </TranslationsProvider>
  );
}
