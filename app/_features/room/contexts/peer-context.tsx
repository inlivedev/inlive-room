'use client';

import { createContext, useContext } from 'react';
import { useCreatePeer } from '@/_features/room/hooks/use-create-peer';
import type { ClientType } from '@/_shared/types/client';

type Peer = ReturnType<typeof useCreatePeer>;

const defaultValue = {
  roomID: '',
  peer: null as Peer | null,
  client: null as ClientType.ClientData | null,
};

const PeerContext = createContext(defaultValue);

export const usePeerContext = () => {
  return useContext(PeerContext);
};

type PeerProviderProps = {
  children: React.ReactNode;
  roomID: string;
  client: ClientType.ClientData;
};

export function PeerProvider({ children, roomID, client }: PeerProviderProps) {
  const peer = useCreatePeer(roomID, client.id);

  return (
    <PeerContext.Provider
      value={{
        roomID: roomID,
        peer: peer,
        client: client,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}
