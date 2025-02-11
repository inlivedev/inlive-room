import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { eventRepo } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const slugOrId = decodeURIComponent((await params).slugOrId);
  const cookieStore = await cookies();
  const requestToken = cookieStore.get('token');
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');

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

    const event = await eventRepo.getBySlugOrID(slugOrId, undefined);

    if (!event) {
      return NextResponse.json(
        {
          code: 404,
          message: 'event not found',
          ok: false,
        },
        { status: 404 }
      );
    }

    if (user?.id !== event?.createdBy) {
      return NextResponse.json(
        {
          code: 401,
          message: 'unauthorized',
          ok: false,
        },
        { status: 401 }
      );
    }

    const res = await eventRepo.getRegisteredParticipants(slugOrId, {
      page,
      limit,
    });

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
