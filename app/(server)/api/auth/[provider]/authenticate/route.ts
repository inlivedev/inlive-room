import { authenticate } from '@/(server)/_shared/utils/auth';
import { NextResponse, type NextRequest } from 'next/server';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const url = new URL(request.url);
  const currentPath = APP_ORIGIN + url.pathname;
  const codeParam = url.searchParams.get('code') || '';
  const stateParam = url.searchParams.get('state') || '';
  const stateCookie = request.cookies.get('state')?.value || '';
  const pathnameCookie = request.cookies.get('pathname')?.value || '';
  const provider = params.provider;

  if (stateParam === stateCookie) {
    const authResponse = await authenticate(provider, currentPath, codeParam);

    if (authResponse.data.token) {
      const response = NextResponse.redirect(`${APP_ORIGIN}${pathnameCookie}`, {
        status: 307,
      });

      const sevenDays = 1000 * 60 * 60 * 24 * 7;

      response.cookies.set({
        name: 'token',
        value: authResponse.data.token,
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
        maxAge: sevenDays,
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
