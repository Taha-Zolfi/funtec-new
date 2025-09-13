import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { phone, code } = await request.json();
    if (!phone || !code) return NextResponse.json({ error: 'missing' }, { status: 400 });

    const db = await getDb();
  await db.exec(`CREATE TABLE IF NOT EXISTS login_codes ( id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, code TEXT NOT NULL, expires_at DATETIME NOT NULL )`);
    const row = await db.get('SELECT code, expires_at FROM login_codes WHERE phone = ?', [phone]);
    if (!row) return NextResponse.json({ error: 'no-code' }, { status: 400 });

    const now = new Date();
    if (new Date(row.expires_at) < now) return NextResponse.json({ error: 'expired' }, { status: 400 });
    if (row.code !== String(code)) return NextResponse.json({ error: 'invalid' }, { status: 400 });

    // success: set cookie indicating authenticated phone
    const res = NextResponse.json({ ok: true });
    // cookie valid for 24 hours
    res.cookies.set('auth_phone', phone, { httpOnly: true, path: '/', maxAge: 24 * 60 * 60 });

    // remove used code
    await db.run('DELETE FROM login_codes WHERE phone = ?', [phone]);

    return res;
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
