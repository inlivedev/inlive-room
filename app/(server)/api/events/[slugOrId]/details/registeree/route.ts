import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { eventRepo } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  const slugOrId = params.slugOrId;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  try {
    if (!requestToken) {
      return NextResponse.json(
        {
          code: 401,
          message: 'please check your authentication token',
        },
        { status: 401 }
      );
    }

    const response = await getCurrentAuthenticated(requestToken?.value);
    const user = response.data ? response.data : null;

    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          message: 'unauthorized',
        },
        { status: 401 }
      );
    }

    const res = await eventRepo.getRegisteredParticipants(slugOrId, user.id);

    if (res.data.length === 0) {
      return NextResponse.json(
        {
          code: 404,
          message: 'not found',
          ok: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: res.data,
        meta: res.meta,
        message: 'success',
        ok: true,
      },
      { status: 200 }
    );
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json(
      {
        code: 500,
        message: 'internal server error',
        ok: false,
      },
      { status: 500 }
    );
  }
}
