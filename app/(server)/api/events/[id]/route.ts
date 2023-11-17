import { cookies } from 'next/headers';
import { eventRepo } from '../_index';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';
import { NextResponse } from 'next/server';
import { insertEvent } from '@/(server)/_features/event/schema';
import { generateID } from '@/(server)/_shared/utils/generateid';

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
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
    const deletedEvent = await eventRepo.deleteEvent(
      parseInt(id.trim()),
      response.data.id
    );
    if (!deletedEvent) {
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
  { params }: { params: { id: string } }
) {
  const id = params.id;
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
    const updatedEvent = await eventRepo.updateEvent(
      response.data.id,
      parseInt(id.trim()),
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
