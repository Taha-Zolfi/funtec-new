// مسیر: src/app/api/products/route.js

import { NextResponse } from 'next/server';
import { getProductsData } from '@/lib/data'; // <-- [FIX] استفاده از تابع مشترک
import { getDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'fa';

  try {
    // [FIX] فراخوانی تابع یکپارچه به جای تکرار کد
    const products = await getProductsData({ locale });
    return NextResponse.json(products);
  } catch (error) {
    console.error("API Error GET /products:", error);
    return NextResponse.json({ error: "Failed to fetch products", details: error.message }, { status: 500 });
  }
}

// تابع POST شما صحیح است و نیازی به تغییر ندارد
export async function POST(request) {
  const db = await getDb();
  try {
    const { translations, ...productData } = await request.json();
    await db.run('BEGIN TRANSACTION');
    const result = await db.run('INSERT INTO products (images, background_video) VALUES (?, ?)', [ Array.isArray(productData.images) ? productData.images.join(',') : '', productData.background_video || null ]);
    const productId = result.lastID;
    const stmt = await db.prepare('INSERT INTO product_translations (product_id, locale, name, short_description, full_description, features, specifications) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const [locale, trans] of Object.entries(translations)) {
        if (trans.name) {
            await stmt.run(productId, locale, trans.name, trans.short_description || '', trans.full_description || '', Array.isArray(trans.features) ? trans.features.join(',') : '', Array.isArray(trans.specifications) ? trans.specifications.join(',') : '');
        }
    }
    await stmt.finalize();
    await db.run('COMMIT');
    return NextResponse.json({ id: productId }, { status: 201 });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error("API Error POST /products:", error);
    return NextResponse.json({ error: "Failed to create product", details: error.message }, { status: 500 });
  }
}