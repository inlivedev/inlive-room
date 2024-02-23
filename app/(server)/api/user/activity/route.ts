import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { addLog } from '@/(server)/_features/activity-log/repository';
import { z } from 'zod';

const ActivityRequest = z.object({
  name: z.string(),
  meta: z.any(),
});

const RoomDurationMeta = z.object({
  roomID: z.string(),
  clientID: z.string(),
  name: z.string().optional(),
  joinTime: z.string().datetime({ offset: true }),
  leaveTime: z.string().datetime({ offset: true }),
  roomType: z.enum(['meeting', 'event']),
});

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

    const activity = ActivityRequest.parse(await request.json());

    if (!activityName.includes(activity.name)) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Invalid activity name, please check the request body',
        },
        { status: 400 }
      );
    }

    console.log(activity.meta);

    if (activity.name == 'RoomDuration') {
      const meta = RoomDurationMeta.parse(activity.meta);

      // Milliseconds accuracy
      const duration =
        new Date(meta.leaveTime).getTime() - new Date(meta.joinTime).getTime();

      // Adjust if time is not synchronized
      if (!isWithinTolerance(new Date(meta.leaveTime), 5 * 60 * 1000)) {
        meta.leaveTime = currentTime.toISOString();
        meta.joinTime = new Date(
          currentTime.getTime() - duration
        ).toISOString();
      }
    }

    const log = await addLog({
      name: activity.name,
      meta: activity.meta,
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
        message: error.message,
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
