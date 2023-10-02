import { roomRoutesHandler } from '@/(server)/_features/room/routes';
import { NextResponse } from 'next/server';

interface CreateReq {
  name: string;
}

export async function POST(
  req: Request,
  { params }: { params: { roomID: string } }
) {
  const body = (await req.json()) as CreateReq;

  if (!body.name) {
    return NextResponse.json({
      code: 400,
      message: 'Name is missing from request',
    });
  }

  await roomRoutesHandler.registerClientHandler(params.roomID, body.name);
}
