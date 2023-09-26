import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = NextResponse.json(
      { code: 200, message: 'OK', ok: true, data: null },
      { status: 200 }
    );

    response.cookies.delete('token');

    return response;
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: 'Failed to sign out', ok: false, data: null },
      { status: 500 }
    );
  }
}
