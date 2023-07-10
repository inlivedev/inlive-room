import { notFound } from 'next/navigation';
import RoomLayout from '@/_features/room/components/room-layout';

type PageProps = {
  params: {
    roomId: string;
  };
};

export default function Page({ params: { roomId } }: PageProps) {
  if (!roomId) {
    notFound();
  }

  return (
    <div className="bg-neutral-900 text-neutral-200">
      <RoomLayout roomId={roomId} />
    </div>
  );
}
