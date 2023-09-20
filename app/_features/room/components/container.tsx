'use client';

import View from '@/_features/room/components/view';
import { PeerProvider } from '@/_features/room/contexts/peer-context';
import { NextUIProvider } from '@nextui-org/react';

export default function Container({
  roomId,
  clientId,
  origin,
}: {
  roomId: string;
  clientId: string;
  origin: string;
}) {
  return (
    <PeerProvider roomId={roomId} clientId={clientId}>
      <NextUIProvider>
        <View roomId={roomId} origin={origin} />
      </NextUIProvider>
    </PeerProvider>
  );
}
