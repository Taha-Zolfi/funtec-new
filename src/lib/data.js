// مسیر: src/lib/data.js

import { getDb } from '@/lib/db';

// ====================================================================
// Services Data Functions
// ====================================================================

export async function getServicesData({ locale = 'fa' } = {}) {
  const db = await getDb();
  const services = await db.all(`
    SELECT s.id, t.name, t.description, s.images
    FROM services s
    JOIN service_translations t ON s.id = t.service_id
    WHERE t.locale = ?
  `, [locale]);

  // آدرس‌ها از قبل کامل هستند، فقط اولین تصویر را جدا می‌کنیم
  return services.map(s => ({
    ...s,
    images: s.images ? s.images.split(',').filter(Boolean)[0] : null
  }));
}

// ====================================================================
// Products Data Functions
// ====================================================================

export async function getProductsData({ locale = 'fa' } = {}) {
  const db = await getDb();
  const products = await db.all(`
    SELECT 
      p.id, p.background_video, p.images,
      t.name, t.short_description
    FROM products p
    JOIN product_translations t ON p.id = t.product_id
    WHERE t.locale = ?
  `, [locale]);

  // آدرس‌ها از قبل کامل هستند، فقط رشته را به آرایه تبدیل می‌کنیم
  return products.map(p => ({
    ...p,
    background_video: p.background_video || null,
    images: p.images ? p.images.split(',').filter(Boolean) : []
  }));
}

// ====================================================================
// News Data Functions
// ====================================================================

export async function getNewsData({ locale = 'fa' } = {}) {
  const db = await getDb();
  const newsItems = await db.all(`
    SELECT n.id, n.is_featured, n.views, n.created_at, n.image,
           t.title, t.excerpt
    FROM news n
    JOIN news_translations t ON n.id = t.news_id
    WHERE t.locale = ?
    ORDER BY n.created_at DESC
  `, [locale]);
  
  // آدرس تصویر از قبل کامل است و نیازی به تغییر ندارد
  return newsItems;
}

export async function getNewsItemData(id) {
  const db = await getDb();
  
  const newsItem = await db.get('SELECT * FROM news WHERE id = ?', id);
  if (!newsItem) return null;

  const translations = await db.all('SELECT * FROM news_translations WHERE news_id = ?', id);
  
  const translationsByLocale = translations.reduce((acc, t) => {
    acc[t.locale] = {
      title: t.title,
      excerpt: t.excerpt,
      content: t.content,
    };
    return acc;
  }, {});
  
  // آدرس‌ها از قبل کامل هستند و نیازی به تغییر ندارند
  return {
    id: newsItem.id,
    image: newsItem.image,
    is_featured: Boolean(newsItem.is_featured),
    views: newsItem.views,
    created_at: newsItem.created_at,
    translations: translationsByLocale,
  };
}