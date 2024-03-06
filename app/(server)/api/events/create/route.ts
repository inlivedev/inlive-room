import { NextResponse } from 'next/server';
import { eventRepo, eventService, roomService } from '../../_index';
import { cookies } from 'next/headers';
import { insertEvent } from '@/(server)/_features/event/schema';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import * as Sentry from '@sentry/nextjs';
import { writeFiletoLocalStorage } from '@/(server)/_shared/utils/write-file-to-local-storage';
import { whitelistFeature } from '@/_shared/utils/flag';

type CreateEvent = {
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
  host: string;
  isPublished?: boolean;
};

const EVENT_TRIAL_COUNT = parseInt(
  process.env.NEXT_PUBLIC_EVENT_TRIAL_COUNT || '3'
);

export async function POST(req: Request) {
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

    if (
      // Check if event feature is exclusive or not
      !whitelistFeature.includes('event') === true
    ) {
      if (!user.whitelistFeature.includes('event')) {
        // check if have created more than 3 events
        const { value } = await eventRepo.countAllPublishedEvents(user.id);
        if (value >= EVENT_TRIAL_COUNT) {
          return NextResponse.json({
            code: 403,
            ok: false,
            message: 'You have reached the limit of creating events',
          });
        }
      }
    }

    const formData = await req.formData();
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

    eventStartTime.setUTCSeconds(0);
    eventStartTime.setUTCMilliseconds(0);
    eventEndTime.setUTCSeconds(0);
    eventEndTime.setUTCMilliseconds(0);

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

    const Event: insertEvent = {
      name: eventName,
      startTime: eventStartTime,
      endTime: eventEndTime,
      slug: eventName.toLowerCase().replace(/\s/g, '-'),
      description: eventDesc,
      createdBy: user.id,
      roomId: eventRoom.id,
      host: eventHost,
      isPublished: eventMeta.isPublished,
    };

    const createdEvent = await eventService.createEvent(Event);

    if (eventImage) {
      const roomStoragePath =
        process.env.ROOM_LOCAL_STORAGE_PATH || './storage';
      const path = `${roomStoragePath}/assets/images/event/${createdEvent.id}/poster.webp`;

      writeFiletoLocalStorage(path, eventImage);
      createdEvent.thumbnailUrl = `/assets/images/event/${createdEvent.id}/poster.webp`;
      const updatedEvent = await eventRepo.updateEvent(
        user.id,
        createdEvent.id,
        createdEvent
      );

      return NextResponse.json(
        {
          code: 201,
          ok: true,
          message: 'Event created successfully',
          data: updatedEvent,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({
      code: 201,
      ok: true,
      message: 'Event created successfully',
      data: createdEvent,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        code: 500,
        ok: false,
        message: 'Something went wrong, please try again later',
      },
      { status: 500 }
    );
  }
}
