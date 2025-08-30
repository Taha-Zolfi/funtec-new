// --- START OF FILE src/app/api/cabins/route.js ---

import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db'; // مسیر db.js را چک کنید

// تابع برای دریافت تمام کابین‌ها
export async function GET() {
  try {
    const db = await getDb();
    const cabins = await db.all('SELECT * FROM cabins ORDER BY cabin_number ASC');
    return NextResponse.json(cabins);
  } catch (error) {
    console.error('API GET Error in /api/cabins:', error);
    return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// تابع برای به‌روزرسانی یک کابین
export async function PUT(request) {
  try {
    const db = await getDb();
    const { id, image_url, target_link } = await request.json();

    if (!id || image_url === undefined || target_link === undefined) {
      return NextResponse.json({ message: 'Incomplete data provided.' }, { status: 400 });
    }

    const result = await db.run(
      'UPDATE cabins SET image_url = ?, target_link = ? WHERE id = ?',
      [image_url, target_link, id]
    );

    if (result.changes === 0) {
      return NextResponse.json({ message: 'Cabin not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Cabin updated successfully' });
  } catch (error) {
    console.error('API PUT Error in /api/cabins:', error);
    return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}