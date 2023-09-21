import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticate } from '@/(server)/_shared/utils/auth';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const cookieStore = cookies();

  const url = new URL(request.url);
  const currentPath = url.origin + url.pathname;
  const codeParam = url.searchParams.get('code') || '';
  const stateParam = url.searchParams.get('state') || '';
  const stateCookie = cookieStore.get('state')?.value || '';
  const provider = params.provider;

  if (stateParam === stateCookie) {
    const response = await authenticate(provider, currentPath, codeParam);

    if (response.data.token) {
      cookieStore.set({
        name: 'token',
        value: response.data.token,
        path: '/',
        sameSite: 'strict',
        httpOnly: true,
      });

      redirect('/');
    }
  }

  // If the authentication is not successful
  return NextResponse.json(
    {
      code: 403,
      message: 'Authentication is not successful',
      ok: false,
      data: null,
    },
    {
      status: 403,
    }
  );
}
