import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {
  addLog,
  aggregateRoomDuration,
} from '@/(server)/_features/activity-log/repository';

interface createActiviyRequest {
  name: string;
  meta: string;
}

interface RoomDurationMeta {
  roomID: string;
  clientID: string;
  clientName: string;
  joinTime: string;
  leaveTime: string;
  roomType: string;
}

const activityName = ['RoomDuration'];

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  try {
    const response = await getCurrentAuthenticated(requestToken?.value || '');
    const user = response.data ? response.data : null;
    const currentTime = new Date();

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

    if (body.name == 'RoomDuration') {
      const RoomDurationMeta: RoomDurationMeta = JSON.parse(body.meta);

      // Milliseconds accuracy
      const duration =
        new Date(RoomDurationMeta.leaveTime).getTime() -
        new Date(RoomDurationMeta.joinTime).getTime();

      // Adjust if time is not synchronized
      if (
        !isWithinTolerance(new Date(RoomDurationMeta.leaveTime), 5 * 60 * 1000)
      ) {
        RoomDurationMeta.leaveTime = currentTime.toISOString();
        RoomDurationMeta.joinTime = new Date(
          currentTime.getTime() - duration
        ).toISOString();
      }
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

export async function GET(request: NextRequest) {
  aggregateRoomDuration(1, 'event');

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

function isWithinTolerance(time: Date, tolerance: number): boolean {
  const currentDateTime = new Date();
  const timeDifference = Math.abs(currentDateTime.getTime() - time.getTime());
  return timeDifference <= tolerance;
}
