import { NextResponse } from 'next/server';
import { eventRepo } from '../../_index';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
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

  const res = await eventRepo.getUpcomingEvents(6);

  return NextResponse.json(res);
}
