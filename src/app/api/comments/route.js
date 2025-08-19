import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = await getDb();
    const data = await request.json();
    
    // Validate required fields
    if (!data.productId || !data.name || !data.text || data.rating === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await db.run(
      'INSERT INTO comments (product_id, name, comment, rating, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [data.productId, data.name, data.text, data.rating]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
