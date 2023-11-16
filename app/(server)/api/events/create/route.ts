import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '../_index';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';
import { cookies } from 'next/headers';
import { insertEvent } from '@/(server)/_features/event/schema';

type CreateEvent = {
  name: string;
  startTime: string;
  description: string;
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
    const eventDesc = body.description;

    if (typeof eventName !== 'string' || eventName.trim().length === 0) {
      return NextResponse.json({
        code: 400,
        ok: false,
        message: 'Name is not valid',
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

    const Event: typeof insertEvent = {
      name: eventName,
      startTime: eventStartTime,
      slug: eventName.toLowerCase().replace(/\s/g, '-'),
      description: eventDesc,
      createdBy: response.data.id,
    };

    eventService.createEvent(Event);
  } catch (error) {
    console.error(error);
  }
}
