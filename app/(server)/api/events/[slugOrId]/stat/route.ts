import { NextRequest, NextResponse } from 'next/server';
import { eventRepo, eventService } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import {
  countJoinedGuest,
  countJoinedUser,
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
    const countUser = (await countJoinedUser(existingEvent.roomId)).value;
    const countGuest = (await countJoinedGuest(existingEvent.roomId)).value;
    const percentageJoined =
      ((countGuest + countUser) / countRegistirees) * 100;
    const percentageGuest = (countGuest / (countGuest + countUser)) * 100;

    return NextResponse.json({
      code: 200,
      data: {
        registeredUsers: countRegistirees || 0,
        joinedUsers: countUser || 0,
        joinedGuests: countGuest || 0,
        percentageJoined: percentageJoined ? percentageJoined.toFixed(2) : 0,
        percentageGuest: percentageGuest ? percentageGuest.toFixed(2) : 0,
      },
    });
  } catch (error) {
    const response = {
      code: 500,
      message: 'an error has occured on our side please try again later',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
