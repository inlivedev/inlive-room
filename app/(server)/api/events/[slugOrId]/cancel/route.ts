import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { eventService, eventRepo, roomRepo } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  const slugOrId = params.slugOrId;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  if (!requestToken) {
    return NextResponse.json(
      {
        code: 401,
        message: 'Please check if token is provided in the cookie',
      },
      { status: 401 }
    );
  }

  const response = await getCurrentAuthenticated(requestToken?.value || '');
  const user = response.data ? response.data : null;

  if (!user) {
    return NextResponse.json(
      {
        code: 401,
        ok: false,
        message:
          'User not found, please check if token is provided in the cookie is valid',
      },
      { status: 401 }
    );
  }

  try {
    const oldEvent = await eventService.getEventBySlugOrID(slugOrId, user.id);

    if (!oldEvent) {
      return NextResponse.json(
        {
          code: 404,
          ok: false,
          message: 'Event not found',
        },
        { status: 404 }
      );
    }

    if (oldEvent.roomId) {
      roomRepo.removeRoom(oldEvent.roomId, user.id);
      oldEvent.roomId = null;
    }
    oldEvent.isCanceled = true;

    const updatedEvent = await eventRepo.updateEvent(
      user.id,
      oldEvent.id,
      oldEvent
    );

    return NextResponse.json(
      {
        code: 200,
        ok: true,
        message: 'Event has been canceled',
        data: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        code: 500,
        ok: false,
        message: 'An error has occured on our side please try again later',
      },
      { status: 500 }
    );
  }
}
