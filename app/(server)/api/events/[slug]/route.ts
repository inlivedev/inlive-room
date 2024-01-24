import { NextResponse } from 'next/server';
import { eventRepo, eventService } from '../../_index';
import { isError } from 'lodash-es';
import { cookies } from 'next/headers';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { insertEvent } from '@/(server)/_features/event/schema';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { type AuthType } from '@/_shared/types/auth';

export async function GET(
  _: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
  try {
    let userID = undefined;

    if (requestToken) {
      const response: AuthType.CurrentAuthResponse =
        await InternalApiFetcher.get('/api/auth/current', {
          headers: {
            Authorization: `Bearer ${requestToken?.value || ''}`,
          },
          cache: 'no-cache',
        });

      const user = response.data ? response.data : null;

      if (user) {
        userID = user.id;
      }
    }

    const existingEvent = await eventService.getEvent(slug, userID);

    if (!existingEvent) {
      return NextResponse.json({
        code: 404,
        message: 'Event not found',
      });
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
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
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
    return NextResponse.json({
      code: 401,
      ok: false,
      message: 'Please check if token is provided in the cookie',
    });
  }

  try {
    const deletedEvent = await eventRepo.deleteEventBySlug(slug, user.id);

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
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  type updateEvent = {
    name?: string;
    startTime?: string;
    description?: string;
    host?: string;
    endTime?: string;
  };

  const body = (await request.json()) as updateEvent;
  const eventName = body.name;
  const eventDesc = body.description;
  const eventHost = body.host;

  if (!requestToken) {
    return NextResponse.json(
      {
        code: 401,
        message: 'Please check if token is provided in the cookie',
      },
      { status: 401 }
    );
  }

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
    return NextResponse.json({
      code: 401,
      ok: false,
      message: 'Please check if token is provided in the cookie',
    });
  }

  try {
    const oldEvent = await eventRepo.getEvent(slug);

    if (oldEvent.createdBy !== user.id)
      return NextResponse.json({
        code: 401,
        ok: false,
        message: 'You are not authorized to update this event',
      });

    const newEvent: typeof insertEvent = {
      name: eventName ?? oldEvent.name,
      startTime: body.startTime ? new Date(body.startTime) : oldEvent.startTime,
      endTime: body.endTime ? new Date(body.endTime) : oldEvent.endTime,
      slug: eventName
        ? eventName.toLowerCase().replace(/\s/g, '-') + '-' + generateID(8)
        : oldEvent.slug,
      description: eventDesc ?? oldEvent.description,
      createdBy: oldEvent.createdBy,
      roomId: oldEvent.roomId,
      host: eventHost ?? oldEvent.host,
    };

    const updatedEvent = await eventRepo.updateEventBySlug(
      user.id,
      slug,
      newEvent
    );
    if (updatedEvent.length == 0) {
      return NextResponse.json({
        code: 404,
        ok: false,
        message: 'Event not found',
      });
    }

    return NextResponse.json({
      code: 200,
      ok: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    return NextResponse.json({
      code: 500,
      ok: false,
      message: 'An error has occured on our side please try again later',
    });
  }
}
