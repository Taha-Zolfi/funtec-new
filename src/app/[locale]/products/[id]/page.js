// مسیر: src/app/[locale]/products/[id]/page.js

import initTranslations from '../../../i18n';
import TranslationsProvider from '../../../components/TranslationsProvider';
import ProductDetail from '../ProductDetail';

const i18nNamespaces = ['common', 'products'];

// امضای تابع صحیح است، اما ما دیگر در اینجا fetch نمی‌کنیم
export default async function ProductDetailsPage({ params: { locale, id } }) {
  const { resources } = await initTranslations(locale, i18nNamespaces);

  // ما دیگر در اینجا داده fetch نمی‌کنیم.
  // فقط id را به کامپوننت کلاینت می‌دهیم تا خودش داده‌ها را fetch کند.
  
  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={locale} 
      resources={resources}
    >
      <ProductDetail productId={id} />
    </TranslationsProvider>
  );
}