import { eventRepo } from '../_index';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { HTTPResponse } from '@/_shared/types/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const creator = searchParams.get('created_by')?.trim();

  let creatorId: number | undefined;

  if (!creator) {
    creatorId = undefined;
  } else {
    creatorId = parseInt(creator);
  }

  try {
    const { data, pageMeta } = await eventRepo.getEvents(
      page,
      limit,
      creatorId
    );

    if (data.length === 0) {
      const response: HTTPResponse = {
        code: 404,
        data: [],
        message: 'No events found',
        meta: pageMeta,
        ok: true,
      };

      return NextResponse.json(response);
    }

    const response: HTTPResponse = {
      code: 200,
      data,
      message: 'Events retrieved successfully',
      meta: pageMeta,
      ok: true,
    };

    return NextResponse.json(response);
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
