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
  let startIsAfter = searchParams.get('start_is_after')?.trim();
  let startIsBefore = searchParams.get('start_is_before')?.trim();
  let endIsAfter = searchParams.get('end_is_after')?.trim();
  let endIsBefore = searchParams.get('end_is_before')?.trim();
  const status = searchParams.getAll('status[]');
  const type = searchParams.getAll('type[]');

  let isStartAfterParsed: Date | undefined = undefined;
  let isStartBeforeParsed: Date | undefined = undefined;
  let isEndStartAfterParsed: Date | undefined = undefined;
  let isEndBeforeParsed: Date | undefined = undefined;
  let statusParsed: Array<string> | undefined;
  const typeParsed = z.array(z.string()).parse(type);
  try {
    if (startIsAfter) {
      startIsAfter = z.string().datetime().parse(startIsAfter);
      isStartAfterParsed = new Date(startIsAfter);
    }

    if (startIsBefore) {
      startIsBefore = z.string().datetime().parse(startIsBefore);
      isStartBeforeParsed = new Date(startIsBefore);
    }

    if (endIsAfter) {
      endIsAfter = z.string().datetime().parse(endIsAfter);
      isEndStartAfterParsed = new Date(endIsAfter);
    }

    if (endIsBefore) {
      endIsBefore = z.string().datetime().parse(endIsBefore);
      isEndBeforeParsed = new Date(endIsBefore);
    }

    if (status) {
      statusParsed = z
        .string()
        .array()
        .refine(
          (val: Array<string>) => {
            const Valid = ['draft', 'published', 'cancelled', 'completed'];

            for (let i = 0; i < val.length; i++) {
              if (!Valid.includes(val[i])) {
                return false;
              }
            }
            return true;
          },
          { message: 'status can only be draft, published, and cancelled' }
        )
        .parse(status);
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
            total_page: 1,
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
      statusParsed,
      isStartAfterParsed,
      isStartBeforeParsed,
      isEndStartAfterParsed,
      isEndBeforeParsed,
      typeParsed
    );

    const response: HTTPResponse = {
      code: 200,
      data,
      message: 'List of events retrieved successfully',
      meta: pageMeta,
      ok: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      Sentry.captureException(error);
      return NextResponse.json({
        status: 400,
        body: {
          message: error.errors,
        },
      });
    }

    Sentry.captureException(error);
    return NextResponse.json({
      status: 500,
      body: {
        message: `an error occured while retrieveng the events please try again later`,
      },
    });
  }
}
