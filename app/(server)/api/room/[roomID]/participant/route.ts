import { roomRoutesHandler } from '@/(server)/_features/room/routes';
import { isError } from 'lodash-es';
import { NextRequest, NextResponse } from 'next/server';

interface GetParticipantReq {
  clientIDs: string[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomID: string } }
) {
  const body = (await req.json()) as GetParticipantReq;
  const searchParams = req.nextUrl.searchParams;
  const getAll = searchParams.get('all');

  if (!body.clientIDs) {
    return NextResponse.json({
      code: 400,
      message: 'clientIDs is missing from request',
    });
  }
  try {
    const participantData = await roomRoutesHandler.getClientHandler(
      params.roomID,
      body.clientIDs,
      getAll == 'true'
    );

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
