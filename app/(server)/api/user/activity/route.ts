import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { addLog } from '@/(server)/_features/activity-log/repository';
import { z } from 'zod';

const persistentRoom = process.env.NEXT_PUBLIC_PERSISTENT_DATA === 'true';

const ActivityRequest = z.object({
  name: z.string(),
  meta: z.any(),
});

const RoomDurationMeta = z.object({
  roomID: z.string(),
  clientID: z.string(),
  name: z.string().optional(),
  joinTime: z
    .string()
    .datetime({ offset: true })
    .transform((val) => new Date(val)),
  leaveTime: z
    .string()
    .datetime({ offset: true })
    .transform((val) => new Date(val)),
  roomType: z.enum(['meeting', 'event']),
  duration: z.number().default(0),
  trigger: z.enum(['beforeunload', 'leave-button']),
});

const activityName = ['RoomDuration'];

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  try {
    if (!persistentRoom) {
      throw new Error('This feature is not enabled');
    }

    const response = await getCurrentAuthenticated(requestToken?.value || '');
    const user = response.data ? response.data : null;
    const currentTime = new Date();

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

    let meta: any;

    if (activity.name == 'RoomDuration') {
      const parsedMeta = RoomDurationMeta.parse(activity.meta);
      meta = parsedMeta;

      // Milliseconds accuracy
      const duration =
        new Date(parsedMeta.leaveTime).getTime() -
        new Date(parsedMeta.joinTime).getTime();

      parsedMeta.duration = duration;

      // Adjust if time is not synchronized
      if (isWithinTolerance(parsedMeta.leaveTime, 5 * 60 * 1000)) {
        parsedMeta.leaveTime = currentTime;
        parsedMeta.joinTime = new Date(currentTime.getTime() - duration);
      }
    }

    const log = await addLog({
      name: activity.name,
      meta: meta,
      createdBy: user ? user.id : null,
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
