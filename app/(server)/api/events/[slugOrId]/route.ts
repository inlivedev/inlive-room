import { NextRequest, NextResponse } from 'next/server';
import { eventRepo, eventService } from '../../_index';
import { isError } from 'lodash-es';
import { cookies } from 'next/headers';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { insertEvent } from '@/(server)/_features/event/schema';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { writeFiletoLocalStorage } from '@/(server)/_shared/utils/write-file-to-local-storage';
import { existsSync, unlinkSync } from 'fs';

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

    if (existingEvent?.isPublished) {
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
      existingEvent?.isPublished === false
    ) {
      return NextResponse.json(
        {
          code: 404,
          message: "Event doesn't exist",
        },
        { status: 404 }
      );
    }

    if (
      existingEvent?.createdBy !== userID &&
      existingEvent?.isPublished === false
    ) {
      return NextResponse.json(
        {
          code: 404,
          message: "Event doesn't exist",
        },
        { status: 404 }
      );
    }

    if (!existingEvent) {
      return NextResponse.json(
        {
          code: 404,
          message: 'Event not found',
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
    return NextResponse.json({
      code: 401,
      ok: false,
      message: 'Please check if token is provided in the cookie',
    });
  }

  try {
    const deletedEvent = await eventRepo.deleteEventBySlug(slugOrId, user.id);

    if (!deletedEvent || deletedEvent.length == 0) {
      return NextResponse.json({
        code: 404,
        ok: false,
        message: 'Event not found',
      });
    }

    return NextResponse.json({
      code: 200,
      ok: true,
      message: 'Event deleted successfully',
      data: deletedEvent,
    });
  } catch (error) {
    return NextResponse.json({
      code: 500,
      ok: false,
      message: 'An error has occured on our side please try again later',
    });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  const slugOrId = params.slugOrId;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  type updateEvent = {
    name?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    host?: string;
    isPublished?: boolean;
    deleteImage?: boolean;
  };

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
    return NextResponse.json({
      code: 401,
      ok: false,
      message: 'Please check if token is provided in the cookie',
    });
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
      return NextResponse.json({
        code: 401,
        ok: false,
        message: 'You are not authorized to update this event',
      });

    const formData = await request.formData();
    const updateEventMeta = JSON.parse(
      formData.get('data') as string
    ) as updateEvent;
    const eventImage = formData.get('image') as Blob;

    const newEvent: typeof insertEvent = {
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
      isPublished: updateEventMeta.isPublished,
    };

    if (eventImage) {
      // update image
      const path = `${process.env.ROOM_PERSISTANT_VOLUME_PATH}/assets/images/event/${oldEvent.id}/poster.webp`;
      writeFiletoLocalStorage(path, eventImage);
      newEvent.thumbnailUrl = path;
    }

    if (updateEventMeta.deleteImage) {
      // delete image
      const path = `${process.env.ROOM_PERSISTANT_VOLUME_PATH}/assets/images/event/${oldEvent.id}/poster.webp`;
      if (existsSync(path)) {
        unlinkSync(path);
      }

      newEvent.thumbnailUrl = null;
    }

    const updatedEvent = await eventRepo.updateEvent(
      user.id,
      oldEvent.id,
      newEvent
    );

    if (updatedEvent.length == 0) {
      return NextResponse.json({
        code: 404,
        ok: false,
        message: 'Event not found',
      });
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