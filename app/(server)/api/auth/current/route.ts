import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';

export type PostAuthorizeResponse = Awaited<
  ReturnType<typeof GET>
> extends NextResponse<infer T>
  ? T
  : never;

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value || '';

  if (!token) {
    return NextResponse.json(
      { code: 200, message: 'OK', ok: true, data: null },
      {
        status: 200,
      }
    );
  }

  const response = await getCurrentAuthenticated(token);

  return NextResponse.json(response, {
    status: response.code,
  });
}
