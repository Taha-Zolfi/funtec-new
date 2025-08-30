// --- START OF FILE src/app/api/timeline/route.js ---

import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db'; // مسیر db.js را چک کن

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.all('SELECT * FROM timeline_items ORDER BY sort_order ASC, id ASC');
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await getDb();
    const { title, description, image_url, target_link, sort_order } = await request.json();
    if (!title) {
      return NextResponse.json({ message: 'Title is required.' }, { status: 400 });
    }
    const result = await db.run(
      'INSERT INTO timeline_items (title, description, image_url, target_link, sort_order) VALUES (?, ?, ?, ?, ?)',
      [title, description, image_url, target_link, sort_order || 0]
    );
    return NextResponse.json({ id: result.lastID, message: 'Timeline item created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = await getDb();
    const { id, title, description, image_url, target_link, sort_order } = await request.json();
    if (!id || !title) {
      return NextResponse.json({ message: 'ID and Title are required.' }, { status: 400 });
    }
    await db.run(
      'UPDATE timeline_items SET title = ?, description = ?, image_url = ?, target_link = ?, sort_order = ? WHERE id = ?',
      [title, description, image_url, target_link, sort_order || 0, id]
    );
    return NextResponse.json({ message: 'Timeline item updated' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = await getDb();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'ID is required.' }, { status: 400 });
    }
    await db.run('DELETE FROM timeline_items WHERE id = ?', id);
    return NextResponse.json({ message: 'Timeline item deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}