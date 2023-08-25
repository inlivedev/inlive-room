import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { room } from '@/_shared/utils/sdk';
import RoomContainer from '@/_features/room/containers/room-container';
import { getOriginServerSide } from '@/_shared/utils/get-origin-server-side';
import { getHostCookie } from '@/_features/room/server-actions/cookie-action';

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

export default async function Page({ params: { roomId } }: PageProps) {
  const response = await room.getRoom(roomId);

  if (!response.data.roomId) {
    notFound();
  }

  return (
    <RoomContainer
      roomId={response.data.roomId}
      origin={getOriginServerSide()}
      host={getHostCookie()}
    />
  );
}
