import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { room } from '@/_shared/utils/sdk';
import RoomContainer from '@/_features/room/components/container';
import { getOriginServerSide } from '@/_shared/utils/get-origin-server-side';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { CreateJoinRoomResponse } from '@/_shared/response/internal/room';

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
  try {
    const response: CreateJoinRoomResponse = await InternalApiFetcher.get(
      `/api/rooms/join?roomID=${params.roomId}`
    );

    const roomData = response.data;

    if (!roomData || !roomData.roomId) {
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
  } catch (e) {
    notFound();
  }
}
