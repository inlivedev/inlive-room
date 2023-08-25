'use client';

import ClientContainer from '@/_features/room/containers/client-container';
import CookieContainer from '@/_features/room/containers/cookie-container';
import Layout from '@/_features/room/layout/layout';

export default function RoomContainer({
  roomId,
  origin,
  host,
}: {
  roomId: string;
  origin: string;
  host: boolean;
}) {
  return (
    <ClientContainer roomId={roomId}>
      {({ client }) => (
        <CookieContainer>
          <Layout
            roomId={roomId}
            clientId={client.clientId}
            host={host}
            origin={origin}
          />
        </CookieContainer>
      )}
    </ClientContainer>
  );
}
