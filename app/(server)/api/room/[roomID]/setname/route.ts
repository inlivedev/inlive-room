import { roomRoutesHandler } from '@/(server)/_features/room/routes';
import { isError } from 'lodash-es';

import { NextRequest, NextResponse } from 'next/server';

interface UpdateClientName {
  name: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { roomID: string; clientID: string } }
) {
  try {
    const body = (await request.json()) as UpdateClientName;

    const updatedClient = await roomRoutesHandler.updateClientNameHandler(
      params.roomID,
      params.clientID,
      body.name
    );

    return NextResponse.json({ code: 200, data: updatedClient });
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
