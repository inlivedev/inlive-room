import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { roomService } from '../../_index';

type createRoomRequest = {
  type: roomType;
};

type roomType = 'meeting' | 'event';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  try {
    const response = await getCurrentAuthenticated(requestToken?.value || '');

    if (!response.ok || !response.data.id) {
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

    const meetingRoom = await roomService.createRoom(
      response.data.id,
      body.type
    );

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
