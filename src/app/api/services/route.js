// مسیر: src/app/api/services/route.js

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET: لیست خدمات را برای زبان مشخص شده برمی‌گرداند
export async function GET(request) {
  // Allow admin clients to bypass auth by providing admin=1 in query (used by admin panel)
  const { searchParams } = new URL(request.url);
  const adminBypass = searchParams.get('admin') === '1';
  const authPhone = request.cookies.get('auth_phone')?.value;
  if (!adminBypass && !authPhone) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = await getDb();
  const locale = searchParams.get('locale') || 'fa'; // زبان پیش‌فرض فارسی

  try {
    // If admin bypass, return all services. Otherwise, filter by allowed services for the authenticated phone.
    if (adminBypass) {
      const services = await db.all(`
        SELECT s.id, t.name
        FROM services s
        JOIN service_translations t ON s.id = t.service_id
        WHERE t.locale = ?
      `, [locale]);
      return NextResponse.json(services);
    }

    // Resolve allowed_login id from phone
    const allowedRow = await db.get('SELECT id FROM allowed_logins WHERE phone = ?', [authPhone]);
    if (!allowedRow) return NextResponse.json([], { status: 200 });

    const services = await db.all(`
      SELECT s.id, t.name
      FROM services s
      JOIN service_translations t ON s.id = t.service_id
      JOIN allowed_phone_services aps ON s.id = aps.service_id
      WHERE aps.allowed_login_id = ? AND t.locale = ?
    `, [allowedRow.id, locale]);

    return NextResponse.json(services);
  } catch (error) {
    console.error("API Error GET /services:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: یک خدمت جدید با تمام ترجمه‌هایش ایجاد می‌کند
export async function POST(request) {
  const db = await getDb();
  try {
    const { translations, ...serviceData } = await request.json();

    await db.run('BEGIN TRANSACTION');

    // 1. Insert into main services table
    const result = await db.run(
      'INSERT INTO services (images) VALUES (?)',
      [
        Array.isArray(serviceData.images) ? serviceData.images.join(',') : ''
      ]
    );
    const serviceId = result.lastID;

    // 2. Insert translations
    const stmt = await db.prepare(
      'INSERT INTO service_translations (service_id, locale, name, description, features, benefits) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const [locale, trans] of Object.entries(translations)) {
        if (trans.name) { // Only insert if name exists
            await stmt.run(
                serviceId,
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

    return NextResponse.json({ id: serviceId }, { status: 201 });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error("API Error POST /services:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}