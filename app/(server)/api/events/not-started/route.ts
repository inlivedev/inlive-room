import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { eventRepo } from '../../_index';
import * as Sentry from '@sentry/nextjs';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');

  try {
    const getUserResp = await getCurrentAuthenticated(
      requestToken?.value || ''
    );
    const user = getUserResp.data ? getUserResp.data : null;

    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          ok: false,
          message: 'Please check if token is provided in the cookie',
          meta: {
            current_page: 1,
            total_page: 1,
            per_page: 10,
            total_record: 0,
          },
        },
        { status: 401 }
      );
    }

    const { data, meta } = await eventRepo.getMyEvents(user.id, page, limit);

    return NextResponse.json(
      {
        code: 200,
        data,
        message: 'List of events retrieved successfully',
        meta,
        ok: true,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        code: 500,
        ok: false,
        message: 'Internal server error',
        meta: {
          current_page: 1,
          total_page: 1,
          per_page: 10,
          total_record: 0,
        },
      },
      { status: 500 }
    );
  }
}
