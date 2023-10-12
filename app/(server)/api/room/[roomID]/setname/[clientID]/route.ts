import { roomRoutesHandler } from '@/(server)/_features/room/routes';

import { NextRequest, NextResponse } from 'next/server';

type SetClientName = {
  name: string;
  pathname: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { roomID: string; clientID: string } }
) {
  try {
    const body = (await request.json()) as SetClientName;
    const clientName = body.name;
    const pathname = body.pathname;

    const setNameResponse = await roomRoutesHandler.setClientNameHandler(
      params.roomID,
      params.clientID,
      clientName
    );

    const routeResponse = NextResponse.json(
      {
        code: 200,
        ok: true,
        message: 'OK',
        data: setNameResponse,
      },
      { status: 200 }
    );

    routeResponse.cookies.set({
      name: 'client_name',
      value: setNameResponse.name,
      path: pathname,
      sameSite: 'lax',
    });

    return routeResponse;
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
