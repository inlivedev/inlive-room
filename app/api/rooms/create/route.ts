import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { room } from '@/_shared/utils/sdk';

export type ResponseBodyPOST = {
  code: number;
  ok: boolean;
  data: {
    roomId: string;
  };
};

export const POST = async () => {
  try {
    const newRoom = await room.createRoom();

    if (!newRoom.data.roomId) {
      throw new Error('Failed to create a room. Please try again later!');
    }

    cookies().set({
      name: 'host',
      value: 'true',
      httpOnly: true,
    });

    return NextResponse.json({
      code: newRoom.code,
      ok: newRoom.ok,
      data: newRoom.data,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
