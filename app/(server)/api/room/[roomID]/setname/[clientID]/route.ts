import { roomRoutesHandler } from '@/(server)/_features/room/routes';

import { NextRequest, NextResponse } from 'next/server';

type SetClientName = {
  name: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { roomID: string; clientID: string } }
) {
  try {
    const body = (await request.json()) as SetClientName;

    const response = await roomRoutesHandler.setClientNameHandler(
      params.roomID,
      params.clientID,
      body.name
    );

    return NextResponse.json(
      {
        code: 200,
        ok: true,
        message: 'OK',
        data: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    const response = {
      code: 500,
      ok: false,
      message: 'An error has occured on our side please try again later',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
