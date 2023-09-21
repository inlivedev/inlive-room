import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authorize } from '@/(server)/_shared/utils/auth';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export type PostAuthorizeResponse = Awaited<
  ReturnType<typeof POST>
> extends NextResponse<infer T>
  ? T
  : never;

export async function POST(
  _: Request,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  const state = crypto.randomUUID();
  const relativeRedirectUri = `/api/auth/${provider}/authenticate`;
  const absoluteRedirectUri = `${APP_ORIGIN}${relativeRedirectUri}`;

  const response = await authorize(provider, absoluteRedirectUri, state);

  const cookieStore = cookies();
  const oneHour = 3600;

  cookieStore.set({
    name: 'state',
    value: state,
    path: relativeRedirectUri,
    maxAge: oneHour,
    httpOnly: true,
  });

  return NextResponse.json(response, {
    status: response.code,
  });
}
