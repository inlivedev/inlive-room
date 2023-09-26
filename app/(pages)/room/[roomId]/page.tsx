import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { room } from '@/_shared/utils/sdk';
import RoomContainer from '@/_features/room/components/container';
import { getOriginServerSide } from '@/_shared/utils/get-origin-server-side';
import { getClientAuth } from '@/_shared/utils/get-client-auth';

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
  const {
    data: { roomId },
  } = await room.getRoom(params.roomId);

  if (!roomId) {
    notFound();
  }

  const currentAuth = await getClientAuth();
  const currentUser = currentAuth.data ? currentAuth.data : undefined;

  const {
    data: { clientId },
  } = await room.createClient(roomId);

  const origin = getOriginServerSide();

  return (
    <RoomContainer
      roomId={roomId}
      clientId={clientId}
      origin={origin}
      currentUser={currentUser}
    />
  );
}
