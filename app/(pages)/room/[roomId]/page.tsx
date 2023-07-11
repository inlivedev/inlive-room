import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RoomContainer from '@/_features/room/components/room-container';
import RoomLayout from '@/_features/room/components/room-layout';

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

export default function Page({ params: { roomId } }: PageProps) {
  if (!roomId) {
    notFound();
  }

  return (
    <RoomContainer roomId={roomId}>
      <div className="bg-neutral-900 text-neutral-200">
        <RoomLayout roomId={roomId} />
      </div>
    </RoomContainer>
  );
}
