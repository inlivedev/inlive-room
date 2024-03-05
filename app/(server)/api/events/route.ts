import { eventRepo } from '../_index';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { HTTPResponse } from '@/_shared/types/types';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  let isAfter = searchParams.get('is_after')?.trim();
  let isBefore = searchParams.get('is_before')?.trim();
  const isPublished = searchParams.get('is_published')?.trim();

  let isAfterParsed: Date | undefined = undefined;
  let isBeforeParsed: Date | undefined = undefined;
  let isPublishedParsed: boolean | undefined = undefined;

  try {
    if (isAfter) {
      isAfter = z.string().datetime().parse(isAfter);
      isAfterParsed = new Date(isAfter);
    }

    if (isBefore) {
      isBefore = z.string().datetime().parse(isBefore);
      isBeforeParsed = new Date(isBefore);
    }

    if (isPublished) {
      isPublishedParsed = z
        .string()
        .toLowerCase()
        .transform((x) => x === 'true')
        .pipe(z.boolean())
        .parse(isPublished);
    }

    const getUserResp = await getCurrentAuthenticated(
      requestToken?.value || ''
    );
    const user = getUserResp.data ? getUserResp.data : null;

    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          ok: false,
          message: 'Please check if token is provided in the cookie',
          meta: {
            current_page: 1,
            total_page: 0,
            per_page: 10,
            total_record: 0,
          },
        },
        { status: 401 }
      );
    }

    const { data, pageMeta } = await eventRepo.getEvents(
      page,
      limit,
      user?.id,
      isAfterParsed,
      isBeforeParsed,
      isPublishedParsed
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
        message: `an error occured while retrieveng the events please try again later`,
      },
    });
  }
}
