'use client';

import { PeerProvider } from '@/_features/room/contexts/peer-context';

export default function Container({
  pageId,
  roomId,
  clientId,
  children,
}: {
  pageId: string;
  roomId: string;
  clientId: string;
  children: React.ReactNode;
}) {
  return (
    <PeerProvider pageId={pageId} roomId={roomId} clientId={clientId}>
      {children}
    </PeerProvider>
  );
}
