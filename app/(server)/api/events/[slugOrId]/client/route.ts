import { selectParticipant } from '@/(server)/_features/event/schema';
import { EventParticipant } from '@/(server)/_features/event/service';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { eventService } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  const slugOrId = decodeURIComponent(params.slugOrId);
  const requestToken = cookies().get('token');

  if (!requestToken) {
    return NextResponse.json(
      {
        code: 401,
        message: 'Please check if token is provided in the cookie',
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
        ok: false,
        message:
          'User not found, please check if token is provided in the cookie is valid',
      },
      { status: 401 }
    );
  }

  try {
    const participant: EventParticipant | undefined =
      await eventService.getParticipantByEmail(user.email, slugOrId);

    if (!participant) {
      return NextResponse.json(
        {
          code: 404,
          ok: false,
          message: 'Participant not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        code: 200,
        ok: true,
        data: participant,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        code: 500,
        ok: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
