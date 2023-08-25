import RoomContainer from '@/_features/room/components/room-container';

export default function Conference({
  roomId,
  clientId,
}: {
  roomId: string;
  clientId: string;
}) {
  return <RoomContainer roomId={roomId} clientId={clientId} />;
}
