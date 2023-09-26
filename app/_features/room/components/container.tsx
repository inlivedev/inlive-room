'use client';

import View from '@/_features/room/components/view';
import { PeerProvider } from '@/_features/room/contexts/peer-context';
import type { AuthType } from '@/_shared/types/auth';
import AuthProvider from '@/_shared/providers/auth';

export default function Container({
  roomId,
  clientId,
  origin,
  currentUser,
}: {
  roomId: string;
  clientId: string;
  origin: string;
  currentUser: AuthType.UserData | undefined;
}) {
  return (
    <AuthProvider value={{ currentUser: currentUser }}>
      <PeerProvider roomId={roomId} clientId={clientId}>
        <View roomId={roomId} origin={origin} />
      </PeerProvider>
    </AuthProvider>
  );
}
