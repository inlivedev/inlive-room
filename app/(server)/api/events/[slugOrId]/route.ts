import { NextRequest, NextResponse } from 'next/server';
import { eventService } from '../../_index';
import { isError } from 'lodash-es';
import { cookies } from 'next/headers';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const slug = decodeURIComponent((await params).slugOrId);
  const cookieStore = await cookies();
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

    const existingEvent = await eventService.getEventBySlugOrID(slug);

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
      existingEvent.status === 'draft' &&
      existingEvent.createdBy !== userID
    ) {
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
