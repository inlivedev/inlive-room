import { authenticate } from '@/(server)/_shared/utils/auth';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const url = new URL(request.url);
  const currentPath = url.origin + url.pathname;
  const codeParam = url.searchParams.get('code') || '';
  const stateParam = url.searchParams.get('state') || '';
  const stateCookie = request.cookies.get('state')?.value || '';
  const provider = params.provider;

  if (stateParam === stateCookie) {
    const authResponse = await authenticate(provider, currentPath, codeParam);

    if (authResponse.data.token) {
      const response = NextResponse.redirect(url.origin);

      response.cookies.set({
        name: 'token',
        value: authResponse.data.token,
        path: '/',
        sameSite: 'strict',
        httpOnly: true,
      });

      return response;
    }
  }

  // If the authentication is not successful
  return NextResponse.json(
    {
      code: 403,
      message: 'Forbidden',
      ok: false,
      data: null,
    },
    {
      status: 403,
    }
  );
}
