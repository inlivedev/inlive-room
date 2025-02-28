import { roomService } from '@/(server)/api/_index';
import { NextResponse, type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { ServiceError } from '@/(server)/_features/_service';

interface RegisterClientRequest {
  uid?: string;
  name?: string;
  clientID?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomID: string }> }
) {
  const reqBody = (await request.json()) as RegisterClientRequest | undefined;

  if (!reqBody)
    return NextResponse.json({
      code: 400,
      message: 'invalid request body, please check again',
    });

  // if (!reqBody.name)
  //   return NextResponse.json({ code: 400, message: 'name is empty' });

  try {
    const clientData = await roomService.createClient(
      (
        await params
      ).roomID,
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
    if (error instanceof ServiceError) {
      return NextResponse.json(
        {
          code: error.code,
          message: error.message,
        },
        { status: error.code }
      );
    }

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
