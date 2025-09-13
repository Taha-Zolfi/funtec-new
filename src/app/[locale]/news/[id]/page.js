// مسیر: src/app/[locale]/news/[id]/page.js

import { notFound } from 'next/navigation';
import initTranslations from '../../../i18n';
import TranslationsProvider from '../../../components/TranslationsProvider';
import NewsDetail from '../NewsDetails'; // نام کامپوننت شما ممکن است متفاوت باشد
import Nav from '../../Nav/Nav';
// [FIX] ایمپورت توابع مستقیم دیتا به جای api
import { getNewsData, getNewsItemData } from '@/lib/data';

const i18nNamespaces = ['common', 'news'];

// [FIX] اضافه کردن revalidate برای به‌روزرسانی دوره‌ای و ساخت صفحات جدید
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const supportedLngs = ['fa', 'en', 'ar'];
  try {
    // [FIX] فراخوانی مستقیم تابع دیتا
    const allNews = await getNewsData({ locale: 'fa' }); 
    if (!allNews || allNews.length === 0) return [];
    
    return allNews.flatMap((article) =>
      supportedLngs.map((lang) => ({
        locale: lang,
        id: article.id.toString(),
      }))
    );
  } catch (error) {
    console.error("Could not generate static params for news:", error);
    return [];
  }
}

export default async function NewsDetailsPage({ params: { locale, id } }) {
  const { resources } = await initTranslations(locale, i18nNamespaces);

  let articleData = null;
  try {
    // [FIX] فراخوانی مستقیم تابع دیتا به جای fetch
    const rawArticle = await getNewsItemData(id);
    
    if (rawArticle) {
      const translation = rawArticle.translations?.[locale] || rawArticle.translations?.['fa'] || {};
      articleData = {
        id: rawArticle.id,
        image: rawArticle.image,
        is_featured: rawArticle.is_featured,
        views: rawArticle.views,
        created_at: rawArticle.created_at,
        ...translation 
      };
    }
  } catch (error) {
    console.error(`Error fetching news with ID ${id} on server:`, error);
  }
  
  if (!articleData || !articleData.title) {
    notFound();
  }

  return (
    <TranslationsProvider 
      namespaces={i18nNamespaces} 
      locale={locale} 
      resources={resources}
    >
  <Nav />
      <NewsDetail initialArticle={articleData} />
    </TranslationsProvider>
  );
}