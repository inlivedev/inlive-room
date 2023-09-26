import { roomRoutesHandler } from '@/(server)/_features/room/routes';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
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
    return;
  }

  try {
    const createdRoom = await roomRoutesHandler.createRoomHandler(
      requestToken.value
    );

    return NextResponse.json(
      {
        code: 201,
        message: 'Room Created',
        data: createdRoom,
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
