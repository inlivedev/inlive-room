'use client';

import ClientContainer from '@/_features/room/containers/client-container';
import ViewContainer from '@/_features/room/containers/view-container';

export default function RoomContainer({
  roomId,
  origin,
}: {
  roomId: string;
  origin: string;
}) {
  return (
    <ClientContainer roomId={roomId}>
      {({ clientId }) => (
        <ViewContainer roomId={roomId} clientId={clientId} origin={origin} />
      )}
    </ClientContainer>
  );
}
