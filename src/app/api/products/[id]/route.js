// مسیر: src/app/api/products/[id]/route.js

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// امضای تابع GET صحیح است. { params } ورودی دوم است.
export async function GET(request, { params }) {
  const db = await getDb();
  const { id } = params; // این روش در API Routes صحیح است.

  // ... بقیه کد شما که از قبل صحیح بود ...
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const translations = await db.all('SELECT * FROM product_translations WHERE product_id = ?', id);
    const comments = await db.all('SELECT * FROM comments WHERE product_id = ? ORDER BY created_at DESC', id);

    const translationsByLocale = translations.reduce((acc, t) => {
      acc[t.locale] = {
        name: t.name,
        short_description: t.short_description,
        full_description: t.full_description,
        features: t.features ? t.features.split(',').filter(Boolean) : [],
        specifications: t.specifications ? t.specifications.split(',').filter(Boolean) : [],
      };
      return acc;
    }, {});
    
    const response = {
      id: product.id,
      images: product.images ? product.images.split(',').filter(Boolean) : [],
      background_video: product.background_video,
      translations: translationsByLocale,
      comments: comments || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`API Error GET /products/${id}:`, error);
    return NextResponse.json({ error: "Failed to fetch product", details: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const db = await getDb();
  const { id } = params;
  try {
    const { translations, ...productData } = await request.json();
    await db.run('BEGIN TRANSACTION');
    await db.run(
      'UPDATE products SET images = ?, background_video = ? WHERE id = ?',
      [
        Array.isArray(productData.images) ? productData.images.join(',') : '',
        productData.background_video || null,
        id
      ]
    );
    const stmt = await db.prepare(`
      INSERT INTO product_translations (product_id, locale, name, short_description, full_description, features, specifications) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id, locale) DO UPDATE SET
        name = excluded.name, short_description = excluded.short_description, full_description = excluded.full_description,
        features = excluded.features, specifications = excluded.specifications
    `);
    for (const [locale, trans] of Object.entries(translations)) {
        if(trans.name) {
            await stmt.run(
                id, locale, trans.name,
                trans.short_description || '', trans.full_description || '',
                Array.isArray(trans.features) ? trans.features.join(',') : '',
                Array.isArray(trans.specifications) ? trans.specifications.join(',') : ''
            );
        }
    }
    await stmt.finalize();
    await db.run('COMMIT');
    return NextResponse.json({ success: true, id });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error(`API Error PUT /products/${id}:`, error);
    return NextResponse.json({ error: "Failed to update product", details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const db = await getDb();
  const { id } = params;
  try {
    await db.run('DELETE FROM products WHERE id = ?', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API Error DELETE /products/${id}:`, error);
    return NextResponse.json({ error: "Failed to delete product", details: error.message }, { status: 500 });
  }
}