import { roomService } from '@/(server)/api/_index';
import { NextResponse, type NextRequest } from 'next/server';

interface RegisterClientRequest {
  uid?: string;
  name?: string;
  joinID?: string;
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
      reqBody.uid,
      reqBody.joinID
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
