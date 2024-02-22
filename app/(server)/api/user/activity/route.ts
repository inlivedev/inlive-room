import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { addLog } from '@/(server)/_features/activity-log/repository';

interface createActiviyRequest {
  name: string;
  meta: string;
}

const activityName = ['RoomDuration'];

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  try {
    const response = await getCurrentAuthenticated(requestToken?.value || '');
    const user = response.data ? response.data : null;

    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          ok: false,
          message: 'Please check if token is provided in the cookie',
        },
        { status: 401 }
      );
    }
    const body = (await request.json()) as createActiviyRequest;

    if (!activityName.includes(body.name)) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Invalid activity name, please check the request body',
        },
        { status: 400 }
      );
    }

    const log = await addLog({
      name: body.name,
      meta: body.meta,
      createdBy: user.id,
    });

    return NextResponse.json(
      {
        code: 201,
        message: 'Activity logged',
        data: log,
      },
      { status: 201 }
    );
  } catch (e) {
    const error = e as Error;
    Sentry.captureException(error);

    return NextResponse.json(
      {
        code: 500,
        message: `An error has occured on our side, please try again later : ${error.message}`,
      },
      { status: 500 }
    );
  }
}
