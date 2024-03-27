import { NextRequest, NextResponse } from 'next/server';
import { eventRepo, eventService } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import {
  countGuestParticipant,
  countRegisteredParticipant,
} from '@/(server)/_features/activity-log/repository';

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
    const countUser = (await countRegisteredParticipant(existingEvent.roomId))
      .value;
    const countGuest = (await countGuestParticipant(existingEvent.roomId))
      .value;
    const totalJoined = countGuest + countUser;

    const percentageJoined =
      totalJoined > 0 && countRegistirees > 0
        ? (totalJoined / countRegistirees) * 100
        : 0;
    const percentageGuest =
      countGuest > 0 && totalJoined > 0 ? (countGuest / totalJoined) * 100 : 0;

    const registeredAttendance =
      await eventRepo.getParticipantAttendancePercentage(existingEvent?.id);

    return NextResponse.json({
      code: 200,
      data: {
        registeredUsers: countRegistirees || 0,
        totalJoined: countGuest + countUser || 0,
        joinedUsers: countUser || 0,
        joinedGuests: countGuest || 0,
        percentageJoined:
          percentageJoined > 0 ? percentageJoined.toFixed(2) : 0,
        percentageGuest: percentageGuest > 0 ? percentageGuest.toFixed(2) : 0,
        percentageRegisteredJoined: registeredAttendance.attendedCount || 0,
        registeredAttenance: registeredAttendance || [],
      },
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
