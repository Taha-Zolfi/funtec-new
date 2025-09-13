import { NextResponse } from 'next/server';

// VIP services API removed. Return 410 Gone to indicate endpoint is retired.
export async function GET() {
  return NextResponse.json({ error: 'VIP services endpoint removed' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'VIP services endpoint removed' }, { status: 410 });
}

