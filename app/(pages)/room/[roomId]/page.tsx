import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RoomContainer from '@/_features/room/components/room-container';
import RoomLayout from '@/_features/room/components/room-layout';
import { registerClient } from '@/_features/room/modules/factory';

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
  if (!roomId) {
    notFound();
  }

  const client = await registerClient(roomId);

  return (
    <RoomContainer roomId={roomId} clientId={client.clientId}>
      <div className="bg-neutral-900 text-neutral-200">
        <RoomLayout roomId={roomId} clientId={client.clientId} />
      </div>
    </RoomContainer>
  );
}
