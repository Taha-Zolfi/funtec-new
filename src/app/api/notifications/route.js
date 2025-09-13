import { NextResponse } from 'next/server';

// Notifications API removed. Return 410 Gone.
export async function GET() {
  return NextResponse.json({ error: 'Notifications endpoint removed' }, { status: 410 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Notifications endpoint removed' }, { status: 410 });
}

