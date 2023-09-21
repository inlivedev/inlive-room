import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value || '';

  if (token) {
    cookieStore.delete('token');
  }

  return NextResponse.json(
    { code: 200, message: 'OK', ok: true, data: null },
    { status: 200 }
  );
}
