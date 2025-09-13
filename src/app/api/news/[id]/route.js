// مسیر: src/app/api/news/[id]/route.js

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET: یک خبر خاص با تمام ترجمه‌هایش را برمی‌گرداند
export async function GET(request, { params }) {
  const db = await getDb();
  const { id } = params;

  try {
    const newsItem = await db.get('SELECT * FROM news WHERE id = ?', id);
    if (!newsItem) {
      return NextResponse.json({ error: 'News item not found' }, { status: 404 });
    }

    // Increment views
    await db.run('UPDATE news SET views = views + 1 WHERE id = ?', id);

    const translations = await db.all('SELECT * FROM news_translations WHERE news_id = ?', id);

    // تبدیل آرایه ترجمه‌ها به آبجکت
    const translationsByLocale = translations.reduce((acc, t) => {
      acc[t.locale] = {
        title: t.title,
        excerpt: t.excerpt,
        content: t.content,
      };
      return acc;
    }, {});
    
    // ترکیب داده‌ها
    const response = {
      id: newsItem.id,
      image: newsItem.image,
      is_featured: Boolean(newsItem.is_featured),
      views: newsItem.views + 1, // Return the incremented value
      translations: translationsByLocale,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`API Error GET /news/${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: یک خبر و تمام ترجمه‌هایش را به‌روزرسانی می‌کند
export async function PUT(request, { params }) {
  const db = await getDb();
  const { id } = params;

  try {
    const { translations, ...newsData } = await request.json();
    
    await db.run('BEGIN TRANSACTION');

    // 1. Update main news table
    await db.run(
      'UPDATE news SET image = ?, is_featured = ? WHERE id = ?',
      [
        newsData.image || null,
        newsData.is_featured ? 1 : 0,
        id
      ]
    );

    // 2. Upsert (Update or Insert) translations
    const stmt = await db.prepare(`
      INSERT INTO news_translations (news_id, locale, title, excerpt, content) 
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(news_id, locale) DO UPDATE SET
        title = excluded.title,
        excerpt = excluded.excerpt,
        content = excluded.content
    `);

    for (const [locale, trans] of Object.entries(translations)) {
        if(trans.title) {
            await stmt.run(
                id,
                locale,
                trans.title,
                trans.excerpt || '',
                trans.content || ''
            );
        }
    }
    await stmt.finalize();

    await db.run('COMMIT');

    return NextResponse.json({ success: true, id });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error(`API Error PUT /news/${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// DELETE: یک خبر را حذف می‌کند (و ترجمه‌ها به صورت خودکار حذف می‌شوند)
export async function DELETE(request, { params }) {
  const db = await getDb();
  const { id } = params;

  try {
    // Thanks to "ON DELETE CASCADE", translations will be deleted automatically.
    await db.run('DELETE FROM news WHERE id = ?', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API Error DELETE /news/${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}