import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const item = await db.get('SELECT * FROM news WHERE id = ?', id);
      if (!item) return NextResponse.json({ error: 'News item not found' }, { status: 404 });
      
      // Increment views
      await db.run('UPDATE news SET views = views + 1 WHERE id = ?', id);
      
      return NextResponse.json({
        ...item,
        is_featured: Boolean(item.is_featured),
        views: Number(item.views) + 1
      });
    } else {
      const news = await db.all('SELECT * FROM news ORDER BY created_at DESC');
      return NextResponse.json(news.map(item => ({
        ...item,
        is_featured: Boolean(item.is_featured),
        views: Number(item.views)
      })));
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const db = await getDb();
  try {
    const data = await request.json();
    
    const result = await db.run(
      'INSERT INTO news (title, content, excerpt, description, author, category, is_featured, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.title,
        data.content,
        data.excerpt || null,
        data.description || null,
        data.author || null,
        data.category || null,
        data.is_featured ? 1 : 0,
        data.image || null
      ]
    );

    return NextResponse.json({ id: result.lastID }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    const data = await request.json();
    
    await db.run(
      'UPDATE news SET title = ?, content = ?, excerpt = ?, description = ?, author = ?, category = ?, is_featured = ?, image = ? WHERE id = ?',
      [
        data.title,
        data.content,
        data.excerpt || null,
        data.description || null,
        data.author || null,
        data.category || null,
        data.is_featured ? 1 : 0,
        data.image || null,
        id
      ]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    await db.run('DELETE FROM news WHERE id = ?', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
