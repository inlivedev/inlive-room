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

    if (typeof clientName !== 'string' || clientName.trim().length === 0) {
      return NextResponse.json({
        code: 400,
        ok: false,
        message: 'Name is not valid',
      });
    }

    if (typeof pathname !== 'string' || pathname.trim().length === 0) {
      return NextResponse.json({
        code: 400,
        ok: false,
        message: 'Current pathname is not valid',
      });
    }

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

    const thirtyDays = 1000 * 60 * 60 * 24 * 30;

    routeResponse.cookies.set({
      name: 'client_name',
      value: setNameResponse.name || clientName,
      path: pathname,
      sameSite: 'lax',
      maxAge: thirtyDays,
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
