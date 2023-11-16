import { isError } from 'lodash-es';
import { eventService } from './_index';
import { NextResponse } from 'next/server';
import { captureException } from '@sentry/nextjs/types/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '1');
  const creator = searchParams.get('created_by')?.trim();

  let creatorId: number | undefined;

  // If creator doesn't exist, set it to undefined
  if (!creator) {
    creatorId = undefined;
  } else {
    creatorId = parseInt(creator);
  }

  try {
    const events = await eventService.getEvents(page, limit, creatorId);

    return NextResponse.json({
      status: 200,
      body: {
        events,
      },
    });
  } catch (error) {
    if (isError(error) && error === eventService.error.get('EVENT_NOT_FOUND')) {
      return NextResponse.json({
        status: 404,
        body: {
          message: error.message,
        },
      });
    }

    captureException(error);
    return NextResponse.json({
      status: 500,
      body: {
        message:
          'an error occured while retrieveng the events please try again later',
      },
    });
  }
}
