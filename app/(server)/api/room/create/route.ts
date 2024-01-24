import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { roomService } from '../../_index';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { type AuthType } from '@/_shared/types/auth';

type createRoomRequest = {
  type: roomType;
};

type roomType = 'meeting' | 'event';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  try {
    const response: AuthType.CurrentAuthResponse = await InternalApiFetcher.get(
      '/api/auth/current',
      {
        headers: {
          Authorization: `Bearer ${requestToken?.value || ''}`,
        },
        cache: 'no-cache',
      }
    );

    const user = response.data ? response.data : null;

    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          ok: false,
          message: 'Please check if token is provided in the cookie',
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as createRoomRequest;

    if (body.type !== 'event' && body.type !== 'meeting') {
      return NextResponse.json(
        {
          code: 400,
          message: 'Invalid room type, please check the request body',
        },
        { status: 400 }
      );
    }

    const meetingRoom = await roomService.createRoom(user.id, body.type);

    return NextResponse.json(
      {
        code: 201,
        message: 'Room Created',
        data: meetingRoom,
      },
      { status: 201 }
    );
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      {
        code: 500,
        message: `An error has occured on our side, please try again later : ${error.message}`,
      },
      { status: 500 }
    );
  }
}
