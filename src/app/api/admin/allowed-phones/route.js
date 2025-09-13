import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
  // Ensure tables exist (safe no-op if already present)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS allowed_logins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS allowed_phone_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      allowed_login_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      FOREIGN KEY(allowed_login_id) REFERENCES allowed_logins(id) ON DELETE CASCADE,
      FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
    );
  `);

    // Return phones with their accessible services
    const rows = await db.all(`
      SELECT al.id, al.phone, al.created_at, GROUP_CONCAT(aps.service_id) as accessible_services
      FROM allowed_logins al
      LEFT JOIN allowed_phone_services aps ON al.id = aps.allowed_login_id
      GROUP BY al.id
      ORDER BY al.id DESC
    `);

    const normalized = rows.map(r => ({
      id: r.id,
      phone: r.phone,
      created_at: r.created_at,
      accessible_services: r.accessible_services ? r.accessible_services.split(',').map(x => parseInt(x)) : []
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error GET allowed-phones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { phone, accessible_services } = await request.json();
    if (!phone) return NextResponse.json({ error: 'phone-required' }, { status: 400 });
    const db = await getDb();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS allowed_logins ( id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
      CREATE TABLE IF NOT EXISTS allowed_phone_services ( id INTEGER PRIMARY KEY AUTOINCREMENT, allowed_login_id INTEGER NOT NULL, service_id INTEGER NOT NULL );
    `);

    // Insert or ignore phone
    await db.run('INSERT OR IGNORE INTO allowed_logins (phone) VALUES (?)', [phone]);
    // Get the id
    const row = await db.get('SELECT id FROM allowed_logins WHERE phone = ?', [phone]);
    const allowedId = row?.id;

    // Insert mappings if provided
    if (allowedId) {
      // Remove previous mappings to make updates idempotent
      await db.run('DELETE FROM allowed_phone_services WHERE allowed_login_id = ?', [allowedId]);
      if (Array.isArray(accessible_services) && accessible_services.length > 0) {
        const stmt = await db.prepare('INSERT OR IGNORE INTO allowed_phone_services (allowed_login_id, service_id) VALUES (?, ?)');
        for (const sid of accessible_services) {
          await stmt.run(allowedId, sid);
        }
        await stmt.finalize();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error POST allowed-phones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id-required' }, { status: 400 });
    const db = await getDb();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS allowed_logins ( id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
      CREATE TABLE IF NOT EXISTS allowed_phone_services ( id INTEGER PRIMARY KEY AUTOINCREMENT, allowed_login_id INTEGER NOT NULL, service_id INTEGER NOT NULL );
    `);

    // Delete mappings and phone (ON DELETE CASCADE may handle, but ensure removal)
    await db.run('DELETE FROM allowed_phone_services WHERE allowed_login_id = ?', [id]);
    await db.run('DELETE FROM allowed_logins WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error DELETE allowed-phones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
