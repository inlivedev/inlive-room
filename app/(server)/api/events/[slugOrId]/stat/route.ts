import { NextRequest, NextResponse } from 'next/server';
import { eventRepo, eventService } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import {
  countGuestParticipant,
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

    const countRegistirees = (
      await eventRepo.countRegistiree(existingEvent?.id)
    ).value;
    const countRegisteredJoin = (
      await countRegisteredParticipant(existingEvent.roomId)
    ).value;
    const countGuestJoin = (await countGuestParticipant(existingEvent.roomId))
      .value;
    const totalJoined = countGuestJoin + countRegisteredJoin;

    const registeredAttendance =
      await eventRepo.getParticipantAttendancePercentage(existingEvent?.id);

    const data: EventType.Stat['data'] = {
      count: {
        registeree: countRegistirees || 0,

        totalJoined: totalJoined,
        registereeJoin: countRegisteredJoin || 0,
        guestsJoin: countGuestJoin || 0,

        registeredAttendance: registeredAttendance.attendedCount || 0,
      },
      percentage: {
        guestCountJoin: ((countGuestJoin / totalJoined) * 100).toFixed(2),
        registeredCountJoin: (
          (countRegisteredJoin / totalJoined) *
          100
        ).toFixed(2),
        registeredCountRegisteree: (
          (countRegisteredJoin / countRegistirees) *
          100
        ).toFixed(2),
        registeredAttendCountJoin: (
          (registeredAttendance.attendedCount / totalJoined) *
          100
        ).toFixed(2),
        registeredAttendCountRegisteree: (
          (registeredAttendance.attendedCount / countRegistirees) *
          100
        ).toFixed(2),
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
