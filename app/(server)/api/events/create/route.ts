import { NextRequest, NextResponse } from 'next/server';
import { eventService, roomService } from '../../_index';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';
import { cookies } from 'next/headers';
import { insertEvent } from '@/(server)/_features/event/schema';
import { writeFileSync } from 'fs';

type CreateEvent = {
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
  host: string;
  isPublished?: boolean;
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
    const formData = await request.formData();
    const eventMeta = JSON.parse(formData.get('data') as string) as CreateEvent;
    const eventImage = formData.get('image') as Blob;
    const eventName = eventMeta.name;
    const eventStartTime = new Date(eventMeta.startTime);
    const eventEndTime =
      eventMeta.endTime == '' || undefined
        ? new Date(eventStartTime.getTime() + (60 * 60 * 1000) / 2)
        : new Date(eventMeta.endTime);
    const eventDesc = eventMeta.description;
    const eventHost = eventMeta.host;

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

    const eventRoom = await roomService.createRoom(response.data.id, 'event');

    if (eventImage !== null) {
      const eventImageBuffer = await eventImage.arrayBuffer();
      const eventImageUint8Array = new Uint8Array(eventImageBuffer);

      writeFileSync(
        `$${process.env.STATIC_PATH}/images/event/${eventRoom.id}/poster.png`,
        eventImageUint8Array
      );
    }

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
