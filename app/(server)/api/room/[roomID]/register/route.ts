import { roomRoutesHandler } from '@/(server)/_features/room/routes';
import { isError } from 'lodash-es';
import { NextResponse } from 'next/server';

interface RegisterClientReq {
  name: string;
}

export async function POST(
  req: Request,
  { params }: { params: { roomID: string } }
) {
  const body = (await req.json()) as RegisterClientReq;

  if (!body.name) {
    return NextResponse.json({
      code: 400,
      message: 'Name is missing from request',
    });
  }

  try {
    const clientData = await roomRoutesHandler.registerClientHandler(
      params.roomID,
      body.name
    );

    return NextResponse.json({
      code: 200,
      message: 'client registered',
      data: clientData,
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
