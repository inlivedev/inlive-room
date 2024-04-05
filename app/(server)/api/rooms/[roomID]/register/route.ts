import { roomService } from '@/(server)/api/_index';
import { NextResponse, type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { Error403, Error404 } from '@/(server)/_features/room/errors';

interface RegisterClientRequest {
  uid?: string;
  name?: string;
  clientID?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomID: string } }
) {
  const reqBody = (await request.json()) as RegisterClientRequest | undefined;

  if (!reqBody)
    return NextResponse.json({
      code: 400,
      message: 'invalid request body, please check again',
    });

  if (!reqBody.name)
    return NextResponse.json({ code: 400, message: 'name is empty' });

  try {
    const clientData = await roomService.createClient(
      params.roomID,
      reqBody.name,
      reqBody.clientID
    );

    return NextResponse.json(
      {
        code: 200,
        message: 'Client has been successfully registered',
        data: clientData,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    if (error instanceof Error) {
      if (Error404.includes(error)) {
        return NextResponse.json(
          { code: 404, message: error.message },
          { status: 404 }
        );
      }

      if (Error403.includes(error)) {
        return NextResponse.json(
          { code: 403, message: error.message },
          { status: 403 }
        );
      }

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
