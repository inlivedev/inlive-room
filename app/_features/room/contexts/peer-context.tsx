'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ClientType } from '@/_shared/types/client';
import { clientSDK } from '@/_shared/utils/sdk';

type Peer = Awaited<ReturnType<typeof clientSDK.createPeer>>;

const PeerContext = createContext({
  peer: null as Peer | null,
});

export const usePeerContext = () => {
  return useContext(PeerContext);
};

type PeerProviderProps = {
  children: React.ReactNode;
  roomID: string;
  client: ClientType.ClientData;
};

export function PeerProvider({ children, roomID, client }: PeerProviderProps) {
  const [peerState, setPeerState] = useState<Peer | null>(null);

  useEffect(() => {
    if (!peerState) {
      const createPeer = async () => {
        const peer = await clientSDK.createPeer(roomID, client.clientID);
        setPeerState(peer);
      };

      createPeer();
    }

    return () => {
      if (peerState) {
        peerState.disconnect();
        setPeerState(null);
      }
    };
  }, [roomID, client.clientID, peerState]);

  return (
    <PeerContext.Provider
      value={{
        peer: peerState,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}
