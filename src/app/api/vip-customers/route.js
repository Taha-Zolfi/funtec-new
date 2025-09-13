import { NextResponse } from 'next/server';

// VIP customers API removed. Return 410 Gone.
export async function GET() {
  return NextResponse.json({ error: 'VIP customers endpoint removed' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'VIP customers endpoint removed' }, { status: 410 });
}

export async function PUT() {
  return NextResponse.json({ error: 'VIP customers endpoint removed' }, { status: 410 });
}

