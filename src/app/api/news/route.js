// مسیر: src/app/api/news/route.js

import { NextResponse } from 'next/server';
import { getNewsData } from '@/lib/data';
import { getDb } from '@/lib/db'; // <-- [FIX] ایمپورت getDb

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'fa'; 

  try {
    const newsItems = await getNewsData({ locale });
    return NextResponse.json(newsItems);
  } catch (error) {
    console.error("API Error GET /news:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// تابع POST شما حالا به درستی کار خواهد کرد
export async function POST(request) {
  const db = await getDb(); // <-- این خط دیگر خطا نمی‌دهد
  try {
    const { translations, ...newsData } = await request.json();
    await db.run('BEGIN TRANSACTION');
    const result = await db.run('INSERT INTO news (image, is_featured) VALUES (?, ?)', [ newsData.image || null, newsData.is_featured ? 1 : 0 ]);
    const newsId = result.lastID;
    const stmt = await db.prepare('INSERT INTO news_translations (news_id, locale, title, excerpt, content) VALUES (?, ?, ?, ?, ?)');
    for (const [locale, trans] of Object.entries(translations)) {
        if (trans.title) {
            await stmt.run(newsId, locale, trans.title, trans.excerpt || '', trans.content || '');
        }
    }
    await stmt.finalize();
    await db.run('COMMIT');
    return NextResponse.json({ id: newsId }, { status: 201 });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error("API Error POST /news:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}