import { NextRequest, NextResponse } from 'next/server';
import { eventRepo, eventService } from '@/(server)/api/_index';
import { isError } from 'lodash-es';
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
        registered_users: countRegistirees || 0,
        joined_users: countUser || 0,
        joined_guests: countGuest || 0,
        percentage_joined: percentageJoined || 0,
        percentage_guest: percentageGuest || 0,
      },
    });
  } catch (error) {
    if (!isError(error)) {
      const response = {
        code: 500,
        message: 'an error has occured on our side please try again later',
      };

      return NextResponse.json(response, { status: 500 });
    }

    const response = {
      code: 500,
      message: error.message,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
