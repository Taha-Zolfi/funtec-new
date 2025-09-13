import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { phone } = await request.json();
    if (!phone) return NextResponse.json({ error: 'phone-required' }, { status: 400 });

    const db = await getDb();
  // Ensure tables exist
  await db.exec(`CREATE TABLE IF NOT EXISTS allowed_logins ( id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
  await db.exec(`CREATE TABLE IF NOT EXISTS login_codes ( id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, code TEXT NOT NULL, expires_at DATETIME NOT NULL )`);
  // Check allowed phones
  const allowed = await db.get('SELECT id FROM allowed_logins WHERE phone = ?', [phone]);
    if (!allowed) return NextResponse.json({ error: 'phone-not-allowed' }, { status: 403 });

    // Generate 4-digit random code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // valid 5 minutes

    // Store code (replace any existing for the phone)
    await db.run('DELETE FROM login_codes WHERE phone = ?', [phone]);
    await db.run('INSERT INTO login_codes (phone, code, expires_at) VALUES (?, ?, ?)', [phone, code, expiresAt]);

  // For now, log the code to server console (user will copy it)
  console.log(`Login code for ${phone}: ${code} (expires at ${expiresAt})`);

  // Return code in response for testing (dev only)
  return NextResponse.json({ ok: true, code });
  } catch (error) {
    console.error('Error in request-code:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
