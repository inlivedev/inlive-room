import { NextResponse } from 'next/server';
import { eventRepo, eventService } from '../_index';
import { isError } from 'lodash-es';
import { cookies } from 'next/headers';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { insertEvent } from '@/(server)/_features/event/schema';

export async function GET(
  _: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  try {
    const existingEvent = await eventService.getEvent(slug);

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

  const response = await getCurrentAuthenticated(requestToken.value);

  if (!response.ok) {
    return NextResponse.json({
      code: 401,
      ok: false,
      message: 'Please check if token is provided in the cookie',
    });
  }

  try {
    const deletedEvent = await eventRepo.deleteEventBySlug(
      slug,
      response.data.id
    );

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
    name: string;
    startTime: string;
    description: string;
  };

  const body = (await request.json()) as updateEvent;
  const eventName = body.name;
  const eventStartTime = new Date(body.startTime);
  const eventDesc = body.description;

  if (!requestToken) {
    return NextResponse.json(
      {
        code: 401,
        message: 'Please check if token is provided in the cookie',
      },
      { status: 401 }
    );
  }

  const response = await getCurrentAuthenticated(requestToken.value);

  if (!response.ok) {
    return NextResponse.json({
      code: 401,
      ok: false,
      message: 'Please check if token is provided in the cookie',
    });
  }

  try {
    const newEvent: typeof insertEvent = {
      name: eventName,
      startTime: eventStartTime,
      slug: eventName.toLowerCase().replace(/\s/g, '-') + '-' + generateID(8),
      description: eventDesc,
      createdBy: response.data.id,
    };
    const updatedEvent = await eventRepo.updateEventBySlug(
      response.data.id,
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
