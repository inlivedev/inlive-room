import { roomRoutesHandler } from '@/(server)/_features/room/routes';
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
      message: 'Client has been successfully registered',
      data: clientData,
    });
  } catch (error) {
    if (error instanceof Error) {
      const response = {
        code: 500,
        message: error.message,
      };

      return NextResponse.json(response, { status: 500 });
    }

    const response = {
      code: 500,
      message: 'An error has occured on the server, please try again later.',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
