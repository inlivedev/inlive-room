import { NextResponse, type NextRequest } from 'next/server';
import { authorize } from '@/(server)/_shared/utils/auth';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  const { pathname = '' } = await request.json();
  const state = crypto.randomUUID();
  const relativeRedirectUri = `/api/auth/${provider}/authenticate`;
  const absoluteRedirectUri = `${APP_ORIGIN}${relativeRedirectUri}`;

  const authorizeResponse = await authorize(
    provider,
    absoluteRedirectUri,
    state
  );

  if (authorizeResponse.data) {
    const response = NextResponse.json(authorizeResponse, {
      status: authorizeResponse.code,
    });

    const oneHour = 3600;

    response.cookies.set({
      name: 'state',
      value: state,
      path: relativeRedirectUri,
      sameSite: 'lax',
      maxAge: oneHour,
      httpOnly: true,
    });

    response.cookies.set({
      name: 'pathname',
      value: pathname,
      path: relativeRedirectUri,
      sameSite: 'lax',
      maxAge: oneHour,
      httpOnly: true,
    });

    return response;
  }

  // If the authorization is not successful
  return NextResponse.json(
    {
      code: authorizeResponse.code || 500,
      message:
        authorizeResponse.message ||
        'Unexpected error. Please try again later!',
      ok: false,
      data: null,
    },
    {
      status: authorizeResponse.code || 500,
    }
  );
}
