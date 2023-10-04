import {
  Participant,
  roomRoutesHandler,
} from '@/(server)/_features/room/routes';
import { isError } from 'lodash-es';
import { NextRequest, NextResponse } from 'next/server';

interface GetParticipantReq {
  clientIDs: string[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomID: string } }
) {
  const searchParams = req.nextUrl.searchParams;
  const getAll = searchParams.get('all');

  try {
    let participantData: Participant[];
    if (getAll != 'true') {
      const body = (await req.json()) as GetParticipantReq;
      if (body.clientIDs.length == 0) {
        throw new Error('at least one clientID is required');
      }
      participantData = await roomRoutesHandler.getClientHandler(
        params.roomID,
        body.clientIDs
      );
    } else {
      participantData = await roomRoutesHandler.getAllClientHandler(
        params.roomID
      );
    }

    return NextResponse.json({
      code: 200,
      message: 'ok',
      data: participantData,
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
