import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET: Get all service requests
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');
  const status = searchParams.get('status');
  
  const db = await getDb();
  
  try {
    const { serviceId, serviceName, customerName, phoneNumber, message } = await request.json();

    // Validate required fields
    if (!serviceId || !serviceName || !customerName || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the service request
    const result = await db.run(`
      INSERT INTO service_requests (
        service_id,
        service_name,
        customer_name,
        phone_number,
        message,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      serviceId,
      serviceName,
      customerName,
      phoneNumber,
      message || '',
      'pending',
      new Date().toISOString()
    ]);

    return NextResponse.json({ success: true, id: result.lastID }, { status: 201 });
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

  try {
    let query = `
      SELECT 
        sr.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.company_name,
        c.email as customer_email,
        s.id as service_id,
        st.name as service_translated_name
      FROM service_requests sr
      LEFT JOIN customers c ON sr.customer_id = c.id
      LEFT JOIN services s ON sr.service_id = s.id
      LEFT JOIN service_translations st ON s.id = st.service_id AND st.locale = 'fa'
    `;
    
    const conditions = [];
    const params = [];
    
    if (customerId) {
      conditions.push('sr.customer_id = ?');
      params.push(customerId);
    }
    
    if (status) {
      conditions.push('sr.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sr.created_at DESC';

    const requests = await db.all(query, params);

    return NextResponse.json(requests);
  } catch (error) {
    console.error("API Error GET /service-requests:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new service request
export async function POST(request) {
  const db = await getDb();
  
  try {
    const {
      customer_id,
      service_id,
      request_title,
      request_description,
      priority = 'medium',
      location,
      preferred_date,
      preferred_time,
      estimated_cost
    } = await request.json();

    // For backward compatibility, we check if a mapping exists in allowed_phone_services
    // If there is a customer-based access table in this project it should be migrated; otherwise assume service exists
    // Here we just ensure the target service exists
    const svc = await db.get('SELECT id FROM services WHERE id = ?', [service_id]);
    if (!svc) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Create the request
    const result = await db.run(
      `INSERT INTO service_requests 
       (customer_id, service_id, request_title, request_description, priority, location, preferred_date, preferred_time, estimated_cost) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, service_id, request_title, request_description, priority, location || '', preferred_date || null, preferred_time || '', estimated_cost || '']
    );

    const requestId = result.lastID;

  // Notifications system removed — admin will check service requests in panel

    return NextResponse.json({ id: requestId }, { status: 201 });
  } catch (error) {
    console.error("API Error POST /service-requests:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update service request status
export async function PUT(request) {
  const db = await getDb();
  
  try {
    const { id, status, admin_notes, assigned_to } = await request.json();

    await db.run(
      'UPDATE service_requests SET status = ?, admin_notes = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, admin_notes || '', assigned_to || '', id]
    );

  // Notifications subsystem was removed; admins should review service requests in the panel

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error PUT /service-requests:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

