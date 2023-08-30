import RoomContainer from '@/_features/room/components/room-container';
import { ParticipantProvider } from '@/_features/room/contexts/participant-context';

export default function Conference({
  roomId,
  clientId,
  mediaStream,
}: {
  roomId: string;
  clientId: string;
  mediaStream: MediaStream;
}) {
  return (
    <ParticipantProvider mediaStream={mediaStream}>
      <RoomContainer roomId={roomId} clientId={clientId} />
    </ParticipantProvider>
  );
}
