import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { eventRepo } from '../../_index';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');

  const getUserResp = await getCurrentAuthenticated(requestToken?.value || '');
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

  const events = await eventRepo.getShouldBeEndedEvents(
    user.id,
    'webinar',
    page,
    limit
  );

  if (events.meta.total_record === 0) {
    return NextResponse.json(
      {
        code: 404,
        ok: false,
        message: 'No events found',
        meta: events.meta,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      code: 200,
      ok: true,
      message: 'Successfully fetched events',
      data: events.data,
      meta: events.meta,
    },
    { status: 200 }
  );
}
