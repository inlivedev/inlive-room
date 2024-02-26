import { roomService } from '@/(server)/api/_index';
import { isError } from 'lodash-es';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Join endpoints to check if room exist in database, and check if room is created in remote
 */
export async function GET(
  _: Request,
  { params }: { params: { roomID: string } }
) {
  const roomID = params.roomID;
  try {
    const existingRoom = await roomService.joinRoom(roomID);

    if (!existingRoom) {
      return NextResponse.json({
        code: 404,
        message: 'Room not found',
      });
    }

    return NextResponse.json(
      {
        code: 200,
        message: 'Room found',
        data: existingRoom,
      },
      { status: 200 }
    );
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
