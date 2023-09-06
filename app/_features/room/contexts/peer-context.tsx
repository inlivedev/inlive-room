'use client';

import { createContext, useContext } from 'react';
import { useCreatePeer } from '@/_features/room/hooks/use-create-peer';

type Peer = ReturnType<typeof useCreatePeer>;

const defaultValue = {
  roomId: '',
  clientId: '',
  peer: null as Peer | null,
};

const PeerContext = createContext(defaultValue);

export const usePeerContext = () => {
  return useContext(PeerContext);
};

type PeerProviderProps = {
  children: React.ReactNode;
  roomId: string;
  clientId: string;
};

export function PeerProvider({
  children,
  roomId,
  clientId,
}: PeerProviderProps) {
  const peer = useCreatePeer(roomId, clientId);

  return (
    <PeerContext.Provider
      value={{
        roomId: roomId,
        clientId: clientId,
        peer: peer,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}
