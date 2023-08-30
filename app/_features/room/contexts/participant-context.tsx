'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Participant } from '@/_shared/sdk/room/participant/participant-types';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

const defaultValue = {
  participants: [] as Participant[],
};

const ParticipantContext = createContext(defaultValue);

export const useParticipantContext = () => {
  return useContext(ParticipantContext);
};

export function ParticipantProvider({
  children,
  mediaStream,
}: {
  children: React.ReactNode;
  mediaStream: MediaStream;
}) {
  const { peer } = usePeerContext();
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (peer) {
      // mediaStream
      // peer.addParticipant()
      // const peerParticipants = peer.getAllParticipants();
      // setParticipants(peerParticipants);
    }
  }, [peer]);

  return (
    <ParticipantContext.Provider
      value={{
        participants,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
}
