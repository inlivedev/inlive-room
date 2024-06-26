import { NextResponse } from 'next/server';
import { eventRepo, eventService, roomService } from '../../_index';
import { cookies } from 'next/headers';
import { insertEvent } from '@/(server)/_features/event/schema';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import * as Sentry from '@sentry/nextjs';
import { writeFiletoLocalStorage } from '@/(server)/_shared/utils/write-file-to-local-storage';
import { whitelistFeature } from '@/_shared/utils/flag';
import * as z from 'zod';
import { selectRoom } from '@/(server)/_features/room/schema';
import { generateID } from '@/(server)/_shared/utils/generateid';

const CreateEventSchema = z.object({
  name: z.string().max(255),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
  maximumSlots: z.number().max(100).int().optional(),
  type: z.enum(['webinar', 'meeting']),
});

const EVENT_TRIAL_COUNT = parseInt(
  process.env.NEXT_PUBLIC_EVENT_TRIAL_COUNT || '3'
);
const eventTypeMap: Record<string, number> = {
  webinar: 1,
  meeting: 2,
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
    const jsonBody = JSON.parse(formData.get('data') as string);
    const eventMeta = CreateEventSchema.parse(jsonBody);
    const eventImage = formData.get('image') as Blob;
    const eventStartTime = new Date(eventMeta.startTime);
    const eventEndTime =
      eventMeta.endTime == '' || undefined
        ? new Date(eventStartTime.getTime() + (60 * 60 * 1000) / 2)
        : new Date(eventMeta.endTime);
    const eventDesc = eventMeta.description;

    eventStartTime.setUTCSeconds(0);
    eventStartTime.setUTCMilliseconds(0);
    eventEndTime.setUTCSeconds(0);
    eventEndTime.setUTCMilliseconds(0);

    if (eventMeta.name.trim().length === 0) {
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
      eventMeta.status == 'published' &&
      !whitelistFeature.includes('event') &&
      eventMeta.type == 'webinar'
    ) {
      {
        if (!user.whitelistFeature.includes('event')) {
          // check if have created more than 3 events
          const { value } = await eventRepo.countNonDraftEvents(user.id);
          if (value >= EVENT_TRIAL_COUNT) {
            return NextResponse.json(
              {
                code: 403,
                ok: false,
                message: 'You have reached the limit of creating events',
              },
              { status: 403 }
            );
          }
        }
      }
    }

    let eventRoom: selectRoom | null = null;

    if (eventMeta.status == 'published') {
      const type = eventMeta.type === 'webinar' ? 'event' : eventMeta.type;
      eventRoom = await roomService.createRoom(user.id, type);
    }

    const Event: insertEvent = {
      status: eventMeta.status,
      name: eventMeta.name,
      startTime: eventStartTime,
      endTime: eventEndTime,
      slug: eventMeta.name.toLowerCase().replace(/\s/g, '-'),
      description: eventDesc,
      createdBy: user.id,
      roomId: eventRoom?.id,
      maximumSlots: eventMeta.maximumSlots || null,
      categoryID: eventTypeMap[eventMeta.type],
    };

    const createdEvent = await eventService.createEvent(Event);

    if (eventImage) {
      const roomStoragePath =
        process.env.ROOM_LOCAL_STORAGE_PATH || './storage';
      const path = `${roomStoragePath}/assets/images/events/${createdEvent.id}/poster.webp`;

      writeFiletoLocalStorage(path, eventImage);
      createdEvent.thumbnailUrl = `/assets/images/events/${createdEvent.id}/poster.webp`;
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

    // Register Event Creator as Participant
    eventRepo.registerParticipant({
      clientId: generateID(12),
      firstName: user.name,
      lastName: '',
      email: user.email,
      eventID: createdEvent.id,
      roleID: 2,
    });

    return NextResponse.json({
      code: 201,
      ok: true,
      message: 'Event created successfully',
      data: createdEvent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          code: 400,
          ok: false,
          message: error.errors,
        },
        { status: 400 }
      );
    }

    Sentry.captureException(error);
    return NextResponse.json(
      {
        code: 500,
        ok: false,
        message: `Something went wrong, please try again later`,
      },
      { status: 500 }
    );
  }
}
