import { NextRequest, NextResponse } from 'next/server';
import { eventService, roomService } from '../../_index';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';
import { cookies } from 'next/headers';
import { insertEvent } from '@/(server)/_features/event/schema';

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

  if (!requestToken) {
    return NextResponse.json(
      {
        code: 401,
        message: 'Please check if token is provided in the cookie',
      },
      { status: 401 }
    );
  }

  try {
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

    const response = await getCurrentAuthenticated(requestToken.value);

    if (!response.ok) {
      return NextResponse.json({
        code: 401,
        ok: false,
        message: 'Please check if token is provided in the cookie',
      });
    }

    const eventRoom = await roomService.createRoom(response.data.id);

    const Event: typeof insertEvent = {
      name: eventName,
      startTime: eventStartTime,
      endTime: eventEndTime,
      slug: eventName.toLowerCase().replace(/\s/g, '-'),
      description: eventDesc,
      createdBy: response.data.id,
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
