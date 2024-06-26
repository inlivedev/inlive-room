import { NextRequest, NextResponse } from 'next/server';
import { eventRepo, eventService } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import {
  countGuestParticipant,
  countParticipants,
  countRegisteredParticipant,
} from '@/(server)/_features/activity-log/repository';
import { EventType } from '@/_shared/types/event';

export async function GET(
  request: NextRequest,
  { params }: { params: { slugOrId: string } }
) {
  const slug = params.slugOrId;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
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

    const response = await getCurrentAuthenticated(requestToken?.value || '');
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
    const existingEvent = await eventService.getEventBySlugOrID(slug, user.id);

    if (!existingEvent) {
      return NextResponse.json(
        {
          code: 404,
          message: 'event not found',
        },
        { status: 404 }
      );
    }

    if (existingEvent.createdBy !== user.id) {
      return NextResponse.json(
        {
          code: 403,
          message: 'forbidden',
        },
        { status: 403 }
      );
    }

    if (existingEvent.endTime > new Date()) {
      return NextResponse.json(
        {
          code: 400,
          message: 'event has not ended yet',
        },
        { status: 400 }
      );
    }

    if (!existingEvent.roomId) {
      return NextResponse.json(
        {
          code: 400,
          message: 'event has no room',
        },
        { status: 400 }
      );
    }

    const registered = (await eventRepo.countRegistiree(existingEvent?.id))
      .value;
    const attended = (await countRegisteredParticipant(existingEvent.roomId))
      .value;
    const registeredAttendance = await eventRepo.getFullyAttendedParticipant(
      existingEvent?.id,
      80
    );
    const guest = (await countGuestParticipant(existingEvent.roomId)).value;
    const total = (await countParticipants(existingEvent.roomId)).value;

    const data: EventType.GetStatsResponse['data'] = {
      count: {
        registered: registered || 0,
        totalJoined: total,
        attended: attended || 0,
        fullyAttended: registeredAttendance.attendedCount || 0,
        guest: guest || 0,
      },
      percentage: {
        attended: `${
          registered ? ((attended / registered) * 100).toFixed(1) : '0'
        }`,
        fullyAttended: `${
          registered
            ? ((registeredAttendance.attendedCount / registered) * 100).toFixed(
                1
              )
            : '0'
        }`,
      },
    };

    return NextResponse.json({
      code: 200,
      data: data,
    });
  } catch (error) {
    console.log(error);
    const response = {
      code: 500,
      message: 'an error has occured on our side please try again later',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
