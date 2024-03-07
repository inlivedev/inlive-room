import { NextRequest, NextResponse } from 'next/server';
import { eventRepo, eventService } from '../../_index';
import { isError } from 'lodash-es';
import { cookies } from 'next/headers';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { insertEvent } from '@/(server)/_features/event/schema';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { writeFiletoLocalStorage } from '@/(server)/_shared/utils/write-file-to-local-storage';
import { stat, unlink } from 'fs';
import * as Sentry from '@sentry/nextjs';
import { whitelistFeature } from '@/_shared/utils/flag';
import * as z from 'zod';
const roomStoragePath = process.env.ROOM_LOCAL_STORAGE_PATH || './storage';
const EVENT_TRIAL_COUNT = parseInt(
  process.env.NEXT_PUBLIC_EVENT_TRIAL_COUNT || '3'
);

export const updateEventSchema = z.object({
  name: z.string().max(255),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  description: z.string(),
  host: z.string().max(255),
  status: z.enum(['draft', 'published', 'cancelled']),
  deleteImage: z
    .string()
    .toLowerCase()
    .transform((x) => x === 'true')
    .pipe(z.boolean()),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slugOrId: string } }
) {
  const slug = params.slugOrId;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
  try {
    let userID = undefined;

    if (requestToken) {
      const response = await getCurrentAuthenticated(requestToken?.value || '');
      const user = response.data ? response.data : null;

      if (user) {
        userID = user.id;
      }
    }

    const existingEvent = await eventService.getEventBySlugOrID(slug, userID);

    if (!existingEvent) {
      return NextResponse.json(
        {
          code: 404,
          message: 'Event not found',
        },
        { status: 404 }
      );
    }

    if (
      existingEvent.status !== 'published' &&
      existingEvent.createdBy !== userID
    ) {
      return NextResponse.json(
        {
          code: 200,
          message: 'Event found',
          data: existingEvent,
        },
        { status: 200 }
      );
    }

    if (
      existingEvent?.createdBy !== userID &&
      existingEvent?.status !== 'published'
    ) {
      return NextResponse.json(
        {
          code: 404,
          message: "Event doesn't exist",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        code: 200,
        message: 'Event found',
        data: existingEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    if (!isError(error)) {
      const response = {
        code: 500,
        message: 'an error has occured on our side please try again later',
      };

      return NextResponse.json(response, { status: 500 });
    }

    const response = {
      code: 500,
      message: error.message,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
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
        message: 'Please check if token is provided in the cookie',
      },
      { status: 401 }
    );
  }

  try {
    const event = await eventService.getEventBySlugOrID(slugOrId, user.id);

    if (!event) {
      return NextResponse.json(
        {
          code: 404,
          ok: false,
          message: 'Event not found',
        },
        { status: 404 }
      );
    }

    if (event.status !== 'draft') {
      return NextResponse.json(
        {
          code: 400,
          ok: false,
          message: 'You can only delete draft events',
        },
        { status: 400 }
      );
    }

    const deletedEvent = await eventRepo.deleteEventBySlug(slugOrId, user.id);

    if (!deletedEvent || deletedEvent.length == 0) {
      return NextResponse.json(
        {
          code: 404,
          ok: false,
          message: 'Event not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        code: 200,
        ok: true,
        message: 'Event deleted successfully',
        data: deletedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
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

export async function PUT(
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

    if (oldEvent.createdBy !== user.id)
      return NextResponse.json(
        {
          code: 401,
          ok: false,
          message: 'You are not authorized to update this event',
        },
        { status: 401 }
      );

    const formData = await request.formData();
    const updateEventMeta = updateEventSchema.parse(
      formData.get('data') as string
    );
    const eventImage = formData.get('image') as Blob;

    const newEvent: insertEvent = {
      name: updateEventMeta.name ?? oldEvent.name,
      startTime: new Date(updateEventMeta.startTime || oldEvent.startTime),
      endTime: new Date(updateEventMeta.endTime || oldEvent.endTime),
      slug: updateEventMeta.name
        ? updateEventMeta.name.toLowerCase().replace(/\s/g, '-') +
          '-' +
          generateID(8)
        : oldEvent.slug,
      description: updateEventMeta.description ?? oldEvent.description,
      host: updateEventMeta.host ?? oldEvent.host,
      createdBy: oldEvent.createdBy,
      roomId: oldEvent.roomId,
      status: updateEventMeta.status,
    };

    if (
      !whitelistFeature.includes('event') &&
      newEvent.status === 'published'
    ) {
      if (!user.whitelistFeature.includes('event')) {
        const { value } = await eventRepo.countNonDraftEvents(user.id);
        if (value >= EVENT_TRIAL_COUNT && oldEvent.status !== 'published') {
          return NextResponse.json(
            {
              code: 403,
              ok: false,
              message:
                'You have reached the limit of creating published events',
            },
            { status: 403 }
          );
        }
      }
    }

    switch (oldEvent.status) {
      case 'published':
        if (newEvent.status === 'draft') {
          return NextResponse.json(
            {
              code: 400,
              ok: false,
              message: 'You cannot change a published event to draft',
            },
            { status: 400 }
          );
        }
      case 'cancelled':
        if (newEvent.status === 'draft' || newEvent.status === 'published') {
          return NextResponse.json(
            {
              code: 400,
              ok: false,
              message:
                'You cannot change a cancelled event to draft or published',
            },
            { status: 400 }
          );
        }
        break;
    }

    if (newEvent.name === oldEvent.name) {
      newEvent.slug = oldEvent.slug;
    }

    if (updateEventMeta.deleteImage) {
      // delete image
      const path = `${roomStoragePath}/assets/images/events/${oldEvent.id}/poster.webp`;
      stat(path, function (err) {
        if (err) {
          Sentry.captureException(err);
          return;
        }

        unlink(path, function (err) {
          if (err) {
            Sentry.captureException(err);
            return;
          }
          newEvent.thumbnailUrl = undefined;
        });
      });
    } else {
      newEvent.thumbnailUrl = oldEvent.thumbnailUrl;
    }

    if (eventImage) {
      // update image
      const path = `/assets/images/events/${oldEvent.id}/poster.webp`;
      const storagePath = `${roomStoragePath}${path}`;
      writeFiletoLocalStorage(storagePath, eventImage);
      newEvent.thumbnailUrl = path;
    }

    const updatedEvent = await eventRepo.updateEvent(
      user.id,
      oldEvent.id,
      newEvent
    );

    if (!updatedEvent) {
      return NextResponse.json(
        {
          code: 404,
          ok: false,
          message: 'Event not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        code: 200,
        ok: true,
        message: 'Event updated successfully',
        data: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
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
