import { apiResponse } from '../../../_shared/types';
import { roomRoutesHandler } from '../../../_features/room/routes';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  if (!requestToken) {
    NextResponse.json(
      {
        code: 401,
        message: 'Please check if token is provided in the cookie',
      } as apiResponse,
      { status: 401 }
    );
    return;
  }

  try {
    const createdRoom = await roomRoutesHandler.createRoomHandler(
      requestToken.value
    );

    NextResponse.json(
      {
        code: 201,
        message: 'Room Created',
        data: createdRoom,
      } as apiResponse,
      { status: 201 }
    );
  } catch (e) {
    NextResponse.json(
      {
        code: 500,
        message: 'An error has occured on our side, please try again later',
      } as apiResponse,
      { status: 500 }
    );
  }
}
