import { scheduledMeetingService } from '@/(server)/_features/scheduled-meeting/service';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eventRepo } from '../../_index';
import { defaultLogger } from '@/(server)/_shared/logger/logger';

const updateScheduledMeetingRequestSchema = z.object({
  id: z.number().optional(),
  slug: z.string().optional(),
  title: z.string().max(255),
  description: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  maximumSlots: z.number().max(100).int().optional(),
  emails: z.array(z.string().email()).max(100).optional(),
});

const ENABLE_EDIT_MEETING =
  process.env.NEXT_PUBLIC_ENABLE_EDIT_MEETING == 'true';

export async function PUT(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  if (!ENABLE_EDIT_MEETING) {
    return NextResponse.json(
      {
        code: 400,
        message: 'feature not enabled',
      },
      {
        status: 400,
      }
    );
  }

  const slugOrID = decodeURIComponent(params.slugOrId);
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

    const existingEvent = await eventRepo.getBySlugOrID(slugOrID);

    if (!existingEvent) {
      return NextResponse.json(
        {
          code: 404,
          message: 'Meeting not found',
        },
        { status: 404 }
      );
    }

    if (existingEvent.createdBy != user.id) {
      return NextResponse.json(
        {
          code: 404,
          message: 'Scheduled Meeting not found',
        },
        {
          status: 404,
        }
      );
    }

    if (existingEvent.category.name != 'meetings') {
      return NextResponse.json(
        {
          code: 400,
          message: 'Make sure event is Scheduled Meeting',
        },
        {
          status: 400,
        }
      );
    }

    const { title, description, startTime, endTime, maximumSlots, emails } =
      updateScheduledMeetingRequestSchema.parse(await request.json());

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
      await scheduledMeetingService.updateScheduledMeeting(
        {
          title,
          description,
          startTime,
          endTime,
          maximumSlots,
          createdBy: user.id,
          id: existingEvent.id,
          slug: existingEvent.slug,
        },
        {
          userID: user.id,
          name: user.name,
          email: user.email,
        },
        emails || []
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
    defaultLogger.captureException(e);

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

export async function DELETE(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  if (!ENABLE_EDIT_MEETING) {
    return NextResponse.json(
      {
        code: 400,
        message: 'feature not enabled',
      },
      {
        status: 400,
      }
    );
  }

  const slugOrID = decodeURIComponent(params.slugOrId);
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

    if (!user.accountId) {
      return NextResponse.json(
        {
          code: 400,
          ok: false,
          message: 'Feature not enabled',
        },
        { status: 401 }
      );
    }

    const deletedEvent = await scheduledMeetingService.cancelScheduledMeeting(
      slugOrID,
      user
    );

    if (!deletedEvent) {
      return NextResponse.json(
        {
          code: 404,
          message: 'Meeting not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        code: 200,
        ok: true,
        data: deletedEvent,
        message: 'success',
      },
      { status: 200 }
    );
  } catch (e) {
    defaultLogger.captureException(e);

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
