import { eventRepo } from '../_index';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '0');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const creator = searchParams.get('created_by')?.trim();

  let creatorId: number | undefined;

  if (!creator) {
    creatorId = undefined;
  } else {
    creatorId = parseInt(creator);
  }

  try {
    const events = await eventRepo.getEvents(page, limit, creatorId);

    if (events.length === 0) {
      return NextResponse.json({
        status: 404,
        body: {
          message: 'No events found',
        },
      });
    }

    return NextResponse.json({
      status: 200,
      body: {
        events,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({
      status: 500,
      body: {
        message:
          'an error occured while retrieveng the events please try again later',
      },
    });
  }
}
