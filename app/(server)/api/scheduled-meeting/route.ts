import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import * as z from 'zod';
import { scheduledMeetingService } from '@/(server)/_features/scheduled-meeting/service';

const createScheduledMeetingRequestSchema = z.object({
  title: z.string().max(255),
  description: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  maximumSlots: z.number().max(100).int().optional(),
  emails: z.array(z.string().email()).max(100).optional(),
});

export async function POST(request: Request) {
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
    const response = await getCurrentAuthenticated(requestToken?.value || '');
    const user = response.data ? response.data : null;

    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          ok: false,
          message:
            'User not found, please check if token is provided in the cookie is valid',
        },
        { status: 401 }
      );
    }

    const { title, description, startTime, endTime, maximumSlots, emails } =
      createScheduledMeetingRequestSchema.parse(await request.json());

    if (!startTime || !endTime || endTime < startTime) {
      return NextResponse.json(
        {
          code: 400,
          ok: false,
          message: 'Invalid start time and end time',
        },
        { status: 400 }
      );
    }

    const scheduledMeeting =
      await scheduledMeetingService.createScheduledMeeting(
        {
          title,
          description,
          startTime,
          endTime,
          maximumSlots,
          emails: [],
          createdBy: user.id,
        },
        {
          userID: user.id,
          name: user.name,
          email: user.email,
        },
        emails
      );

    return NextResponse.json(
      {
        code: 201,
        ok: true,
        data: scheduledMeeting,
        message: 'success',
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          code: 400,
          ok: false,
          message: e.errors,
        },
        { status: 400 }
      );
    }

    Sentry.captureException(e);

    return NextResponse.json(
      {
        code: 500,
        message: 'internal server error',
        ok: false,
      },
      { status: 500 }
    );
  }
}
