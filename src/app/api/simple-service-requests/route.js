import { NextResponse } from 'next/server';
import { getDb, getWritableDb } from '@/lib/db';

async function ensureSchema(db) {
  // create table with full schema if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS simple_service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      requester_phone TEXT,
      message TEXT NOT NULL,
      admin_notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);
  // ensure columns exist for older schemas
  const info = await db.all(`PRAGMA table_info(simple_service_requests)`);
  const names = new Set(info.map(c => c.name));
  if (!names.has('requester_phone')) {
    await db.exec(`ALTER TABLE simple_service_requests ADD COLUMN requester_phone TEXT`);
  }
  if (!names.has('admin_notes')) {
    await db.exec(`ALTER TABLE simple_service_requests ADD COLUMN admin_notes TEXT`);
  }
  if (!names.has('updated_at')) {
    await db.exec(`ALTER TABLE simple_service_requests ADD COLUMN updated_at DATETIME`);
  }
}

// POST: Create a new simple service request
export async function POST(request) {
  const db = await getWritableDb();
  
  try {
    // Ensure table and required columns exist
    await ensureSchema(db);

    const body = await request.json();
    const { serviceId, serviceName, message } = body || {};
    // Try to read authenticated phone from cookie if not provided in body
    const cookiePhone = request.cookies?.get && request.cookies.get('auth_phone')?.value;
    const requesterPhone = (body && body.requesterPhone) || cookiePhone || null;

    // Validate required fields
    if (!serviceId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the service request
    const result = await db.run(`
      INSERT INTO simple_service_requests (
        service_id,
        service_name,
        requester_phone,
        message,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      serviceId,
      serviceName,
      requesterPhone,
      message,
      'pending',
      new Date().toISOString()
    ]);

  // don't forcibly close shared DB connection; let the db helper manage pooling
    return NextResponse.json({ success: true, id: result.lastID }, { status: 201 });
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: List simple service requests (latest first)
export async function GET() {
  const db = await getDb();
  try {
    const rows = await db.all(`
  SELECT id, service_id, service_name, requester_phone, message, admin_notes, status, created_at, updated_at
  FROM simple_service_requests
      ORDER BY datetime(created_at) DESC
      LIMIT 200
    `);
    return NextResponse.json(rows || [], { status: 200 });
  } catch (error) {
    console.error('Error reading service requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a request by id
export async function DELETE(request) {
  const db = await getWritableDb();
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await ensureSchema(db);
    await db.run(`DELETE FROM simple_service_requests WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting simple service request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// PUT: Update request status / admin notes
export async function PUT(request) {
  const db = await getWritableDb();
  try {
    const { id, status, admin_notes } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    // Only update provided fields
    if (typeof status !== 'undefined' && typeof admin_notes !== 'undefined') {
      await db.run(`UPDATE simple_service_requests SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, admin_notes || '', id]);
    } else if (typeof status !== 'undefined') {
      await db.run(`UPDATE simple_service_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, id]);
    } else if (typeof admin_notes !== 'undefined') {
      await db.run(`UPDATE simple_service_requests SET admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [admin_notes || '', id]);
    } else {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating simple service request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
