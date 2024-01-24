import { NextRequest, NextResponse } from 'next/server';
import { eventService, roomService } from '../../_index';
import { cookies } from 'next/headers';
import { insertEvent } from '@/(server)/_features/event/schema';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { type AuthType } from '@/_shared/types/auth';

type CreateEvent = {
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
  host: string;
};

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  try {
    const response: AuthType.CurrentAuthResponse = await InternalApiFetcher.get(
      '/api/auth/current',
      {
        headers: {
          Authorization: `Bearer ${requestToken?.value || ''}`,
        },
        cache: 'no-cache',
      }
    );

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

    const body = (await request.json()) as CreateEvent;
    const eventName = body.name;
    const eventStartTime = new Date(body.startTime);
    const eventEndTime =
      body.endTime == '' || undefined
        ? new Date(eventStartTime.getTime() + (60 * 60 * 1000) / 2)
        : new Date(body.endTime);
    const eventDesc = body.description;
    const eventHost = body.host;

    if (typeof eventName !== 'string' || eventName.trim().length === 0) {
      return NextResponse.json({
        code: 400,
        ok: false,
        message: 'Name is not valid, please check the request body',
      });
    }

    if (!eventStartTime) {
      return NextResponse.json({
        code: 400,
        ok: false,
        message: 'Start time is not valid, please check the request body',
      });
    }

    if (
      !eventHost ||
      eventHost.trim().length === 0 ||
      typeof eventHost !== 'string'
    ) {
      return NextResponse.json({
        code: 400,
        ok: false,
        message: 'Event host is not valid, please check the request body',
      });
    }

    const eventRoom = await roomService.createRoom(user.id, 'event');

    const Event: typeof insertEvent = {
      name: eventName,
      startTime: eventStartTime,
      endTime: eventEndTime,
      slug: eventName.toLowerCase().replace(/\s/g, '-'),
      description: eventDesc,
      createdBy: user.id,
      roomId: eventRoom.id,
      host: eventHost,
    };

    const createdEvent = await eventService.createEvent(Event);
    return NextResponse.json({
      code: 201,
      ok: true,
      message: 'Event created successfully',
      data: createdEvent,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      code: 500,
      ok: false,
      message: 'Something went wrong, please try again later',
    });
  }
}
