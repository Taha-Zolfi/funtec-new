// مسیر: src/app/api/services/[id]/route.js

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET: یک خدمت خاص با تمام ترجمه‌هایش را برمی‌گرداند
export async function GET(request, { params }) {
  const db = await getDb();
  const { id } = params;

  try {
    const service = await db.get('SELECT * FROM services WHERE id = ?', id);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const translations = await db.all('SELECT * FROM service_translations WHERE service_id = ?', id);

    // تبدیل آرایه ترجمه‌ها به آبجکت
    const translationsByLocale = translations.reduce((acc, t) => {
      acc[t.locale] = {
        name: t.name,
        description: t.description,
        features: t.features ? t.features.split(',').filter(Boolean) : [],
        benefits: t.benefits ? t.benefits.split(',').filter(Boolean) : [],
      };
      return acc;
    }, {});
    
    // ترکیب داده‌ها
    const response = {
      id: service.id,
      images: service.images ? service.images.split(',').filter(Boolean) : [],
      translations: translationsByLocale,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`API Error GET /services/${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: یک خدمت و تمام ترجمه‌هایش را به‌روزرسانی می‌کند
export async function PUT(request, { params }) {
  const db = await getDb();
  const { id } = params;

  try {
    const { translations, ...serviceData } = await request.json();
    
    await db.run('BEGIN TRANSACTION');

    // 1. Update main service table
    await db.run(
      'UPDATE services SET images = ? WHERE id = ?',
      [
        Array.isArray(serviceData.images) ? serviceData.images.join(',') : '',
        id
      ]
    );

    // 2. Upsert (Update or Insert) translations
    const stmt = await db.prepare(`
      INSERT INTO service_translations (service_id, locale, name, description, features, benefits) 
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(service_id, locale) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        features = excluded.features,
        benefits = excluded.benefits
    `);

    for (const [locale, trans] of Object.entries(translations)) {
        if(trans.name) {
            await stmt.run(
                id,
                locale,
                trans.name,
                trans.description || '',
                Array.isArray(trans.features) ? trans.features.join(',') : '',
                Array.isArray(trans.benefits) ? trans.benefits.join(',') : ''
            );
        }
    }
    await stmt.finalize();

    await db.run('COMMIT');

    return NextResponse.json({ success: true, id });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error(`API Error PUT /services/${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// DELETE: یک خدمت را حذف می‌کند (و ترجمه‌ها به صورت خودکار حذف می‌شوند)
export async function DELETE(request, { params }) {
  const db = await getDb();
  const { id } = params;

  try {
    // Thanks to "ON DELETE CASCADE", translations will be deleted automatically.
    await db.run('DELETE FROM services WHERE id = ?', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API Error DELETE /services/${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}