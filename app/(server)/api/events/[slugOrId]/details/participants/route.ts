import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { eventRepo, eventService } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  const slugOrId = params.slugOrId;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');

  try {
    if (!requestToken) {
      return NextResponse.json(
        {
          code: 401,
          message: 'please check your authentication token',
        },
        { status: 401 }
      );
    }

    const response = await getCurrentAuthenticated(requestToken?.value);
    const user = response.data ? response.data : null;

    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          message: 'unauthorized',
        },
        { status: 401 }
      );
    }

    const event = await eventService.getEventBySlugOrID(slugOrId);

    if (!event) {
      return NextResponse.json(
        {
          code: 404,
          message: 'event not found',
        },
        { status: 404 }
      );
    }

    const res = await eventRepo.getAllParticipantsByEventId(
      event.id,
      limit,
      page
    );

    if (!res) {
      return NextResponse.json(
        {
          code: 404,
          message: 'participants not found',
        },
        { status: 404 }
      );
    }

    const registeredAttendanceMap = new Map<
      string,
      { isAttended: boolean; joinDuration: number }
    >();
    const registeredAttendance =
      await eventRepo.getParticipantAttendancePercentage(event.id);
    registeredAttendance.participant.forEach((participant) => {
      registeredAttendanceMap.set(participant.clientID, {
        isAttended: participant.isAttended,
        joinDuration: participant.joinDuration,
      });
    });

    res.data.forEach((participant) => {
      participant.isAttended = registeredAttendanceMap.get(
        participant.clientID
      )?.isAttended;
      participant.joinDuration = registeredAttendanceMap.get(
        participant.clientID
      )?.joinDuration;
    });

    return NextResponse.json(
      {
        data: res.data,
        meta: res.meta,
        message: 'success',
        ok: true,
      },
      { status: 200 }
    );
  } catch (e) {
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
