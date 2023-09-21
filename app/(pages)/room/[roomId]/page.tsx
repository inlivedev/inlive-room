import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { room } from '@/_shared/utils/sdk';
import RoomContainer from '@/_features/room/components/container';
import { getOriginServerSide } from '@/_shared/utils/get-origin-server-side';
import { InternalAPIFetcher } from '@/_shared/utils/api';
import { Room } from '@/(server)/api/room/interface';

type PageProps = {
  params: {
    roomId: string;
  };
};

export const generateMetadata = ({ params }: PageProps): Metadata => {
  return {
    title: `Room - ${params.roomId}`,
  };
};

export default async function Page({ params }: PageProps) {
  const response = await InternalAPIFetcher.get(
    `/api/rooms/join?roomID=${params.roomId}`
  );

  if (typeof response == 'string') {
    alert('Failed when joining a room. Please try again later! ');
    console.log(
      `Failed when decoding request response, got response : ${response}`
    );
    return;
  }

  const roomData = response.body?.data as Room;

  if (!roomData.roomId) {
    notFound();
  }

  const {
    data: { clientId },
  } = await room.createClient(roomData.roomId);

  const origin = getOriginServerSide();

  return (
    <RoomContainer
      roomId={roomData.roomId}
      clientId={clientId}
      origin={origin}
    />
  );
}
