import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value || '';

  if (!token) {
    return NextResponse.json(
      {
        code: 401,
        message:
          'Unauthorized. Credential is needed to continue proceed with the request.',
        ok: false,
        data: null,
      },
      {
        status: 401,
      }
    );
  }

  const response = await getCurrentAuthenticated(token);

  if (response.code === 403) {
    return NextResponse.json(
      {
        code: response.code,
        message: 'Forbidden. Credential is invalid',
        ok: false,
        data: null,
      },
      {
        status: response.code,
      }
    );
  }

  return NextResponse.json(response, {
    status: response.code,
  });
}
