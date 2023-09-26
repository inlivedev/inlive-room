'use client';

import { PeerProvider } from '@/_features/room/contexts/peer-context';

export default function Container({
  roomId,
  clientId,
  children,
}: {
  roomId: string;
  clientId: string;
  children: React.ReactNode;
}) {
  return (
    <PeerProvider roomId={roomId} clientId={clientId}>
      {children}
    </PeerProvider>
  );
}
