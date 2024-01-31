import { NextResponse } from 'next/server';
import { eventRepo, eventService, roomService } from '../../_index';
import { cookies } from 'next/headers';
import { insertEvent } from '@/(server)/_features/event/schema';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import * as Sentry from '@sentry/nextjs';
import { writeFiletoLocalStorage } from '@/(server)/_shared/utils/write-file-to-local-storage';

type CreateEvent = {
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
  host: string;
  isPublished?: boolean;
};

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
      isPublished: eventMeta.isPublished,
    };

    const createdEvent = await eventService.createEvent(Event);

    if (eventImage) {
      const roomStoragePath = process.env.ROOM_LOCAL_STORAGE_PATH || './volume';
      const path = `${roomStoragePath}/assets/images/event/${createdEvent.id}/poster.webp`;

      writeFiletoLocalStorage(path, eventImage);
      createdEvent.thumbnailUrl = `/assets/images/event/${createdEvent.id}/poster.webp`;
      const updatedEvent = eventRepo.updateEvent(
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

function ensureDirectoryExist(filePath: string) {
  const dir = dirname(filePath);
  if (existsSync(dir)) {
    return true;
  }
  ensureDirectoryExist(dir);
  mkdirSync(dir);
}
