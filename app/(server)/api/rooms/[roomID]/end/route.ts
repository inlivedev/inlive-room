import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { eventRepo, roomRepo } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST(
  request: NextRequest,
  { params }: { params: { roomID: string } }
) {
  const slugOrId = params.roomID;
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

    const room = await roomRepo.getRoomById(slugOrId);

    if (!room) {
      return NextResponse.json(
        {
          code: 404,
          message: 'room not found',
        },
        { status: 404 }
      );
    }

    if (room?.meta.type === 'event') {
      const event = await eventRepo.getByRoomID(room.id);
      if (event) {
        event.endTime = new Date();
        event.status = 'completed';
        const newEvent = await eventRepo.updateEvent(user.id, event.id, event);

        return NextResponse.json(
          {
            code: 200,
            message: 'event ended',
            data: newEvent,
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        code: 200,
        message: 'normal room ended',
        data: room,
      },
      { status: 200 }
    );
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json(
      {
        code: 500,
        message: 'internal server error',
      },
      { status: 500 }
    );
  }
}
