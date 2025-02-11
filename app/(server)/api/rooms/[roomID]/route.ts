import { ServiceError } from '@/(server)/_features/_service';
import { defaultLogger } from '@/(server)/_shared/logger/logger';
import { roomService } from '@/(server)/api/_index';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const fetchCache = 'default-no-store';

/**
 * Join endpoints to check if room exist in database, and check if room is created in remote
 */
export async function GET(
  _: Request,
  { params }: { params: { roomID: string } }
) {
  const roomID = params.roomID;
  try {
    const res = await roomService.joinRoom(roomID);

    if (!res) {
      // set status code to 404
      return NextResponse.json(
        {
          code: 404,
          message: 'Room not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        code: 200,
        message: 'Room found',
        data: res,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        {
          code: error.code,
          ok: false,
          message: error.message,
        },
        { status: error.code }
      );
    }

    defaultLogger.captureException(error);
    return NextResponse.json(
      {
        code: 500,
        ok: false,
        message: 'An error has occured on our side please try again later',
      },
      { status: 500 }
    );
  }
}
