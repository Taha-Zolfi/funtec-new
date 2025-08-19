import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const service = await db.get('SELECT * FROM services WHERE id = ?', id);
      if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      
      return NextResponse.json({
        ...service,
        features: service.features ? service.features.split(',') : [],
        benefits: service.benefits ? service.benefits.split(',') : [],
        images: service.images ? service.images.split(',') : []
      });
    } else {
      const services = await db.all('SELECT * FROM services');
      return NextResponse.json(services.map(service => ({
        ...service,
        features: service.features ? service.features.split(',') : [],
        benefits: service.benefits ? service.benefits.split(',') : [],
        images: service.images ? service.images.split(',') : []
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
    const { features, benefits, images, ...rest } = data;

    const result = await db.run(
      'INSERT INTO services (name, description, features, benefits, images) VALUES (?, ?, ?, ?, ?)',
      [
        rest.name,
        rest.description,
        Array.isArray(features) ? features.join(',') : '',
        Array.isArray(benefits) ? benefits.join(',') : '',
        Array.isArray(images) ? images.join(',') : ''
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
    const { features, benefits, images, ...rest } = data;
    
    await db.run(
      'UPDATE services SET name = ?, description = ?, features = ?, benefits = ?, images = ? WHERE id = ?',
      [
        rest.name,
        rest.description,
        Array.isArray(features) ? features.join(',') : '',
        Array.isArray(benefits) ? benefits.join(',') : '',
        Array.isArray(images) ? images.join(',') : '',
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
    await db.run('DELETE FROM services WHERE id = ?', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
